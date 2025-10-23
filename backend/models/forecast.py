from pathlib import Path
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from xgboost import XGBRegressor
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from tensorflow.keras.models import load_model
from fastapi import HTTPException
import joblib
import tensorflow as tf
import warnings
import sys
from datetime import datetime
import os


sys.path.append("C:/Users/Sakshi Singhania/Desktop/milestone2/Project/backend")
from config import DATA_PATH, MODEL_PATH_LSTM, TARGET, WINDOW, LSTM_FEATURES, MODEL_PATH_XGB

warnings.simplefilter(action='ignore', category=FutureWarning)

# ------------------------------
def evaluate(y_true, y_pred):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return {
        "MAE": round(np.mean(np.abs(y_true - y_pred)), 2),
        "RMSE": round(np.sqrt(np.mean((y_true - y_pred) ** 2)), 2),
        "MAPE": f"{round(np.mean(np.abs((y_true - y_pred) / y_true)) * 100, 2)}%",
        "Bias": round(np.mean(y_pred - y_true), 2)
    }

def normalize_forecast(df):
    df["upper_bound"] = df["predicted"] * 1.05
    df["lower_bound"] = df["predicted"] * 0.95
    df["date"] = pd.to_datetime(df["date"]).astype(str)
    return df

def sanitize_dataframe(df):
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df = df.where(pd.notnull(df), None)

    def safe_convert(val):
        if isinstance(val, float):
            if val is None or np.isnan(val) or np.isinf(val):
                return None
            if abs(val) > 1e308:
                return float(1e308) if val > 0 else float(-1e308)
            return float(val)
        if isinstance(val, (np.float32, np.float64)):
            return float(val)
        if isinstance(val, (np.int32, np.int64)):
            return int(val)
        return val

    return df.astype(object).applymap(safe_convert)

def filter_data(df, region, resource_type):
    df = df[(df["region"] == region) & (df["resource_type"] == resource_type)].sort_values("date")
    return df

# ------------------------------
def run_arima(df, horizon):
    try:
        train_size = int(len(df) * 0.8)
        train = df[:train_size].copy()
        model = ARIMA(train[TARGET], order=(5, 1, 0))
        model_fit = model.fit()

        historical_preds = model_fit.predict(start=train.index[0], end=train.index[-1])
        historical = df[["date", TARGET]].rename(columns={TARGET: "actual"})
        historical["predicted"] = historical_preds

        forecast = model_fit.forecast(steps=horizon)
        future_dates = pd.date_range(df["date"].max() + pd.Timedelta(days=1), periods=horizon)
        future = pd.DataFrame({"date": future_dates, "predicted": forecast})
        future["actual"] = None

        metrics = {}
        if historical["actual"].notna().sum() > 0:
            metrics = evaluate(historical["actual"].dropna(), historical["predicted"].dropna())

        return pd.concat([historical, future], ignore_index=True), metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ARIMA error: {str(e)}")

# ------------------------------
def run_xgboost(df, horizon):
    try:
        model = joblib.load(MODEL_PATH_XGB)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"XGBoost model load error: {str(e)}")

    df = df.sort_values("date").copy()
    df["date"] = pd.to_datetime(df["date"])

    encoders = {}
    df_encoded = df.copy()
    for col in df_encoded.select_dtypes(include="object").columns:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
        encoders[col] = le

    X = df_encoded.drop(columns=["date", TARGET])
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    y_preds = model.predict(X_scaled)
    historical = df[["date", TARGET]].rename(columns={TARGET: "actual"})
    historical["predicted"] = y_preds

    last_row = df.iloc[-1]
    future_rows = []

    for i in range(horizon):
        next_date = last_row["date"] + pd.Timedelta(days=1)
        input_row = last_row.copy()
        input_row["date"] = next_date
        input_df = pd.DataFrame([input_row])

        for col in input_df.select_dtypes(include="object").columns:
            if col in encoders:
                le = encoders[col]
                try:
                    input_df[col] = le.transform(input_df[col].astype(str))
                except ValueError as e:
                    raise HTTPException(status_code=500, detail=f"Label encoding error in column '{col}': {str(e)}")

        X_input = input_df.drop(columns=["date", TARGET])
        X_input_scaled = scaler.transform(X_input)

        try:
            y_pred = model.predict(X_input_scaled)[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"XGBoost prediction error: {str(e)}")

        new_row = {"date": next_date, TARGET: y_pred}
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        last_row = df.iloc[-1]
        future_rows.append({"date": next_date, "predicted": y_pred})

    future = pd.DataFrame(future_rows)
    future["actual"] = None

    metrics = {}
    if historical["actual"].notna().sum() > 0:
        metrics = evaluate(historical["actual"].dropna(), historical["predicted"].dropna())

    return pd.concat([historical, future], ignore_index=True), metrics

# ------------------------------
def run_lstm(df, horizon):
    try:
        model = load_model(MODEL_PATH_LSTM, compile=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model load error: {str(e)}")

    df = df.sort_values("date").dropna().reset_index(drop=True)

    missing = [f for f in LSTM_FEATURES if f not in df.columns]
    if missing:
        raise HTTPException(status_code=500, detail=f"Missing features: {missing}")

    scaler = MinMaxScaler()
    scaler.fit(df[LSTM_FEATURES])

    df_clean = df.copy()
    X_scaled = scaler.transform(df_clean[LSTM_FEATURES])
    X_seq = [X_scaled[i-WINDOW:i] for i in range(WINDOW, len(X_scaled))]
    X_seq = np.array(X_seq)
    y_preds = model.predict(X_seq).flatten()
    historical = df_clean[WINDOW:].copy()
    historical = historical[["date", TARGET]].rename(columns={TARGET: "actual"})
    historical["predicted"] = y_preds

    df_copy = df.copy()
    future_rows = []
    for _ in range(horizon):
        if len(df_copy) < WINDOW:
            raise HTTPException(status_code=500, detail="Insufficient data for LSTM window")

        X_seq = df_copy[-WINDOW:][LSTM_FEATURES]
        X_scaled = scaler.transform(X_seq)
        X_input = X_scaled.reshape(1, WINDOW, len(LSTM_FEATURES))

        y_pred = model.predict(X_input)[0][0]
        next_date = df_copy["date"].max() + pd.Timedelta(days=1)

        new_row = df_copy.iloc[-1][LSTM_FEATURES].to_dict()
        new_row["date"] = next_date
        new_row[TARGET] = y_pred

        df_copy = pd.concat([df_copy, pd.DataFrame([new_row])], ignore_index=True)
        future_rows.append({"date": next_date, "predicted": y_pred})

    future = pd.DataFrame(future_rows)
    future["actual"] = None

    metrics = {}
    if historical["actual"].notna().sum() > 0:
        metrics = evaluate(historical["actual"].dropna(), historical["predicted"].dropna())

    return pd.concat([historical, future], ignore_index=True), metrics


# ------------------------------
def forecast(region: str, service: str, model: str = "xgboost", horizon: int = 30) -> dict:
    print(f"Incoming request: region={region}, resource_type={service}, model={model}")
    try:
        df = pd.read_csv(DATA_PATH, parse_dates=["date"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data load error: {str(e)}")

    print(f"Available columns: {df.columns.tolist()}")
    df_filtered = filter_data(df, region, service)
    print(f"Filtered rows: {len(df_filtered)}")

    if df_filtered is None or len(df_filtered) < 50:
        raise HTTPException(status_code=404, detail=f"No data available for region={region}, resource_type={service}")

    model = model.lower()
    try:
        if model == "arima":
            forecast_df, metrics = run_arima(df_filtered, horizon)
        elif model == "xgboost":
            forecast_df, metrics = run_xgboost(df_filtered, horizon)
        elif model == "lstm":
            forecast_df, metrics = run_lstm(df_filtered, horizon)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model: {model}")
    except Exception as e:
        print(f"❌ Forecast model error: {e}")
        raise HTTPException(status_code=500, detail=f"Model execution failed: {str(e)}")

    print(f"Forecast columns: {forecast_df.columns.tolist()}")
    forecast_df = normalize_forecast(forecast_df)
    forecast_df = sanitize_dataframe(forecast_df)

    return {
        "forecast": forecast_df.to_dict(orient="records"),
        "metrics": metrics
    }


def get_valid_combinations():
    try:
        df = pd.read_csv(DATA_PATH)
        combos = df[["region", "resource_type"]].dropna().drop_duplicates()
        return combos.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading combinations: {str(e)}")
    

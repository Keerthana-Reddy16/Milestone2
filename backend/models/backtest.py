import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from statsmodels.tsa.arima.model import ARIMA
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

import sys
import os

# Dynamically add backend/ to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from config import LSTM_FEATURES
from models.evaluate import evaluate
import warnings

warnings.simplefilter(action='ignore', category=FutureWarning)

DATA_PATH = "data/processed/feature_engineered.csv"
TARGET = "usage_cpu"

def summarize_metrics(df):
    if "MAPE" not in df.columns or df.empty:
        return pd.DataFrame([{
            "MAE": None,
            "RMSE": None,
            "MAPE": "N/A",
            "STD_MAE": None,
            "STD_RMSE": None
        }])
    df["MAPE"] = df["MAPE"].astype(str).str.replace("%", "").astype(float)
    return pd.DataFrame([{
        "MAE": round(df["MAE"].mean(), 2),
        "RMSE": round(df["RMSE"].mean(), 2),
        "MAPE": f"{round(df['MAPE'].mean(), 2)}%",
        "STD_MAE": round(df["MAE"].std(), 2),
        "STD_RMSE": round(df["RMSE"].std(), 2)
    }])

def backtest_arima(df, window_size=30):
    df = df.sort_values("date")
    results = []

    for start in range(0, len(df) - window_size * 2, window_size):
        train = df.iloc[start:start + window_size]
        test = df.iloc[start + window_size:start + window_size * 2]

        try:
            model = ARIMA(train[TARGET], order=(5, 1, 0))
            model_fit = model.fit()
            y_pred = model_fit.forecast(steps=len(test))
            y_true = test[TARGET].values
            metrics = evaluate(y_true, y_pred)
            results.append(metrics)
        except Exception as e:
            print(f"ARIMA failed at window starting {train['date'].min()}: {e}")

    df_metrics = pd.DataFrame(results)
    return summarize_metrics(df_metrics)

def backtest_xgboost(df, window_size=30):
    df = df.sort_values("date")
    results = []

    for start in range(0, len(df) - window_size * 2, window_size):
        train = df.iloc[start:start + window_size]
        test = df.iloc[start + window_size:start + window_size * 2]

        X_train = train.drop(columns=["date", TARGET])
        y_train = train[TARGET]
        X_test = test.drop(columns=["date", TARGET])
        y_test = test[TARGET]

        for col in X_train.select_dtypes(include="object").columns:
            le = LabelEncoder()
            X_train[col] = le.fit_transform(X_train[col].astype(str))
            X_test[col] = le.transform(X_test[col].astype(str))

        scaler = MinMaxScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        try:
            model = XGBRegressor(n_estimators=100, learning_rate=0.1)
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            metrics = evaluate(y_test, y_pred)
            results.append(metrics)
        except Exception as e:
            print(f"XGBoost failed at window starting {train['date'].min()}: {e}")

    df_metrics = pd.DataFrame(results)
    return summarize_metrics(df_metrics)

def backtest_lstm(df, window_size=30):
    df = df.sort_values("date")
    model = load_model("models/lstm_model.h5", compile=False)
    model.compile(optimizer="adam", loss="mse")

    results = []

    for start in range(0, len(df) - window_size * 2, window_size):
        train = df.iloc[start:start + window_size]
        test = df.iloc[start + window_size:start + window_size * 2]

        try:
            # Select and clean features
            X_train = train[LSTM_FEATURES].dropna()
            X_test = test[LSTM_FEATURES].dropna()

            # Align labels with cleaned inputs
            y_train = train.loc[X_train.index, TARGET]
            y_test = test.loc[X_test.index, TARGET]

            # Skip if no valid rows remain
            if len(X_train) == 0 or len(X_test) == 0:
                print(f"⚠️ Skipping window starting {train['date'].min()} due to empty input after NaN removal.")
                continue

            # Scale and reshape
            scaler = MinMaxScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)

            if X_train_scaled.shape[1] != model.input_shape[-1]:
                print(f"❌ Feature mismatch: model expects {model.input_shape[-1]}, got {X_train_scaled.shape[1]}")
                continue

            X_train_reshaped = X_train_scaled.reshape(X_train_scaled.shape[0], 1, X_train_scaled.shape[1])
            X_test_reshaped = X_test_scaled.reshape(X_test_scaled.shape[0], 1, X_test_scaled.shape[1])

            # Predict and evaluate
            model.fit(X_train_reshaped, y_train, epochs=1, verbose=0)
            y_pred = model.predict(X_test_reshaped).flatten()
            metrics = evaluate(y_test, y_pred)
            results.append(metrics)

        except Exception as e:
            print(f"LSTM failed at window starting {train['date'].min()}: {e}")

    df_metrics = pd.DataFrame(results)
    return summarize_metrics(df_metrics)

if __name__ == "__main__":
    df = pd.read_csv(DATA_PATH, parse_dates=["date"])

    print("🔁 Running ARIMA backtest...")
    arima_summary = backtest_arima(df)
    arima_summary.to_csv("data/outputs/backtest_arima.csv", index=False)

    print("🔁 Running XGBoost backtest...")
    xgb_summary = backtest_xgboost(df)
    xgb_summary.to_csv("data/outputs/backtest_xgboost.csv", index=False)

    print("🔁 Running LSTM backtest...")
    lstm_summary = backtest_lstm(df)
    lstm_summary.to_csv("data/outputs/backtest_lstm.csv", index=False)

    print("✅ All backtests complete. Summary results saved.")
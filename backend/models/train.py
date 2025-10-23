import pandas as pd
import numpy as np
import joblib
import os
from xgboost import XGBRegressor
from statsmodels.tsa.arima.model import ARIMA
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
from config import DATA_PATH, MODEL_PATH_XGB, MODEL_PATH_LSTM, TARGET, WINDOW, LSTM_FEATURES

def train_model(model_name: str):
    print(f"🔁 Retraining model: {model_name}")
    df = pd.read_csv(DATA_PATH, parse_dates=["date"]).dropna()

    if model_name.lower() == "xgboost":
        X = df.drop(columns=["date", TARGET])
        y = df[TARGET]
        model = XGBRegressor(n_estimators=100, max_depth=5)
        model.fit(X, y)
        joblib.dump(model, MODEL_PATH_XGB)
        print("✅ XGBoost model retrained and saved.")

    elif model_name.lower() == "arima":
        try:
            model = ARIMA(df[TARGET], order=(5, 1, 0))
            model_fit = model.fit()
            joblib.dump(model_fit, "models/arima_model.pkl")
            print("✅ ARIMA model retrained and saved.")
        except Exception as e:
            print(f"❌ ARIMA training failed: {e}")

    elif model_name.lower() == "lstm":
        missing = [f for f in LSTM_FEATURES if f not in df.columns]
        if missing:
            print(f"❌ Missing features for LSTM: {missing}")
            return

        scaler = MinMaxScaler()
        df_scaled = scaler.fit_transform(df[LSTM_FEATURES])
        X_seq = []
        y_seq = []

        for i in range(WINDOW, len(df_scaled)):
            X_seq.append(df_scaled[i - WINDOW:i])
            y_seq.append(df[TARGET].iloc[i])

        X_seq = np.array(X_seq)
        y_seq = np.array(y_seq)

        model = Sequential()
        model.add(LSTM(64, input_shape=(WINDOW, len(LSTM_FEATURES))))
        model.add(Dense(1))
        model.compile(optimizer="adam", loss="mse")

        early_stop = EarlyStopping(monitor="loss", patience=5)
        model.fit(X_seq, y_seq, epochs=50, batch_size=16, verbose=0, callbacks=[early_stop])
        model.save(MODEL_PATH_LSTM)
        print("✅ LSTM model retrained and saved.")

    else:
        print(f"⚠️ Unsupported model: {model_name}")
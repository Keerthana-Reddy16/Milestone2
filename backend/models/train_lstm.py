import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import sys
sys.path.append("C:/Users/Sakshi Singhania/Desktop/milestone2/Project/backend")

from config import DATA_PATH, MODEL_PATH_LSTM, TARGET, WINDOW, LSTM_FEATURES
from models.forecast_store import set_model_output
from models.evaluate import evaluate

def preprocess(df, features, target):
    df = df.sort_values("date").dropna().reset_index(drop=True)
    X = df[features]
    y = df[target].astype(np.float32)

    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)

    X_seq, y_seq = [], []
    for i in range(WINDOW, len(X_scaled) - 1):
        X_seq.append(X_scaled[i-WINDOW:i])
        y_seq.append(y[i + 1])  # Predict next timestep

    return np.array(X_seq), np.array(y_seq), scaler

def build_model(input_shape):
    model = Sequential([
        LSTM(128, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(64),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model

def main():
    df = pd.read_csv(DATA_PATH, parse_dates=["date"])
    X, y, scaler = preprocess(df, LSTM_FEATURES, TARGET)
    model = build_model((WINDOW, len(LSTM_FEATURES)))
    model.fit(X, y, epochs=20, batch_size=32, validation_split=0.2)
    model.save(MODEL_PATH_LSTM)
    print(f"✅ LSTM model saved to {MODEL_PATH_LSTM}")

    y_pred = model.predict(X).flatten()
    metrics = evaluate(y, y_pred)
    metrics["Bias"] = round(float((y_pred - y).mean()), 2)

    set_model_output(
        name="LSTM",
        y_true=y.tolist(),
        y_pred=y_pred.tolist(),
        model_type="DL",
        metrics=metrics
    )

if __name__ == "__main__":
    main()
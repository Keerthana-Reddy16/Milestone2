import pandas as pd
import numpy as np
import json
import os
from xgboost import XGBRegressor
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from models.evaluate import evaluate
from models.forecast_store import set_model_output
import joblib

# --- Paths and Config ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "../data/processed/feature_engineered.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "../data/outputs/forecast_xgboost.csv")
METRICS_PATH = os.path.join(BASE_DIR, "../data/outputs/model_metrics.json")
MODEL_PATH = os.path.join(BASE_DIR, "xgboost_model.pkl")
TARGET = "usage_cpu"

def main():
    print("🚀 Starting XGBoost training...")

    # --- Load and split data ---
    df = pd.read_csv(DATA_PATH, parse_dates=["date"]).sort_values("date")
    train_size = int(len(df) * 0.8)
    train, test = df[:train_size], df[train_size:]

    X_train = train.drop(columns=[TARGET, "date"])
    y_train = train[TARGET]
    X_test = test.drop(columns=[TARGET, "date"])
    y_test = test[TARGET]

    # --- Encode categorical features ---
    for col in X_train.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X_train[col] = le.fit_transform(X_train[col])
        X_test[col] = le.transform(X_test[col])

    # --- Scale features ---
    scaler = MinMaxScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # --- Train model ---
    model = XGBRegressor(n_estimators=100, learning_rate=0.1)
    model.fit(X_train, y_train)

    # --- Predict and evaluate ---
    y_pred = model.predict(X_test)
    metrics = evaluate(y_test, y_pred)
    metrics["Bias"] = round(float((y_pred - y_test).mean()), 2)

    print("✅ Evaluation Metrics:")
    print(json.dumps(metrics, indent=2))

    # --- Save forecast ---
    forecast_df = pd.DataFrame({
        "date": test["date"].values,
        "actual": y_test.values,
        "predicted": y_pred
    })
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    forecast_df.to_csv(OUTPUT_PATH, index=False)
    print(f"📈 Forecast saved to {OUTPUT_PATH}")

    # --- Save metrics to disk ---
    os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)
    try:
        with open(METRICS_PATH) as f:
            all_metrics = json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        all_metrics = {}

    safe_metrics = {k: float(v) if isinstance(v, (np.float32, np.float64, np.float16)) else v for k, v in metrics.items()}
    all_metrics["XGBoost"] = safe_metrics

    with open(METRICS_PATH, "w") as f:
        json.dump(all_metrics, f, indent=2)
    print(f"📊 Metrics saved to {METRICS_PATH}")

    # --- Save model ---
    joblib.dump(model, MODEL_PATH)
    print(f"💾 Model saved to {MODEL_PATH}")

    # --- Push to memory for FastAPI ---
    set_model_output(
        name="XGBoost",
        y_true=y_test.tolist(),
        y_pred=y_pred.tolist(),
        model_type="ML",
        metrics=metrics
    )

if __name__ == "__main__":
    main()
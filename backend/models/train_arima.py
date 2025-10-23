import pandas as pd
import numpy as np
import json
from statsmodels.tsa.arima.model import ARIMA
from models.evaluate import evaluate
from models.forecast_store import set_model_output

DATA_PATH = "data/processed/feature_engineered.csv"
OUTPUT_PATH = "data/outputs/forecast_arima.csv"
METRICS_PATH = "data/outputs/model_metrics.json"
TARGET = "usage_cpu"

def main():
    print("🚀 Starting ARIMA training...")

    df = pd.read_csv(DATA_PATH, parse_dates=["date"])
    df = df.sort_values("date")

    train_size = int(len(df) * 0.8)
    train, test = df[:train_size], df[train_size:]

    model = ARIMA(train[TARGET], order=(5,1,0))
    model_fit = model.fit()

    forecast = model_fit.forecast(steps=len(test))
    metrics = evaluate(test[TARGET], forecast)
    metrics["Bias"] = round((forecast - test[TARGET]).mean(), 2)

    print("✅ Evaluation Metrics:")
    print(json.dumps(metrics, indent=2))

    forecast_df = pd.DataFrame({
        "date": test["date"].values,
        "actual": test[TARGET].values,
        "predicted": forecast
    })
    forecast_df.to_csv(OUTPUT_PATH, index=False)
    print(f"📈 Forecast saved to {OUTPUT_PATH}")

    if METRICS_PATH:
        try:
            with open(METRICS_PATH) as f:
                all_metrics = json.load(f)
        except:
            all_metrics = {}

        all_metrics["ARIMA"] = metrics
        with open(METRICS_PATH, "w") as f:
            json.dump(all_metrics, f, indent=2)
        print(f"📊 Metrics saved to {METRICS_PATH}")

    set_model_output(
        name="ARIMA",
        y_true=test[TARGET].tolist(),
        y_pred=forecast.tolist(),
        model_type="Classical",
        metrics=metrics
    )

if __name__ == "__main__":
    main()
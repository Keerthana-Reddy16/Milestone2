import json
import os
from fastapi import HTTPException

METRICS_PATH = "data/outputs/model_metrics.json"
def get_monitoring_status():
    try:
        if not os.path.exists(METRICS_PATH):
            raise HTTPException(status_code=404, detail="No metrics available")

        with open(METRICS_PATH) as f:
            metrics = json.load(f)

        drift_flag = False
        drift_reason = ""

        if "XGBoost" in metrics and "ARIMA" in metrics:
            xgboost_mape = float(metrics["XGBoost"].get("MAPE", "0").replace("%", ""))
            arima_mape = float(metrics["ARIMA"].get("MAPE", "0").replace("%", ""))
            if abs(xgboost_mape - arima_mape) > 5:
                drift_flag = True
                drift_reason = "Significant MAPE difference between models"

        last_train_date = None
        if os.path.exists("data/last_train.txt"):
            with open("data/last_train.txt") as f:
                last_train_date = f.read().strip()

        return {
            "models": list(metrics.keys()),
            "metrics": metrics,
            "error_drift": drift_flag,
            "drift_reason": drift_reason,
            "retraining_needed": drift_flag,
            "last_train_date": last_train_date
        }

    except Exception as e:
        print(f"❌ Monitoring status failed: {e}")
        raise HTTPException(status_code=500, detail="Monitoring status failed.") 
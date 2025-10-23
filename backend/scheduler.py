from apscheduler.schedulers.background import BackgroundScheduler
from models.forecast import forecast, get_valid_combinations
import pandas as pd
import os
from models.monitoring import get_monitoring_status
from models.retraining import update_last_train_date
from models.train import train_model


def scheduled_forecast():
    combos = get_valid_combinations()
    for combo in combos:
        region = combo["region"]
        service = combo["resource_type"]
        for model in ["xgboost", "arima", "lstm"]:
            try:
                result = forecast(region, service, model, horizon=30)
                df = pd.DataFrame(result["forecast"])
                filename = f"outputs/forecast_{model}_{region}_{service}.csv"
                os.makedirs("outputs", exist_ok=True)
                df.to_csv(filename, index=False)
                print(f"✅ Saved forecast: {filename}")
            except Exception as e:
                print(f"❌ Forecast failed for {region}-{service}-{model}: {e}")

def scheduled_retraining():
    status = get_monitoring_status()
    if status["retraining_needed"]:
        print("⚠️ Retraining triggered due to drift or stale data")
        for model in ["xgboost", "arima", "lstm"]:
            try:
                train_model(model)
            except Exception as e:
                print(f"❌ Retraining failed for {model}: {e}")
        update_last_train_date()
    else:
        print("✅ No retraining needed today")

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_forecast, "interval", days=1)
    scheduler.add_job(scheduled_retraining, "interval", days=1)
    scheduler.start()
    print("🚀 Scheduler started: Forecast + Retraining jobs active")
import pandas as pd
import numpy as np
import json
from fastapi import HTTPException
from statsmodels.tsa.arima.model import ARIMA
from models.forecast import run_xgboost, run_lstm
from models.evaluate import evaluate
from models.forecast_store import set_model_output
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATA_PATH = "data/processed/feature_engineered.csv"
OUTPUT_PATH = "data/outputs/forecast_arima.csv"
METRICS_PATH = "data/outputs/model_metrics.json"
TARGET = "usage_cpu"

def run_arima_local(df_filtered: pd.DataFrame, horizon: int = 30):
    try:
        logger.info("🔍 Starting ARIMA pipeline...")
        logger.info(f"📊 Incoming rows: {len(df_filtered)}")
        logger.info(f"📋 Columns: {df_filtered.columns.tolist()}")

                # Step 1: Convert date column
        df_filtered["date"] = pd.to_datetime(df_filtered["date"], errors="coerce")

        # Step 2: Drop missing and sort
        df_filtered = df_filtered.dropna(subset=["date", TARGET])
        df_filtered = df_filtered.sort_values("date")
        df_filtered.set_index("date", inplace=True)

        # Step 3: Reindex to daily frequency
        full_index = pd.date_range(start=df_filtered.index.min(), end=df_filtered.index.max(), freq="D")
        df_filtered = df_filtered.reindex(full_index)
        df_filtered.index.name = "date"

        # Step 4: Interpolate missing values
        df_filtered[TARGET] = df_filtered[TARGET].interpolate(method="linear")

        # Step 5: Drop any remaining NaNs
        series = df_filtered[TARGET].dropna()

        # Step 6: Train/test split
        train_size = int(len(series) * 0.8)
        train, test = series[:train_size], series[train_size:]

        # Step 7: Fit ARIMA
        model = ARIMA(train, order=(5, 1, 0))
        model_fit = model.fit()

        # Step 8: Forecast
        forecast = model_fit.forecast(steps=len(test))

        # Step 9: Align shapes
        if len(forecast) != len(test):
            forecast = forecast[:len(test)]

    except Exception as e:
        logger.error(f"❌ ARIMA pipeline failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"ARIMA error: {str(e)}")


# ✅ Capacity estimator
def estimate_available_capacity(region, service):
    try:
        df = pd.read_csv(DATA_PATH, parse_dates=["date"])
        df_filtered = df[
            (df["region"] == region) & (df["resource_type"] == service)
        ]
        
        if TARGET not in df_filtered.columns:
            raise ValueError(f"Missing '{TARGET}' column")
        recent_capacity = df_filtered[TARGET].tail(30).mean()
        return round(recent_capacity, 2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capacity estimation failed: {str(e)}")

# ✅ Main adjustment logic
def get_capacity_adjustment(region, service, model, horizon=30):
    try:
        df = pd.read_csv(DATA_PATH, parse_dates=["date"])
        df_filtered = df[
            (df["region"] == region) & (df["resource_type"] == service)
        ]
        logger.info(f"📥 Incoming request: region={region}, service={service}, model={model}")
        logger.info(f"Filtered rows: {len(df_filtered)}")
        logger.info(f"Columns: {df_filtered.columns.tolist()}")

        if len(df_filtered) < 50:
            raise HTTPException(status_code=404, detail="Not enough data for adjustment")

        model = model.lower()
        if model == "arima":
            logger.info("🚦 ARIMA model selected — entering run_arima_local()")
            
            forecast_df = run_arima_local(df_filtered, horizon)
        elif model == "xgboost":
            logger.info("🚦 xgboost model selected — entering run_arima_local()")

            forecast_df, _ = run_xgboost(df_filtered, horizon)
        elif model == "lstm":
            forecast_df, _ = run_lstm(df_filtered, horizon)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model: {model}")

        forecast_demand = round(forecast_df["predicted"].astype(float).sum(), 2)
        available_capacity = estimate_available_capacity(region, service)

        adjustment = forecast_demand - available_capacity
        recommendation = f"{'Increase' if adjustment > 0 else 'Reduce'} capacity by {abs(adjustment)} units"

        return {
            "region": region,
            "service": service,
            "model": model,
            "forecast_demand": forecast_demand,
            "available_capacity": available_capacity,
            "recommended_adjustment": recommendation
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Capacity adjustment failed: {str(e)}")
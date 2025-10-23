from fastapi import FastAPI, Query
import pandas as pd
import numpy as np
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi import FastAPI
from routes.forecast import router as forecast_router
from routes.model_metrics import router as metrics_router
import sys
import os
from scheduler import start_scheduler
start_scheduler()


# Add backend root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from models.evaluate import evaluate 
from routes.insights import summarize_backtest
from utils.file_utils import load_dataframe  # or wherever load_data is defined
from routes.model_comparison import router as comparison_router
from routes.insights import router as insights_router
from routes import monitoring


import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)
app.include_router(metrics_router)
app.include_router(comparison_router, prefix='/api')
app.include_router(insights_router, prefix="/api")
app.include_router(monitoring.router)


# --- CSV Path ---
CSV_PATH = Path(__file__).parent / "data" / "processed" / "feature_engineered.csv"

# --- Resource Type Mapping ---
RESOURCE_TYPE_TO_METRIC = {
    "VM": "usage_cpu",
    "Storage": "usage_storage",
    "Container": "usage_cpu"
}

# --- Helper ---
def load_data():
    try:
        df = pd.read_csv(CSV_PATH, parse_dates=["date"])
        df = df[[col for col in df.columns if "_daily" not in col]]
        return df
    except FileNotFoundError:
        return pd.DataFrame()

# -------------------------------
# Features Endpoint
# -------------------------------
@app.get("/api/features")
def get_features(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1),
    region: str = Query(None),
    resource_type: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
):
    df = load_data()
    if df.empty:
        return JSONResponse(content={"data": [], "total": 0})

    clean_df = df.replace([np.nan, np.inf, -np.inf], None).copy()
    clean_df["date"] = pd.to_datetime(clean_df["date"], errors="coerce")

    if region:
        clean_df = clean_df[clean_df["region"].str.lower() == region.lower()]
    if resource_type:
        clean_df = clean_df[clean_df["resource_type"] == resource_type]

    metric_col = RESOURCE_TYPE_TO_METRIC.get(resource_type)
    if metric_col and metric_col in clean_df.columns:
        clean_df = clean_df[["date", "region", "resource_type", metric_col]]

    if start_date:
        clean_df = clean_df[clean_df["date"] >= pd.to_datetime(start_date)]
    if end_date:
        clean_df = clean_df[clean_df["date"] <= pd.to_datetime(end_date)]

    start = (page - 1) * page_size
    end = start + page_size
    page_data = clean_df.iloc[start:end].copy()
    page_data["date"] = page_data["date"].astype(str)

    return JSONResponse(content={"data": page_data.to_dict(orient="records"), "total": len(clean_df)})

# -------------------------------
# Regions Endpoint
# -------------------------------
@app.get("/api/features/regions")
def get_regions():
    df = load_data()
    if df.empty or "region" not in df.columns:
        return JSONResponse(content={"regions": []})
    regions = df["region"].dropna().unique().tolist()
    return JSONResponse(content={"regions": regions})

# -------------------------------
# Resource Types Endpoint
# -------------------------------
@app.get("/api/features/resource-types")
def get_resource_types():
    return JSONResponse(content={"resource_types": list(RESOURCE_TYPE_TO_METRIC.keys())})

# -------------------------------
# Metrics Endpoint
# -------------------------------
@app.get("/api/features/metrics")
def get_metrics():
    df = load_data()
    if df.empty:
        return JSONResponse(content={"metrics": []})

    exclude_cols = [
        "date", "region", "resource_type", "day_of_week", "month", "quarter", "is_weekend"
    ]
    metrics = [col for col in df.columns if col not in exclude_cols]
    return JSONResponse(content={"metrics": metrics})

# -------------------------------
# Date Range Endpoint
# -------------------------------
@app.get("/api/features/date-range")
def get_date_range():
    df = load_data()
    if df.empty or "date" not in df.columns:
        return {"min_date": None, "max_date": None}

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    min_date = df["date"].min().date() if not df["date"].isna().all() else None
    max_date = df["date"].max().date() if not df["date"].isna().all() else None
    return {"min_date": str(min_date), "max_date": str(max_date)}

# -------------------------------
# Insights Endpoint
# ------------------------------

@app.get("/api/insights")
def get_insights():
    try:
        df = load_data()
        if df.empty:
            return JSONResponse(content={"message": "No data available"}, status_code=404)

        df["date"] = pd.to_datetime(df["date"])
        df["cpu_before"] = df["usage_cpu"] * 0.6
        df["cpu_after"] = df["usage_cpu"]
        df["storage_before"] = df["usage_storage"] * 0.7
        df["storage_after"] = df["usage_storage"]

        insights = {}

        insights["comparison"] = df[["region", "cpu_before", "cpu_after", "storage_before", "storage_after"]].copy().to_dict(orient="records")

        if "usage_cpu" in df.columns:
            top_regions = (
                df.groupby("region")["usage_cpu"]
                .mean()
                .sort_values(ascending=False)
                .head(5)
                .reset_index()
            )
            insights["top_regions_by_utilization"] = [
                {"region": row["region"], "avg_utilization": float(row["usage_cpu"]) if not np.isnan(row["usage_cpu"]) else None}
                for _, row in top_regions.iterrows()
            ]

            daily_cpu = df.groupby("date")["usage_cpu"].sum().reset_index()
            peak_days = daily_cpu.sort_values("usage_cpu", ascending=False).head(5)
            insights["peak_usage_days"] = [
                {"date": str(row["date"]), "total_cpu": float(row["usage_cpu"]) if not np.isnan(row["usage_cpu"]) else None}
                for _, row in peak_days.iterrows()
            ]

            df["month_num"] = df["date"].dt.to_period("M").astype(str)
            monthly = df.groupby("month_num")["usage_cpu"].mean().reset_index()
            insights["monthly_cpu_trend"] = [
                {"month_num": row["month_num"], "avg_cpu": float(row["usage_cpu"]) if not np.isnan(row["usage_cpu"]) else None}
                for _, row in monthly.iterrows()
            ]

        numeric_cols = df.select_dtypes(include=["float64", "int64"]).columns
        if not numeric_cols.empty:
            corr = df[numeric_cols].corr().round(3)
            insights["correlations"] = {
                col: {k: (None if np.isnan(v) else float(v)) for k, v in corr[col].items()}
                for col in corr.columns
            }

        seasonality = (
            df.groupby(df["date"].dt.to_period("M"))["usage_cpu"]
            .mean()
            .reset_index()
        )
        seasonality["month"] = seasonality["date"].astype(str) + "-01"
        seasonality = seasonality.rename(columns={"usage_cpu": "cpu_usage"}).drop(columns=["date"])

        df["day_of_week"] = df["date"].dt.dayofweek + 1
        day_stats = df.groupby("day_of_week")["usage_cpu"].agg(["min", "median", "max"]).reset_index()

        insights["chart_data"] = {
            "day_of_week_stats": day_stats.to_dict(orient="records"),
            "regional_stats": df.groupby("region")["usage_cpu"].agg(["min", "median", "max"]).reset_index().to_dict(orient="records"),
            "peak_usage": df.groupby("region")["usage_cpu"].max().reset_index().rename(columns={"usage_cpu": "cpu_peak"}).to_dict(orient="records"),
            "seasonality": seasonality.to_dict(orient="records"),
            "time_series": df[["date", "region", "usage_cpu"]].copy().to_dict(orient="records")
        }

        # ✅ Backtest summary integration
        insights["backtest_summary"] = [
            summarize_backtest("data/outputs/backtest_arima.csv", "ARIMA").dict(),
            summarize_backtest("data/outputs/backtest_xgboost.csv", "XGBoost").dict(),
            summarize_backtest("data/outputs/backtest_lstm.csv", "LSTM").dict()
        ]

        logger.info("✅ /api/insights route executed successfully")
        return JSONResponse(content=jsonable_encoder(insights))

    except Exception as e:
        logger.error(f"❌ Error in /api/insights: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
# -------------------------------
# Debug Endpoints
# -------------------------------
@app.get("/api/debug-features")
def debug_features():
    df = load_data()
    return JSONResponse(content=df.head(10).to_dict(orient="records"))

@app.get("/api/debug-insights")
def debug_insights():
    df = load_data()
    return JSONResponse(content={"message": "Use /api/insights for full insights", "rows": len(df)})

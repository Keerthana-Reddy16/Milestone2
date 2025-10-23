import numpy as np
import pandas as pd
from fastapi import APIRouter
from data_processing.insights import get_insights
from models.schemas import (
    InsightsResponse, TopRegion, PeakUsageDay,
    MonthlyCPUTrend, ExternalFactor, BacktestSummary
)
import logging
logger = logging.getLogger(__name__)
router = APIRouter()
logger.info("📊 Insights route triggered")

def safe_float(value):
    try:
        f = float(value)
        if np.isnan(f) or np.isinf(f):
            return None
        return round(f, 2)
    except:
        return None
    
def summarize_backtest(path, model_name):
    try:
        df = pd.read_csv(path)
        return BacktestSummary(
            model=model_name,
            windows=len(df),
            avg_mae=safe_float(df["MAE"].iloc[0]),
            avg_rmse=safe_float(df["RMSE"].iloc[0]),
            avg_mape=f"{safe_float(str(df['MAPE'].iloc[0]).replace('%', ''))}%",
            std_mae=safe_float(df["STD_MAE"].iloc[0]),
            std_rmse=safe_float(df["STD_RMSE"].iloc[0])
        )
    except Exception as e:
        logger.error(f"{model_name} summary failed: {e}")
        return BacktestSummary(model=model_name, error=str(e))

@router.get("/", response_model=InsightsResponse)
def insights(region: str = None, month: int = None):
    """
    Returns dashboard insights:
    - Top regions by utilization
    - Peak usage days
    - Monthly CPU trend
    - External factors impact
    - Backtest summary
    Optional filters: region, month
    """
    data = get_insights()

    # --- Top regions ---
    top_regions = data.get('top_regions_by_utilization', [])
    cleaned_regions = []
    for r in top_regions:
        region_name = r.get('region', "")
        avg_utilization = r.get('avg_utilization')
        if isinstance(avg_utilization, float) and (np.isnan(avg_utilization) or np.isinf(avg_utilization)):
            avg_utilization = None
        if not region or region_name == region:
            cleaned_regions.append(TopRegion(region=region_name, avg_utilization=avg_utilization))
    data['top_regions_by_utilization'] = cleaned_regions

    # --- Monthly CPU trend ---
    monthly_trend = data.get('monthly_cpu_trend', [])
    cleaned_trend = []
    for m in monthly_trend:
        month_num = m.get('month_num')
        cpu_usage = m.get('cpu_usage')
        if isinstance(cpu_usage, float) and (np.isnan(cpu_usage) or np.isinf(cpu_usage)):
            cpu_usage = None
        if not month or month_num == month:
            cleaned_trend.append(MonthlyCPUTrend(month_num=month_num, cpu_usage=cpu_usage))
    data['monthly_cpu_trend'] = cleaned_trend

    # --- External factors ---
    external_factors = data.get('external_factors_impact', [])
    cleaned_factors = []
    for ef in external_factors:
        factor_name = ef.get('factor', "")
        impact_score = ef.get('impact_score')
        if isinstance(impact_score, float) and (np.isnan(impact_score) or np.isinf(impact_score)):
            impact_score = None
        cleaned_factors.append(ExternalFactor(factor=factor_name, impact_score=impact_score))
    data['external_factors_impact'] = cleaned_factors

    # --- Peak usage days ---
    peak_days = data.get('peak_usage_days', [])
    cleaned_peak_days = []
    for p in peak_days:
        date = p.get('date', "")
        total_cpu = p.get('total_cpu')
        if isinstance(total_cpu, float) and (np.isnan(total_cpu) or np.isinf(total_cpu)):
            total_cpu = None
        cleaned_peak_days.append(PeakUsageDay(date=date, total_cpu=total_cpu))
    data['peak_usage_days'] = cleaned_peak_days

    # --- Backtest summary ---
    backtest_summary = [
        summarize_backtest("data/outputs/backtest_arima.csv", "ARIMA"),
        summarize_backtest("data/outputs/backtest_xgboost.csv", "XGBoost"),
        summarize_backtest("data/outputs/backtest_lstm.csv", "LSTM")
    ]
    print("Backtest summary:", backtest_summary)

    return InsightsResponse(
        top_regions_by_utilization=data['top_regions_by_utilization'],
        peak_usage_days=data['peak_usage_days'],
        monthly_cpu_trend=data['monthly_cpu_trend'],
        external_factors_impact=data['external_factors_impact'],
        backtest_summary=backtest_summary
    )
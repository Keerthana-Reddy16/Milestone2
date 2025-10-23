from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

# -------------------
# Features
# -------------------

class FeatureRow(BaseModel):
    date: datetime
    region: str
    resource_type: Optional[str] = None

    # Usage metrics
    usage_cpu: Optional[float] = None
    usage_storage: Optional[float] = None
    users_active: Optional[int] = None

    # Daily change metrics
    usage_cpu_daily: Optional[float] = None
    usage_storage_daily: Optional[float] = None
    users_active_daily: Optional[float] = None

    # Time-based features
    day_of_week: Optional[int] = None
    month: Optional[int] = None
    quarter: Optional[int] = None
    is_weekend: Optional[bool] = None

    # Lag features
    cpu_lag_1: Optional[float] = None
    cpu_lag_3: Optional[float] = None
    cpu_lag_7: Optional[float] = None

    # Rolling features
    cpu_roll_mean_7: Optional[float] = None
    cpu_roll_mean_30: Optional[float] = None
    cpu_roll_max_7: Optional[float] = None
    cpu_roll_min_7: Optional[float] = None

    # Derived metrics
    cpu_total: Optional[float] = None
    storage_allocated: Optional[float] = None
    utilization_ratio: Optional[float] = None
    storage_efficiency: Optional[float] = None

class FeaturesResponse(BaseModel):
    data: List[FeatureRow] = []
    page: int = 1
    page_size: int = 200
    total: int = 0

# -------------------
# Insights
# -------------------

class TopRegion(BaseModel):
    region: str
    avg_utilization: Optional[float] = None

class PeakUsageDay(BaseModel):
    date: datetime
    total_cpu: Optional[float] = None

class MonthlyCPUTrend(BaseModel):
    month_num: int
    cpu_usage: Optional[float] = None

class ExternalFactor(BaseModel):
    factor: str
    impact_score: Optional[float] = None

class BacktestSummary(BaseModel):
    model: str
    windows: Optional[int]
    avg_mae: Optional[float]
    avg_rmse: Optional[float]
    avg_mape: Optional[str]
    std_mae: Optional[float]
    std_rmse: Optional[float]
    error: Optional[str] = None

class InsightsResponse(BaseModel):
    top_regions_by_utilization: List[TopRegion] = []
    peak_usage_days: List[PeakUsageDay] = []
    monthly_cpu_trend: List[MonthlyCPUTrend] = []
    external_factors_impact: List[ExternalFactor] = []
    backtest_summary: List[BacktestSummary] = []
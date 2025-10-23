import pandas as pd
import numpy as np
from data_processing.feature_engineering import load_features

def get_insights():
    df = load_features()
    print("usage_cpu stats:", df["usage_cpu"].describe())

    # --- Top regions by CPU utilization ---
    top_regions = (
        df.groupby('region')['utilization_ratio']
        .mean()
        .reset_index()
        .sort_values('utilization_ratio', ascending=False)
    )
    top_regions_list = [
        {"region": r, "avg_utilization": u if pd.notna(u) and np.isfinite(u) else None}
        for r, u in zip(top_regions['region'], top_regions['utilization_ratio'])
    ][:5]

    # --- Peak CPU usage days ---
    peak_days = (
        df.groupby('date')['usage_cpu']
        .sum()
        .reset_index()
        .sort_values('usage_cpu', ascending=False)
    )
    peak_days_list = [
        {"date": str(d.date()), "total_cpu": u if pd.notna(u) and np.isfinite(u) else None}
        for d, u in zip(peak_days['date'], peak_days['usage_cpu'])
    ][:5]

    # --- Monthly CPU trend ---
    monthly = (
        df.groupby(df['date'].dt.month)['usage_cpu']
        .mean()
        .reset_index()
    )
    monthly_list = [
        {
            "month_num": int(row['date']),
            "cpu_usage": float(row['usage_cpu']) if pd.notna(row['usage_cpu']) and np.isfinite(row['usage_cpu']) else None
        }
        for _, row in monthly.iterrows()
    ]

    # --- External factors impact (real correlations) ---
    external_columns = [
        "users_active", "is_weekend", "day_of_week", "month", "quarter",
        "storage_efficiency", "utilization_ratio", "usage_storage",
        "cpu_lag_1", "cpu_lag_3", "cpu_lag_7",
        "cpu_roll_mean_7", "cpu_roll_mean_30",
        "cpu_roll_max_7", "cpu_roll_min_7"
    ]

    external_factors_impact = []

    for feature, corr_dict in correlations.items():
        if isinstance(corr_dict, dict):
            score = corr_dict.get("usage_cpu")
            if pd.notna(score) and np.isfinite(score):
                external_factors_impact.append({
                    "factor": feature.replace("_", " ").title(),
                    "impact_score": round(score, 2)
                })

    print("Top regions:", top_regions_list)
    print("Monthly trend:", monthly_list)
    print("External factors:", external_factors_impact)

    return {
        "top_regions_by_utilization": top_regions_list,
        "peak_usage_days": peak_days_list,
        "monthly_cpu_trend": monthly_list,
        "external_factors_impact": external_factors_impact

    }
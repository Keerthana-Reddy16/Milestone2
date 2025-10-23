# backend/app/data_processing/external_factors.py
import pandas as pd

def add_external_factors(df: pd.DataFrame) -> pd.DataFrame:
    """Add external factors such as seasonality, weekday/weekend flags, etc."""

    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df["day_of_week"] = df["date"].dt.day_name()
        df["month"] = df["date"].dt.month
        df["quarter"] = df["date"].dt.quarter
        df["is_weekend"] = df["date"].dt.dayofweek >= 5

    return df

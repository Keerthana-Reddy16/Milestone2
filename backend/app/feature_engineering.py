import pandas as pd
from pathlib import Path
from data_cleaning import build_cleaned_merged

# --- Define project root (one level above "app") ---
PROJECT_ROOT = Path(__file__).resolve().parents[1]

RAW_PATH = PROJECT_ROOT / "data/raw"
INTERIM_PATH = PROJECT_ROOT / "data/interim"
PROCESSED_PATH = PROJECT_ROOT / "data/processed"
PROCESSED_PATH.mkdir(parents=True, exist_ok=True)

def build_feature_engineered_csv() -> Path:
    """
    Generate feature_engineered.csv from cleaned_merged.csv
    adding time-based, lag, rolling and derived metrics.
    The file is guaranteed to be saved in the 'data/processed' folder.
    """
    cleaned_path = INTERIM_PATH / "cleaned_merged.csv"
    if not cleaned_path.exists():
        build_cleaned_merged()  # ensure milestone 1 is run

    cleaned = pd.read_csv(cleaned_path, parse_dates=["date"])
    daily_path = RAW_PATH / "daily_totals.csv"
    if not daily_path.exists():
        raise FileNotFoundError(f"{daily_path} not found!")

    daily = pd.read_csv(daily_path, parse_dates=["date"])

    # --- Time-based features ---
    cleaned["day_of_week"] = cleaned["date"].dt.dayofweek
    cleaned["month"] = cleaned["date"].dt.month
    cleaned["quarter"] = cleaned["date"].dt.quarter
    cleaned["is_weekend"] = cleaned["day_of_week"].isin([5, 6]).astype(int)

    # --- Lag & rolling CPU features per region ---
    cleaned.sort_values(["region", "date"], inplace=True)
    for lag in [1, 3, 7]:
        cleaned[f"cpu_lag_{lag}"] = cleaned.groupby("region")["usage_cpu"].shift(lag)
    for window in [7, 30]:
        cleaned[f"cpu_roll_mean_{window}"] = cleaned.groupby("region")["usage_cpu"].transform(
            lambda s: s.rolling(window, min_periods=1).mean()
        )
    for stat in ["max", "min"]:
        cleaned[f"cpu_roll_{stat}_7"] = cleaned.groupby("region")["usage_cpu"].transform(
            lambda s: getattr(s.rolling(7, min_periods=1), stat)()
        )

    # --- Derived metrics using daily totals ---
    daily_totals = daily.set_index("date")[["usage_cpu", "usage_storage"]].rename(
        columns={"usage_cpu": "cpu_total", "usage_storage": "storage_allocated"}
    )
    cleaned = cleaned.join(daily_totals, on="date")
    cleaned["utilization_ratio"] = cleaned["usage_cpu"] / cleaned["cpu_total"].replace(0, pd.NA)
    cleaned["storage_efficiency"] = cleaned["usage_storage"] / cleaned["storage_allocated"].replace(0, pd.NA)

    # --- Save processed dataset ---
    out_path = PROCESSED_PATH / "feature_engineered.csv"
    cleaned.to_csv(out_path, index=False)

    # --- Debugging info ---
    print(f"Feature-engineered CSV saved to: {out_path}")
    print(f"Data shape: {cleaned.shape}")

    return out_path

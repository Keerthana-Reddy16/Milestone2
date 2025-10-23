import pandas as pd
from pathlib import Path

RAW_PATH = Path(__file__).resolve().parents[1] / "data/raw"
INTERIM_PATH = Path(__file__).resolve().parents[1] / "data/interim"
INTERIM_PATH.mkdir(parents=True, exist_ok=True)

def build_cleaned_merged() -> Path:
    """
    Load raw Azure and external datasets,
    clean & merge them into cleaned_merged.csv
    """

    # --- 1️⃣ Load Raw Files ---
    azure = pd.read_csv(RAW_PATH / "azure_usage.csv", parse_dates=["date"])

    daily = pd.read_csv(RAW_PATH / "daily_totals.csv", parse_dates=["date"])

    # --- 2️⃣ Basic Cleaning ---
    # Standardise column names
    azure.columns = [c.strip().lower() for c in azure.columns]
    daily.columns = [c.strip().lower() for c in daily.columns]

    # Convert to datetime
    azure["date"] = pd.to_datetime(azure["date"], errors="coerce")
    daily["date"] = pd.to_datetime(daily["date"], errors="coerce")

    # Drop rows missing critical fields
    azure.dropna(subset=["date", "region", "usage_cpu", "usage_storage"], inplace=True)

    # Fill other missing numeric values with 0
    num_cols = azure.select_dtypes("number").columns
    azure[num_cols] = azure[num_cols].fillna(0)

    # --- 3️⃣ Merge Azure usage with daily totals
    merged = azure.merge(daily, on="date", how="left", suffixes=("", "_daily"))

    # Fill any missing totals with 0
    merged.fillna({"usage_cpu_daily": 0, "usage_storage_daily": 0}, inplace=True)

    # --- 4️⃣ Save cleaned dataset
    out_path = INTERIM_PATH / "cleaned_merged.csv"
    merged.to_csv(out_path, index=False)
    return out_path

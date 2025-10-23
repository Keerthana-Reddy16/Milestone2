import pandas as pd
from config import INTERIM_DIR, PROCESSED_DIR, FEATURE_FILE

def create_features(df: pd.DataFrame):
    # --- Ensure date is datetime ---
    if df['date'].dtype != 'datetime64[ns]':
        df['date'] = pd.to_datetime(df['date'])

    # --- Time-based features ---
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['quarter'] = df['date'].dt.quarter
    df['is_weekend'] = df['day_of_week'].isin([5,6])

    # --- Derived metrics ---
    # CPU utilization ratio
    if 'cpu_total' in df.columns and 'usage_cpu' in df.columns:
        df['utilization_ratio'] = df['usage_cpu'] / df['cpu_total'].replace({0:1})
    else:
        df['utilization_ratio'] = df['usage_cpu'] / df['usage_cpu'].max()

    # Storage efficiency
    if 'storage_allocated' in df.columns and 'usage_storage' in df.columns:
        df['storage_efficiency'] = df['usage_storage'] / df['storage_allocated'].replace({0:1})
    else:
        df['storage_efficiency'] = df['usage_storage'] / df['usage_storage'].max()

    # --- Sort for time-based calculations ---
    df = df.sort_values(['region','date'])

    # --- Lag features ---
    for lag in [1,3,7]:
        df[f'cpu_lag_{lag}'] = df.groupby('region')['usage_cpu'].shift(lag)

    # --- Daily change features ---
    for col in ['usage_cpu', 'usage_storage', 'users_active']:
        if col in df.columns:
            df[f'{col}_daily'] = df.groupby('region')[col].diff()

    # --- Rolling features ---
    df['cpu_roll_mean_7'] = df.groupby('region')['usage_cpu'].transform(lambda x: x.rolling(7).mean())
    df['cpu_roll_mean_30'] = df.groupby('region')['usage_cpu'].transform(lambda x: x.rolling(30).mean())
    df['cpu_roll_max_7'] = df.groupby('region')['usage_cpu'].transform(lambda x: x.rolling(7).max())
    df['cpu_roll_min_7'] = df.groupby('region')['usage_cpu'].transform(lambda x: x.rolling(7).min())

    # --- Save processed CSV ---
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(FEATURE_FILE, index=False)

    return df

def load_features():
    df = pd.read_csv(FEATURE_FILE, parse_dates=['date'])
    return df

from pathlib import Path



BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
INTERIM_DIR = DATA_DIR / "interim"
PROCESSED_DIR = DATA_DIR / "processed"

FEATURE_FILE = PROCESSED_DIR / "feature_engineered.csv"

# config.py

DATA_PATH = "data/processed/feature_engineered.csv"
MODEL_PATH_LSTM = "models/lstm_model.h5"
MODEL_PATH_XGB = "models/xgboost_model.pkl"
TARGET = "usage_cpu"
WINDOW = 30

LSTM_FEATURES = [
  'usage_storage', 'users_active', 'utilization_ratio',
  'cpu_lag_1', 'cpu_lag_3', 'cpu_lag_7',
  'cpu_roll_mean_7', 'cpu_roll_mean_30',
  'cpu_roll_max_7', 'cpu_roll_min_7',
  'storage_efficiency'
]
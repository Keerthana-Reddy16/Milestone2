# run_all_models.py
from models.train_xgboost import main as run_xgb
from models.train_lstm import main as run_lstm
from models.train_arima import main as run_arima

run_xgb()
run_lstm()
run_arima()
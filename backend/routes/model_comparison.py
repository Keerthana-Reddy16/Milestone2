from fastapi import APIRouter
from models.train_xgboost import main as run_xgb
from models.train_lstm import main as run_lstm
from models.train_arima import main as run_arima
from utils.model_utils import select_best_model

router = APIRouter()

@router.get("/model-comparison")
def compare_models():
    best_model, metrics = select_best_model()
    return {"best_model": best_model, "metrics": metrics}

@router.post("/model-comparison/train-all")
def train_all_models():
    print("🔁 Running train_all_models...")

    try:
        run_xgb()
        print("✅ XGBoost trained")
    except Exception as e:
        print(f"❌ XGBoost failed: {e}")

    try:
        run_lstm()
        print("✅ LSTM trained")
    except Exception as e:
        print(f"❌ LSTM failed: {e}")

    try:
        run_arima()
        print("✅ ARIMA trained")
    except Exception as e:
        print(f"❌ ARIMA failed: {e}")

    from models.forecast_store import forecast_outputs
    print(f"📦 Forecast store contents: {list(forecast_outputs.keys())}")

    return {"message": "Training complete"}
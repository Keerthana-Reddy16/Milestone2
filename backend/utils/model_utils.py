import pandas as pd
from models.evaluate import evaluate
from models.forecast_store import get_model_outputs


# Simulated predictions for each model (replace with actual loading logic)
def load_predictions():
    return {
        "ARIMA": {"y_true": pd.read_csv("data/arima_true.csv")["value"],
                  "y_pred": pd.read_csv("data/arima_pred.csv")["value"],
                  "type": "Classical"},
        "XGBoost": {"y_true": pd.read_csv("data/xgb_true.csv")["value"],
                    "y_pred": pd.read_csv("data/xgb_pred.csv")["value"],
                    "type": "ML"},
        "LSTM": {"y_true": pd.read_csv("data/lstm_true.csv")["value"],
                 "y_pred": pd.read_csv("data/lstm_pred.csv")["value"],
                 "type": "DL"}
    }

def select_best_model():
    model_outputs = get_model_outputs()
    comparison = []

    for model_name, data in model_outputs.items():
        try:
            metrics = evaluate(
                pd.Series(data["y_true"]),
                pd.Series(data["y_pred"])
            )
            metrics.update({
                "model": model_name,
                "type": data["type"]
            })
            comparison.append(metrics)
        except Exception as e:
            print(f"Error evaluating {model_name}: {e}")

    best_model = sorted(comparison, key=lambda x: x["MAE"])[0]["model"] if comparison else None
    return best_model, comparison
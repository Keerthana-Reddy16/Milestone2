import json
import pandas as pd
import os

METRICS_PATH = "data/outputs/model_metrics.json"
ADJUSTMENTS_PATH = "data/forecasts/adjustments.csv"

def generate_summary_report():
    if not os.path.exists(METRICS_PATH):
        return {"error": "No model metrics available"}

    metrics = json.load(open(METRICS_PATH))

    # Identify best model by lowest MAPE
    best_model = min(metrics.items(), key=lambda x: float(x[1]["MAPE"].strip("%")))[0]

    # Load adjustments if available
    if os.path.exists(ADJUSTMENTS_PATH):
        adjustments = pd.read_csv(ADJUSTMENTS_PATH)
        avg_adjustment = round(adjustments["recommended_adjustment"].mean(), 2)
    else:
        avg_adjustment = None

    return {
        "best_model": best_model,
        "accuracy_metrics": metrics,
        "average_adjustment": avg_adjustment,
        "cost_savings_estimate": "Coming soon"
    }
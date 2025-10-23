# models/forecast_store.py
forecast_outputs = {}

def set_model_output(name, y_true, y_pred, model_type, metrics):
    forecast_outputs[name] = {
        "y_true": y_true,
        "y_pred": y_pred,
        "type": model_type,
        "metrics": metrics
    }

def get_model_outputs():
    return forecast_outputs
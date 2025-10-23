from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

def evaluate(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mape = (abs((y_true - y_pred) / y_true)).mean() * 100
    bias = (y_pred - y_true).mean()

    return {
        "MAE": round(float(mae), 4),
        "RMSE": round(float(rmse), 4),
        "MAPE": f"{round(float(mape), 2)}%",
        "Bias": round(float(bias), 2)
    }

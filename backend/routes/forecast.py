from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from models.forecast import forecast, get_valid_combinations
from models.monitoring import get_monitoring_status
from models.capacity import get_capacity_adjustment
import traceback
import numpy as np
import pandas as pd
import math
import json
from starlette.responses import Response
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

def sanitize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    import math

    def safe_convert(val):
        if val is None:
            return None
        if isinstance(val, float):
            if math.isnan(val) or math.isinf(val):
                return None
            if abs(val) > 1e308:
                return float(1e308) if val > 0 else float(-1e308)
            return float(val)
        if isinstance(val, (np.float32, np.float64)):
            return float(val)
        if isinstance(val, (np.int32, np.int64)):
            return int(val)
        return val

    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.where(pd.notnull(df), None)
    df = df.astype(object).applymap(safe_convert)
    return df

def sanitize_record(record):
    def safe(val):
        if val is None:
            return None
        if isinstance(val, float):
            if math.isnan(val) or math.isinf(val):
                return None
            if abs(val) > 1e308:
                return float(1e308) if val > 0 else float(-1e308)
            return float(val)
        if isinstance(val, (np.float32, np.float64)):
            return float(val)
        if isinstance(val, (np.int32, np.int64)):
            return int(val)
        return val
    return {k: safe(v) for k, v in record.items()}




@router.get("/api/forecast")
def get_forecast(
    region: str,
    service: str,
    model: str = "xgboost",
    horizon: int = 30,
    #start_date: str = Query(None),
    #end_date: str = Query(None)
):
    try:
        result = forecast(region, service, model, horizon)
        df = pd.DataFrame(result["forecast"])

        # Separate historical and future rows
        historical = df[df["actual"].notna()].copy()
        future = df[df["actual"].isna() & df["predicted"].notna()].copy()


        # Combine and sanitize
        combined = pd.concat([historical, future], ignore_index=True)
        records = [sanitize_record(row) for row in combined.to_dict(orient="records")]

        return JSONResponse(content={
            "forecast": records,
            "metrics": result["metrics"]
        })

    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ Forecast API error:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Forecast serialization failed.")

@router.get("/api/features/valid-combinations")
def valid_combinations():
    try:
        combos = get_valid_combinations()
        return JSONResponse(content=combos)
    except Exception as e:
        print("Valid Combinations API error:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to fetch valid combinations.")

@router.get("/api/monitoring")
def monitoring():
    try:
        status = get_monitoring_status()
        return JSONResponse(content=status)
    except Exception as e:
        print("Monitoring API error:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Monitoring status failed.")

@router.get("/api/capacity-adjustment")
def capacity_adjustment(region: str, service: str, model: str = "xgboost", horizon: int = 30):
    try:
        result = get_capacity_adjustment(region, service, model, horizon)
        return JSONResponse(content=result)
    except Exception as e:
        print("Capacity Adjustment API error:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Capacity adjustment failed.")
    
@router.get("/api/forecast/{region}/{service}")
def get_forecast(region: str, service: str, model: str = "xgboost", horizon: int = 30):
    result = forecast(region, service, model, horizon)
    return result  # result is a dict with 'forecast' and 'metrics'
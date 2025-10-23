from fastapi import APIRouter, HTTPException
from typing import Optional
import pandas as pd
from data_processing.feature_engineering import load_features
from models.schemas import FeaturesResponse
import numpy as np

router = APIRouter()

# Resource type to metric column mapping
RESOURCE_TYPE_TO_METRIC = {
    "VM": "usage_cpu",
    "Storage": "usage_storage",
    "Container": "usage_cpu"  # or usage_storage depending on your logic
}

@router.get("/", response_model=FeaturesResponse)
def get_features(
    page: int = 1,
    page_size: int = 200,
    region: Optional[str] = "East US",
    resource_type: Optional[str] = None,
    metric: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    try:
        df = load_features()

        # Normalize region
        if "region" in df.columns:
            df["region"] = df["region"].astype(str).str.strip()

        # Convert date column to datetime
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")

        # Apply filters
        if region:
            df = df[df["region"].str.lower() == region.lower()]
        if resource_type:
            df = df[df["resource_type"] == resource_type]

        # Determine metric column
        metric_col = None
        if resource_type:
            metric_col = RESOURCE_TYPE_TO_METRIC.get(resource_type)
        elif metric and metric in df.columns:
            metric_col = metric

        # Select relevant columns
        if metric_col and metric_col in df.columns:
            df = df[["date", "region", "resource_type", metric_col]]

        # Date filters
        if start_date:
            df = df[df["date"] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df["date"] <= pd.to_datetime(end_date)]

        # Replace NaN/Infinity
        df = df.replace([float("inf"), float("-inf")], pd.NA)
        df = df.where(pd.notnull(df), None)

        # Pagination
        total = len(df)
        start = (page - 1) * page_size
        end = start + page_size
        data = df.iloc[start:end].replace([np.inf, -np.inf, np.nan], None).to_dict(orient="records")

        return {
            "data": data,
            "page": page,
            "page_size": page_size,
            "total": total
        }

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Features file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/regions")
def get_regions():
    try:
        df = load_features()
        if "region" not in df.columns:
            return {"regions": []}

        regions = sorted(df["region"].astype(str).str.strip().unique().tolist())
        return {"regions": regions}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Features file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/metrics")
def get_metrics():
    try:
        df = load_features()
        exclude_cols = {"date", "region", "resource_type", "day_of_week", "month", "quarter", "is_weekend"}
        metrics = sorted([col for col in df.columns if col not in exclude_cols and pd.api.types.is_numeric_dtype(df[col])])
        return {"metrics": metrics}

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Features file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/date-range")
def get_date_range():
    try:
        df = load_features()
        if "date" not in df.columns:
            return {"min_date": None, "max_date": None}

        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        min_date = df["date"].min().date()
        max_date = df["date"].max().date()
        return {"min_date": min_date, "max_date": max_date}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resource-types")
def get_resource_types():
    return {"resource_types": list(RESOURCE_TYPE_TO_METRIC.keys())}

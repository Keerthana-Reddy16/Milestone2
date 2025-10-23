from fastapi import APIRouter
import json

router = APIRouter()

@router.get("/api/model-metrics")
def model_metrics():
    try:
        with open("data/outputs/model_metrics.json") as f:
            return json.load(f)
    except Exception as e:
        return {"error": str(e)}


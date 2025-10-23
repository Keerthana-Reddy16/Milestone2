# routes/monitoring.py
from fastapi import APIRouter
from models.monitoring import get_monitoring_status

router = APIRouter()

@router.get("/api/monitoring")
def monitoring():
    return get_monitoring_status()
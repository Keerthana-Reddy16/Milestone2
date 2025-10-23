from fastapi import APIRouter, HTTPException
from models.reporting import generate_summary_report

router = APIRouter()

@router.get("/api/report")
def get_report():
    try:
        report = generate_summary_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate report")
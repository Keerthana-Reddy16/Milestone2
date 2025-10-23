from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import pandas as pd
from config import RAW_DIR
from data_processing.data_cleaning import load_and_clean_raw
from data_processing.feature_engineering import create_features

router = APIRouter()

@router.post("/")
def upload_csv(file: UploadFile = File(...)):
    """
    Uploads a CSV file, cleans it, and generates feature-engineered data.
    """
    filename = file.filename
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save uploaded CSV
    file_path = RAW_DIR / filename
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Clean and feature engineer
    df_clean = load_and_clean_raw(filename)
    df_features = create_features(df_clean)

    return {
        "message": f"{filename} uploaded and processed",
        "rows": len(df_features)
    }

# Optional GET endpoint to guide users
@router.get("/")
def upload_csv_get():
    return {
        "message": "Use POST method with 'file' parameter to upload CSV"
    }

import pandas as pd
from config import RAW_DIR, INTERIM_DIR

def load_and_clean_raw(filename: str):
    path = RAW_DIR / filename
    df = pd.read_csv(path)
    
    # Drop completely empty rows
    df = df.dropna(how="all")
    
    # Ensure date is datetime
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df = df.dropna(subset=['date'])
    
    # Fill missing region with "Unknown"
    df['region'] = df['region'].fillna("Unknown")
    
    # Save interim cleaned file
    INTERIM_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(INTERIM_DIR / filename, index=False)
    
    return df

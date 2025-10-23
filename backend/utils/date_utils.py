# backend/app/utils/date_utils.py
import pandas as pd
from datetime import datetime

def parse_date(date_str: str) -> datetime:
    """Convert a string into datetime safely."""
    return pd.to_datetime(date_str, errors="coerce")

def get_date_range(start: str, end: str):
    """Return a pandas date range between start and end."""
    return pd.date_range(start=parse_date(start), end=parse_date(end))

def is_weekend(date: datetime) -> bool:
    """Check if given date is a weekend."""
    return date.weekday() >= 5

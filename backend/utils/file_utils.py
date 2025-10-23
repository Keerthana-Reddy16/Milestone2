# backend/app/utils/file_utils.py
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

def save_dataframe(df: pd.DataFrame, name: str, folder: str = "processed") -> Path:
    """Save dataframe to CSV in the given folder."""
    out_path = DATA_DIR / folder / f"{name}.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    return out_path

def load_dataframe(name: str, folder: str = "processed") -> pd.DataFrame:
    """Load dataframe from CSV in the given folder."""
    path = DATA_DIR / folder / f"{name}.csv"
    if not path.exists():
        raise FileNotFoundError(f"Dataset {path} not found")
    return pd.read_csv(path)

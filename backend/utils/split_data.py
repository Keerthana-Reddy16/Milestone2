import pandas as pd

def time_based_split(path, target="usage_cpu", train_ratio=0.7, val_ratio=0.2):
    df = pd.read_csv(path, parse_dates=["date"])
    df = df.sort_values("date")

    n = len(df)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    train = df.iloc[:train_end]
    val = df.iloc[train_end:val_end]
    test = df.iloc[val_end:]

    train.to_csv("data/splits/train.csv", index=False)
    val.to_csv("data/splits/val.csv", index=False)
    test.to_csv("data/splits/test.csv", index=False)

    print("✅ Data split and saved to /data/splits/")


if __name__ == "__main__":
    time_based_split("data/processed/feature_engineered.csv")

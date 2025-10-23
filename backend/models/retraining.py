import os
from datetime import datetime

LAST_TRAIN_PATH = "data/last_train.txt"

def should_retrain():
    if not os.path.exists(LAST_TRAIN_PATH):
        return True

    with open(LAST_TRAIN_PATH) as f:
        last_train_date = datetime.strptime(f.read().strip(), "%Y-%m-%d")
    return (datetime.now() - last_train_date).days > 30

def update_last_train_date():
    with open(LAST_TRAIN_PATH, "w") as f:
        f.write(datetime.now().strftime("%Y-%m-%d"))
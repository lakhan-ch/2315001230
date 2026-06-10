import requests
from datetime import datetime

API_URL = "http://4.224.186.213/evaluation-service/notifications"

WEIGHTS = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}

def calculate_score(notification):
    weight = WEIGHTS.get(notification["Type"], 0)

    timestamp = datetime.strptime(
        notification["Timestamp"],
        "%Y-%m-%d %H:%M:%S"
    )

    recency = timestamp.timestamp()

    return (weight * 10000000000) + recency


def get_notifications():
    response = requests.get(API_URL)

    if response.status_code != 200:
        print("API Error")
        return []

    return response.json()["notifications"]


def get_top_notifications(limit=10):
    notifications = get_notifications()

    notifications.sort(
        key=calculate_score,
        reverse=True
    )

    return notifications[:limit]


if __name__ == "__main__":

    top_notifications = get_top_notifications(10)

    print("\nTOP 10 PRIORITY NOTIFICATIONS\n")

    for index, notification in enumerate(top_notifications, start=1):
        print(
            f"{index}. "
            f"{notification['Type']} | "
            f"{notification['Message']} | "
            f"{notification['Timestamp']}"
        )
        
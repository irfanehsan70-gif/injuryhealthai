import requests
import json

base_url = "http://127.0.0.1:5000/api"

# 1. Login to get token
login_data = {"email": "pishon@gmail.com", "password": "123456"}
print(f"Logging in as {login_data['email']}...")
res = requests.post(f"{base_url}/login", json=login_data, timeout=10)
if res.status_code != 200:
    print(f"Login failed: {res.status_code} - {res.text}")
    exit(1)

token = res.json()['token']
print(f"Token obtained: {token[:10]}...")

# 2. Call predict with sample data
sample_assessment = {
    "PlayerName": "Retrain Test",
    "PlayerEmail": "retrain@gmail.com",
    "League": "Premier League",
    "Age": 25,
    "Position": "Forward",
    "Seasons_Played": 5,
    "Matches_Per_Season": 30,
    "Minutes_Per_Season": 2400,
    "High_Speed_Runs": 80,
    "Previous_Injuries": 1,
    "Recurrence_Flag": 0,
    "Fatigue_Index": 1.9,
    "dominant_side": "R"
}

print(f"Calling /predict...")
res_pred = requests.post(
    f"{base_url}/predict", 
    json=sample_assessment,
    headers={"Authorization": f"Bearer {token}"},
    timeout=10
)

print(f"Status Code: {res_pred.status_code}")
try:
    print(f"Full Data: {json.dumps(res_pred.json(), indent=2)}")
except Exception:
    print(f"Raw Response: {res_pred.text}")

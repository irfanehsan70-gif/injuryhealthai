import requests
import json

URL = "http://localhost:5000/api/predict"

# I need a token first. I'll login as Irfan.
login_url = "http://localhost:5000/api/login"
login_payload = {"email": "irfan@gmail.com", "password": "123"}
r = requests.post(login_url, json=login_payload)
token = r.json().get('token')

headers = {"Authorization": f"Bearer {token}"}

safe_payload = {
    "PlayerName": "Test Safe",
    "Age": 20,
    "Position": "Defender",
    "Seasons_Played": 2,
    "Matches_Per_Season": 20,
    "Minutes_Per_Season": 1500,
    "High_Speed_Runs": 30,
    "Previous_Injuries": 0,
    "Recurrence_Flag": 0,
    "Fatigue_Index": 1.0
}

r = requests.post(URL, json=safe_payload, headers=headers)
print(f"Safe Results: {json.dumps(r.json(), indent=2)}")

risky_payload = {
    "PlayerName": "Test Risky",
    "Age": 35,
    "Position": "Forward",
    "Seasons_Played": 15,
    "Matches_Per_Season": 40,
    "Minutes_Per_Season": 3500,
    "High_Speed_Runs": 150,
    "Previous_Injuries": 5,
    "Recurrence_Flag": 1,
    "Fatigue_Index": 2.5
}

r = requests.post(URL, json=risky_payload, headers=headers)
print(f"Risky Results: {json.dumps(r.json(), indent=2)}")

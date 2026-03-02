import requests

BASE_URL = "http://127.0.0.1:5000/api"

# 1. Register a player for BARCELONA
res = requests.post(f"{BASE_URL}/register", json={
    "name": "Irfan Player",
    "email": "irfan_player@gmail.com",
    "password": "password123",
    "role": "player",
    "team_name": "Barcelona",  # Case-insensitive test
    "profile": {
        "league": "La Liga",
        "position": "Forward",
        "age": 22,
        "seasons_played": 3,
        "matches_per_season": 30,
        "minutes_per_season": 2000,
        "high_speed_runs": 50,
        "previous_injuries": 1,
        "recurrence_flag": 0,
        "fatigue_index": 2.5,
        "jersey_number": "10",
        "nationality": "Spanish",
        "club": "Barcelona"
    }
})

print(f"Status: {res.status_code}")
print(f"Response: {res.json()}")

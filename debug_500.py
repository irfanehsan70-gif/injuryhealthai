import requests

base_url = "http://127.0.0.1:5000/api"
login_data = {"email": "pishon@gmail.com", "password": "123456"}

try:
    print("Logging in...")
    res = requests.post(f"{base_url}/login", json=login_data)
    token = res.json()['token']

    print("Fetching players...")
    res_players = requests.get(f"{base_url}/players", headers={"Authorization": f"Bearer {token}"})
    print(f"Status: {res_players.status_code}")
    print(f"Text: {res_players.text}")
except Exception as e:
    print(f"Error: {e}")

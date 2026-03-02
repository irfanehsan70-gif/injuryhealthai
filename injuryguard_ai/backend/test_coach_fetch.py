import requests

BASE_URL = "http://127.0.0.1:5000/api"

# 1. Login as Pep
res = requests.post(f"{BASE_URL}/login", json={
    "email": "pep@gmail.com",
    "password": "password123"
})

if res.status_code == 200:
    token = res.json()['token']
    print(f"Logged in. Team: {res.json()['user']['team_name']}")
    
    # 2. Call /players
    hdr = {"Authorization": f"Bearer {token}"}
    p_res = requests.get(f"{BASE_URL}/players", headers=hdr)
    print(f"Players: {p_res.json()}")
else:
    print(f"Login failed: {res.json()}")

import requests

base = "http://127.0.0.1:5000/api"

# Login
r1 = requests.post(f"{base}/login", json={"email": "pishon@gmail.com", "password": "123456"})
token = r1.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# Test dashboard_stats
r2 = requests.get(f"{base}/dashboard_stats", headers=headers)
print(f"Stats: {r2.status_code}")
print(f"Body: {r2.text[:200]}")

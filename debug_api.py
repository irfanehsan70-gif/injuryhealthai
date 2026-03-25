import requests

base = "http://127.0.0.1:5000/api"

# Fresh login
r1 = requests.post(f"{base}/login", json={"email": "pishon@gmail.com", "password": "123456"})
print(f"Login: {r1.status_code}")
if r1.status_code != 200:
    print(r1.text)
    exit(1)

token = r1.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# Players
r2 = requests.get(f"{base}/players", headers=headers, timeout=30)
print(f"Players: {r2.status_code}")
print(f"Body: {r2.text[:3000]}")

import requests

base = "http://127.0.0.1:5000/api"

# Fresh login
r1 = requests.post(f"{base}/login", json={"email": "pishon@gmail.com", "password": "123456"})
token = r1.json()['token']
headers = {"Authorization": f"Bearer {token}"}

# Players
r2 = requests.get(f"{base}/players", headers=headers, timeout=30)
print(f"Players: {r2.status_code}")
if r2.status_code == 500:
    with open("app_error.html", "w", encoding="utf-8") as f:
        f.write(r2.text)
    print("Saved 500 error HTML to app_error.html")
else:
    print(r2.text)

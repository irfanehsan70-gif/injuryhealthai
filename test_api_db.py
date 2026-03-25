import requests
import jwt
import datetime

SECRET_KEY = 'injury_guard_secret_2026'
email = "admin@injuryguard.ai"
token = jwt.encode({
    'user': email, 'name': "Admin", 'role': "admin",
    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
}, SECRET_KEY, algorithm="HS256")

headers = {"Authorization": f"Bearer {token}"}
try:
    r = requests.get("http://localhost:5000/api/me", headers=headers, timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"Error: {e}")

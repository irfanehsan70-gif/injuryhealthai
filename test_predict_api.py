import requests
import json

base_url = "http://127.0.0.1:5000/api"

# 1. Login to get token
login_data = {"email": "pishon@gmail.com", "password": "123456"}
print(f"Logging in as {login_data['email']}...")
res = requests.post(f"{base_url}/login", json=login_data, timeout=5)
# ...
res_pred = requests.post(
    f"{base_url}/predict", 
    json=sample_assessment,
    headers={"Authorization": f"Bearer {token}"},
    timeout=5
)

print(f"Status Code: {res_pred.status_code}")
try:
    print(f"Full Data: {json.dumps(res_pred.json(), indent=2)}")
except Exception:
    print(f"Raw Response: {res_pred.text}")

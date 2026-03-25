import requests
import json

base_url = "http://127.0.0.1:5000/api"

try:
    print(f"Checking {base_url}/reload_models...")
    # This one doesn't require auth in some versions, but let's try a simple one
    # Actually, reload_models exists
    resp = requests.post(f"{base_url}/reload_models")
    print(f"Response: {resp.status_code}")
    print(f"Data: {resp.json()}")
except Exception as e:
    print(f"Error: {e}")

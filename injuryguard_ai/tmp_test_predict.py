import urllib.request, json

def post(url, body, headers={}):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={**headers, 'Content-Type': 'application/json'})
    resp = urllib.request.urlopen(req, timeout=10)
    return json.loads(resp.read())

login_resp = post('http://localhost:5000/api/login', {'email': 'admin@injuryguard.ai', 'password': 'admin123'})
token = login_resp.get('token', '')
headers = {'Authorization': f'Bearer {token}'}

result_a = post('http://localhost:5000/api/predict', {
    'league': 'La Liga', 'position': 'Goalkeeper', 'age': 22, 'seasons_played': 1,
    'matches_per_season': 20, 'minutes_per_season': 1500, 'high_speed_runs': 30,
    'previous_injuries': 0, 'recurrence_flag': 0, 'fatigue_index': 0.5
}, headers)

result_b = post('http://localhost:5000/api/predict', {
    'league': 'Premier League', 'position': 'Striker', 'age': 35, 'seasons_played': 12,
    'matches_per_season': 38, 'minutes_per_season': 3200, 'high_speed_runs': 180,
    'previous_injuries': 5, 'recurrence_flag': 1, 'fatigue_index': 3.5
}, headers)

import json
with open('test_results.json', 'w') as f:
    json.dump({'a': result_a, 'b': result_b}, f, indent=2)
print("Written to test_results.json")

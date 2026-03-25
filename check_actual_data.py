from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]

print("--- RECENT PREDICTIONS (BARCELONA) ---")
for p in db.predictions.find({"team_name": "BARCELONA"}).sort("timestamp", -1).limit(20):
    print(f"Timestamp: {p.get('timestamp')}, Player: {p.get('player_name')}, Risk: {p.get('result', {}).get('risk_prob')}")

print("\n--- ALL PLAYERS IN 'players' COLLECTION ---")
for p in db.players.find({"team_name": "BARCELONA"}):
    print(f"Player: {p.get('name')}, Last Risk: {p.get('last_risk')}")

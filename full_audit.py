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

print("--- USERS ---")
for u in db.users.find({"team_name": "BARCELONA"}):
    print(f"Name: {u.get('name')}, Email: {u.get('email')}, Role: {u.get('role')}, Team: {u.get('team_name')}")

print("\n--- PREDICTIONS ---")
for p in db.predictions.find({"team_name": "BARCELONA"}):
    print(f"Player: {p.get('player_name')}, User: {p.get('user')}")

print("\n--- TEAMS ---")
print(db.users.distinct("team_name"))

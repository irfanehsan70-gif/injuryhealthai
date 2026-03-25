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

print("--- PLAYERS COLLECTION (BARCELONA) ---")
for p in db.players.find({"team_name": "BARCELONA"}):
    print(f"Name: {p.get('name')}, Last Risk: {p.get('last_risk')}, Last Scan: {p.get('last_assessment')}")

print("\n--- USERS COLLECTION (BARCELONA) ---")
for u in db.users.find({"team_name": "BARCELONA"}):
    print(f"Name: {u.get('name')}, Role: {u.get('role')}, Email: {u.get('email')}")

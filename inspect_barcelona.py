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
users_col = db["users"]

print("--- BARCELONA TEAM USERS ---")
for u in users_col.find({"team_name": "BARCELONA"}):
    print(f"Name: {u.get('name')}, Email: {u.get('email')}, Role: {u.get('role')}")

print("\n--- ALL PREDICTIONS FOR BARCELONA ---")
for p in db["predictions"].find({"team_name": "BARCELONA"}):
    print(f"Player: {p.get('player_name')}, User linked: {p.get('user')}")

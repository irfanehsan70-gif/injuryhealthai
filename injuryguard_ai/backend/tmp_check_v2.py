from pymongo import MongoClient
import os

MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["injuryguard_ai"]
users_col = db["users"]

print("--- USERS (ROLE, TEAM, NAME) ---")
for u in users_col.find({}):
    print(f"[{u.get('role')[:5]}] - {u.get('team_name')} - {u.get('name')}")

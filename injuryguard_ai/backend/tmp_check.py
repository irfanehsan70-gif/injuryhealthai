from pymongo import MongoClient
import os

MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["injuryguard_ai"]
users_col = db["users"]

print("--- USERS ---")
for u in users_col.find({}):
    print(f"Name: {u.get('name')}, Email: {u.get('email')}, Role: {u.get('role')}, Team: {u.get('team_name')}")

print("\n--- PREDICTIONS ---")
predictions_col = db["predictions"]
for p in predictions_col.find({}):
    print(f"User: {p.get('user')}, Result: {p.get('result', {}).get('risk_label') if p.get('result') else 'N/A'}")

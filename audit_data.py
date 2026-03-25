from pymongo import MongoClient
import urllib.parse

USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

print("--- COLLECTIONS ---")
for coll in db.list_collection_names():
    count = db[coll].count_documents({})
    print(f"{coll}: {count} documents")

print("\n--- TEAM DATA (BARCELONA) ---")
team_name = "BARCELONA"

# 1. Players
players = list(db["players"].find({"team_name": team_name}))
print(f"Players in 'players' collection: {len(players)}")
for p in players:
    print(f"  - {p.get('name')} (Email: {p.get('email', 'N/A')})")

# 2. Users (Role: player)
player_users = list(db["users"].find({"team_name": team_name, "role": "player"}))
print(f"Players in 'users' collection: {len(player_users)}")
for u in player_users:
    print(f"  - {u.get('name')} ({u.get('email')})")

# 3. Predictions
preds = list(db["predictions"].find({"team_name": team_name}))
print(f"Predictions: {len(preds)}")
if preds:
    print(f"  Sample player: {preds[0].get('player_name')} for user {preds[0].get('user')}")

# 4. Team Uploads
uploads = list(db["team_uploads"].find({"team_name": team_name}))
print(f"Team Uploads: {len(uploads)}")

print("\n--- ALL UNIQUE TEAM NAMES IN DB ---")
unique_teams = db["users"].distinct("team_name")
print(f"Teams in 'users': {unique_teams}")
unique_teams_preds = db["predictions"].distinct("team_name")
print(f"Teams in 'predictions': {unique_teams_preds}")
unique_teams_players = db["players"].distinct("team_name")
print(f"Teams in 'players': {unique_teams_players}")

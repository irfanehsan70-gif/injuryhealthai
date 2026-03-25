from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
SHARDS = [
    "ac-liw4zgh-shard-00-00.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-01.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-02.osljpls.mongodb.net:27017"
]
DB_NAME = "injuryguard_ai"
MONGO_URI = f"mongodb://{USER}:{urllib.parse.quote_plus(PWD)}@{','.join(SHARDS)}/{DB_NAME}?ssl=true&authSource=admin&retryWrites=true&w=majority"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]

print("--- USERS (Team Names) ---")
for u in db.users.find({}, {"email": 1, "team_name": 1, "name": 1}):
    print(f"| {u.get('email'):30} | {str(u.get('team_name')):20} | {u.get('name')}")

print("\n--- PLAYERS (Team Names) ---")
for p in db.players.find({}, {"name": 1, "team_name": 1}):
    print(f"| {p.get('name'):30} | {str(p.get('team_name'))}")

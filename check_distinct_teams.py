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

print("Distinct Teams in USERS:", db.users.distinct("team_name"))
print("Distinct Teams in PLAYERS:", db.players.distinct("team_name"))

print("\nDetails for 'pishon@gmail.com':")
u = db.users.find_one({"email": "pishon@gmail.com"})
if u:
    print(f"Name: {u.get('name')}, Team: '{u.get('team_name')}'")
else:
    print("User not found")

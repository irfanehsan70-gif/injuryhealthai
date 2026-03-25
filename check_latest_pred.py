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

print("--- LATEST PREDICTION ---")
latest = db.predictions.find_one({}, sort=[("timestamp", -1)])
if latest:
    print(f"Timestamp: {latest.get('timestamp')}")
    print(f"Player: {latest.get('player_name')}")
    print(f"User: {latest.get('user')}")
else:
    print("No predictions found")

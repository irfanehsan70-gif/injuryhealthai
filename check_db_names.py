from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    client = MongoClient(MONGO_URI, 
                         serverSelectionTimeoutMS=10000, 
                         tlsCAFile=ca, 
                         tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    unique_names = db.predictions.distinct("player_name")
    print(f"Unique player names: {unique_names}")
    
    unique_users = db.predictions.distinct("user")
    print(f"Unique users: {unique_users}")
    
    latest = list(db.predictions.find().sort("timestamp", -1).limit(5))
    for l in latest:
        print(f"User: {l.get('user')}, Player: {l.get('player_name')}, Time: {l.get('timestamp')}")
        
except Exception as e:
    print(f"Error: {e}")

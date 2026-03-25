from pymongo import MongoClient
import urllib.parse
import certifi
import json
from bson import ObjectId

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

def serialize(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=ca)
    db = client[DB_NAME]
    
    # Recent Messi records
    preds = list(db.predictions.find({"player_name": {"$regex": "Messi", "$options": "i"}}).sort("timestamp", -1).limit(5))
    for p in preds:
        print(f"ID: {p['_id']}, User: '{p.get('user')}', Player: '{p.get('player_name')}'")
        print(f"Data: {p.get('input')}\n")
        
except Exception as e:
    print(f"Error: {e}")

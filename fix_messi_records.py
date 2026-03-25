from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=ca)
    db = client[DB_NAME]
    
    # Update messy Messi records
    result = db.predictions.update_many(
        {"user": "", "player_name": {"$regex": "Messi", "$options": "i"}},
        {"$set": {"user": "messi@gmail.com"}}
    )
    print(f"Linked {result.modified_count} records to messi@gmail.com")
    
except Exception as e:
    print(f"Error: {e}")

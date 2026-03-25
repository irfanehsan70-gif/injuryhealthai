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
    
    users = db.predictions.distinct('user')
    for u in users:
        count = db.predictions.count_documents({"user": u})
        print(f"'{u}': {count} records")
        
except Exception as e:
    print(f"Error: {e}")

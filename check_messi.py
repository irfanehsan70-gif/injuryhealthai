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
    
    # Check predictions for MESSI
    messi_preds = list(db.predictions.find({"player_name": "MESSI"}))
    print(f"Predictions for MESSI: {len(messi_preds)}")
    if messi_preds:
        print(f"Latest prediction: {messi_preds[0].get('result', {}).get('risk_prob')}%")
    
    # Check all predictions count
    total = db.predictions.count_documents({})
    print(f"Total predictions in DB: {total}")
    
except Exception as e:
    print(f"Error: {e}")

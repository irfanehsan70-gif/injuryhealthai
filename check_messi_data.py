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
    
    # Check predictions for messi@gmail.com
    email = "messi@gmail.com"
    count = db.predictions.count_documents({"user": email})
    print(f"Count for '{email}': {count}")
    
    if count > 0:
        sample = db.predictions.find_one({"user": email})
        print(f"Sample 'user' field type: {type(sample.get('user'))}")
        print(f"Sample 'user' value: '{sample.get('user')}'")

except Exception as e:
    print(f"Error: {e}")

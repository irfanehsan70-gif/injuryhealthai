from pymongo import MongoClient
import sys

# Testing the new connection string provided by the user
# Based on previous app.py, the password was N3bov4zSQy5PRvjn
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
                         tlsAllowInvalidCertificates=True,
                         tlsCAFile=ca)
    client.admin.command('ping')
    print("✅ SUCCESS: Connected to MongoDB Atlas with user 'Irfan'")
    db = client[DB_NAME]
    print(f"✅ Collections found: {db.list_collection_names()}")
except Exception as e:
    print(f"❌ FAILURE: {e}")
    sys.exit(1)

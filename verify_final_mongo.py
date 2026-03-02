from pymongo import MongoClient
import sys
import urllib.parse

# User-provided credentials
user = "Irfan"
password = "Fanu916@"
encoded_password = urllib.parse.quote_plus(password)
host = "cluster0.osljpls.mongodb.net"

# Construct URI
uri = f"mongodb+srv://{user}:{encoded_password}@{host}/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    print(f"🔄 Attempting connection to MongoDB Atlas as '{user}'...")
    client = MongoClient(uri, serverSelectionTimeoutMS=10000)
    client.admin.command('ping')
    print("✅ SUCCESS: Authentication successful!")
    
    db = client[DB_NAME]
    collections = db.list_collection_names()
    print(f"✅ Database '{DB_NAME}' accessible. Collections: {collections}")
    
except Exception as e:
    print(f"❌ FAILURE: {e}")
    sys.exit(1)

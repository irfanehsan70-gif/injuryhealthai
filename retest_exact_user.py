from pymongo import MongoClient
import sys

# Exact string from the user
MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/?appName=Cluster0"

try:
    print(f"Connecting to: {MONGO_URI}")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    # The list_databases call is a better test than ping in some cases
    print(f"Databases: {client.list_database_names()}")
    print("✅ SUCCESS")
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__} - {e}")
    sys.exit(1)

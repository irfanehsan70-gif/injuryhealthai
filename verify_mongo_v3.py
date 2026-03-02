from pymongo import MongoClient
import sys

# Testing Irfan with irfanehsan70
MONGO_URI = "mongodb+srv://Irfan:irfanehsan70@cluster0.osljpls.mongodb.net/?appName=Cluster0"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)

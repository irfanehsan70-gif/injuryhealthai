from pymongo import MongoClient
import sys

# Try username irfanehsan70_db_user with password irfanehsan70
MONGO_URI = "mongodb+srv://irfanehsan70_db_user:irfanehsan70@cluster0.osljpls.mongodb.net/"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)

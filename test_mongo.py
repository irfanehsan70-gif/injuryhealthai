from pymongo import MongoClient
import sys

MONGO_URI = "mongodb+srv://irfanehsan70_db_user:N3bov4zSQy5PRvjn@cluster0.osljpls.mongodb.net/"
DB_NAME = "injuryguard_ai"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS: Connected to MongoDB Atlas")
    db = client[DB_NAME]
    print(f"Collections: {db.list_collection_names()}")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)

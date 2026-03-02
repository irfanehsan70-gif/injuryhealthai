from pymongo import MongoClient
import sys

# Testing the ORIGINAL one again with longer timeout
MONGO_URI = "mongodb+srv://irfanehsan70_db_user:N3bov4zSQy5PRvjn@cluster0.osljpls.mongodb.net/"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=15000)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)

from pymongo import MongoClient
import certifi
import sys

ca = certifi.where()
uri = "mongodb+srv://irfanehsan70_db_user:N3bov4zSQy5PRvjn@cluster0.osljpls.mongodb.net/"

try:
    print(f"🔄 Connecting with TLS CA File...")
    client = MongoClient(uri, serverSelectionTimeoutMS=15000, tlsCAFile=ca)
    client.admin.command('ping')
    print("✅ SUCCESS")
except Exception as e:
    print(f"❌ FAILURE: {e}")

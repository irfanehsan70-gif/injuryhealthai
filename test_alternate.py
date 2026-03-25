from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
uri = "mongodb+srv://irfanehsan70_db_user:N3bov4zSQy5PRvjn@cluster0.osljpls.mongodb.net/?appName=Cluster0"

try:
    print(f"🔄 Trying alternate credentials (irfanehsan70_db_user)...")
    client = MongoClient(uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000, tlsCAFile=ca)
    client.admin.command('ping')
    print("✅ SUCCESS!")
except Exception as e:
    print(f"❌ FAILURE: {e}")

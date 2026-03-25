from pymongo import MongoClient
import urllib.parse
import certifi
import sys

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=ca)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")

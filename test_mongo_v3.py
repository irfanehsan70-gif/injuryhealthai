from pymongo import MongoClient
import certifi
import urllib.parse
import sys

USER = "Irfan"
PWD = "Fanu916@" 
# Note: In diag_mongo_v2 it was "fanu916@" (lower case)
# In app.py it was "Fanu916@" (upper case)
# Let's try both.

ca = certifi.where()

for passw in ["Fanu916@", "fanu916@", "irfanehsan70"]:
    try:
        uri = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(passw)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
        print(f"Trying password: {passw}")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=ca)
        client.admin.command('ping')
        print(f"✅ SUCCESS with {passw}")
        break
    except Exception as e:
        print(f"❌ FAILURE with {passw}: {e}")

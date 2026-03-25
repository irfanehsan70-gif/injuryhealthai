from pymongo import MongoClient
import urllib.parse
import certifi
import sys
import logging
import traceback

# Detailed logging
logging.basicConfig(level=logging.DEBUG)

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
HOST = "cluster0.osljpls.mongodb.net"

try:
    encoded_pwd = urllib.parse.quote_plus(PWD)
    uri = f"mongodb+srv://{USER}:{encoded_pwd}@{HOST}/?appName=Cluster0"
    
    print(f"🔄 Attempting deep connection to {HOST}...")
    client = MongoClient(uri, 
                         serverSelectionTimeoutMS=20000, 
                         connectTimeoutMS=20000,
                         tlsCAFile=ca)
    
    print("Listing databases...")
    dbs = client.list_database_names()
    print(f"✅ SUCCESS! Databases: {dbs}")
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__}")
    print(f"Details: {e}")
    traceback.print_exc()
    sys.exit(1)

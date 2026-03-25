import pymongo
from pymongo import MongoClient
import urllib.parse
import certifi
import sys
import logging

# Enable pymongo logging
logging.basicConfig(level=logging.DEBUG)

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
HOST = "atlas-sql-699deaacac4b592429169e8d-phx7ai.a.query.mongodb.net"
DB_NAME = "injuryguard_ai"

try:
    encoded_pwd = urllib.parse.quote_plus(PWD)
    # Using the exact hostname provided
    uri = f"mongodb://{USER}:{encoded_pwd}@{HOST}/{DB_NAME}?ssl=true&authSource=admin"
    
    print(f"🔄 Attempting heavy connection to {HOST}...")
    # SQL endpoints often require ssl=true and have specific auth
    client = MongoClient(uri, 
                         serverSelectionTimeoutMS=15000, 
                         connectTimeoutMS=15000,
                         tlsCAFile=ca)
    
    # Try getting server info
    print("Fetching server_info...")
    info = client.server_info()
    print(f"✅ SUCCESS! Server Info: {info}")
    
    dbs = client.list_database_names()
    print(f"Databases: {dbs}")
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__} - {e}")
    sys.exit(1)

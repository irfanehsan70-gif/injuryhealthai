from pymongo import MongoClient
import urllib.parse
import certifi
import sys

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
HOST = "atlas-sql-699deaacac4b592429169e8d-phx7ai.a.query.mongodb.net"
DB_NAME = "injuryguard_ai"

try:
    encoded_pwd = urllib.parse.quote_plus(PWD)
    # Using the exact hostname provided
    uri = f"mongodb://{USER}:{encoded_pwd}@{HOST}/{DB_NAME}?ssl=true&authSource=admin"
    
    print(f"🔄 Attempting connection to NEW host: {HOST}...")
    client = MongoClient(uri, serverSelectionTimeoutMS=10000, tlsCAFile=ca)
    
    # Try to list databases
    dbs = client.list_database_names()
    print(f"✅ SUCCESS! Connected. Databases: {dbs}")
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__} - {e}")
    sys.exit(1)

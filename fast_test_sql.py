from pymongo import MongoClient
import urllib.parse
import certifi
import sys
import time

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
HOST = "atlas-sql-699deaacac4b592429169e8d-phx7ai.a.query.mongodb.net"
DB_NAME = "injuryguard_ai"

def test_connection():
    encoded_pwd = urllib.parse.quote_plus(PWD)
    # Using the EXACT URI structure requested by user
    # Note: 'mongodb://' instead of 'mongodb+srv://'
    uri = f"mongodb://{USER}:{encoded_pwd}@{HOST}/{DB_NAME}?ssl=true&authSource=admin"
    
    start_time = time.time()
    try:
        print(f"⚡ FAST CHECK: Connecting to SQL Engine at {HOST}...")
        # Ultra-short timeout for 'fast' check
        client = MongoClient(uri, 
                             serverSelectionTimeoutMS=2000, 
                             connectTimeoutMS=2000,
                             tlsCAFile=ca)
        
        # SQL endpoints might not support 'ping' exactly like standard clusters, 
        # so we try to list database names as the validation step.
        dbs = client.list_database_names()
        duration = round(time.time() - start_time, 2)
        print(f"✅ SUCCESS! Connected in {duration}s. Databases found: {dbs}")
        return True
    except Exception as e:
        duration = round(time.time() - start_time, 2)
        print(f"❌ FAILED in {duration}s: {type(e).__name__}")
        print(f"Error Detail: {e}")
        return False

if __name__ == "__main__":
    test_connection()

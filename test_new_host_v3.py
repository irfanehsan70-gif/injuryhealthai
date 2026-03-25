from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
HOST = "atlas-sql-699deaacac4b592429169e8d-phx7ai.a.query.mongodb.net"
PASS = "Fanu916@"

USERS = ["Irfan", "irfanehsan70_db_user", "admin"]

for user in USERS:
    try:
        encoded_pwd = urllib.parse.quote_plus(PASS)
        # Using tls=True explicitly as per ssl=true in URI
        uri = f"mongodb://{user}:{encoded_pwd}@{HOST}/injuryguard_ai?tls=true&authSource=admin"
        print(f"🔄 Trying user: {user} on host: {HOST}...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=ca)
        # Force connection
        client.admin.command('ping')
        print(f"Connected! Databases: {client.list_database_names()}")
        print(f"✅ SUCCESS with user: {user}")
        break
    except Exception as e:
        print(f"❌ FAILURE with user {user}: {e}")

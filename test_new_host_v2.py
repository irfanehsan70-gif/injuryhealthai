from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD1 = "Fanu916@"
PWD2 = "irfanehsan70"
HOST = "atlas-sql-699deaacac4b592429169e8d-phx7ai.a.query.mongodb.net"

for pwd in [PWD1, PWD2]:
    try:
        encoded_pwd = urllib.parse.quote_plus(pwd)
        uri = f"mongodb://{USER}:{encoded_pwd}@{HOST}/?ssl=true&authSource=admin"
        print(f"🔄 Trying password: {pwd} on host: {HOST}...")
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        print(f"Connected, listing databases...")
        print(f"Databases: {client.list_database_names()}")
        print(f"✅ SUCCESS with {pwd}")
        break
    except Exception as e:
        print(f"❌ FAILURE with {pwd}: {e}")

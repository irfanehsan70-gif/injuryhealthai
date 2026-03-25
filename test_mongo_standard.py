from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
# Standard connection string (bypasses SRV)
HOSTS = "cluster0-shard-00-00.osljpls.mongodb.net:27017,cluster0-shard-00-01.osljpls.mongodb.net:27017,cluster0-shard-00-02.osljpls.mongodb.net:27017"
URI = f"mongodb://{USER}:{urllib.parse.quote_plus(PWD)}@{HOSTS}/?ssl=true&replicaSet=atlas-osljpls-shard-0&authSource=admin&appName=Cluster0"

try:
    print(f"🔄 Attempting Standard Connection (Non-SRV)...")
    client = MongoClient(URI, serverSelectionTimeoutMS=10000, tlsCAFile=ca, tlsAllowInvalidCertificates=True)
    client.admin.command('ping')
    print("✅ SUCCESS! Connected via Standard String.")
    print(f"Databases: {client.list_database_names()}")
except Exception as e:
    print(f"❌ FAILURE: {e}")

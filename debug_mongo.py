import traceback
from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

print(f"Testing connection to: {MONGO_URI.split('@')[-1]}")

try:
    client = MongoClient(MONGO_URI, 
                         serverSelectionTimeoutMS=10000, 
                         connectTimeoutMS=10000,
                         tls=True,
                         tlsAllowInvalidCertificates=True,
                         tlsCAFile=ca)
    print("Ping...")
    client.admin.command('ping')
    print("✅ SUCCESS!")
except Exception:
    traceback.print_exc()

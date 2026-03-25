from pymongo import MongoClient
import urllib.parse
import certifi
import socket
import sys

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

print(f"Testing DNS for: cluster0.osljpls.mongodb.net")
try:
    ip = socket.gethostbyname("cluster0.osljpls.mongodb.net")
    print(f"Resolved to: {ip}")
except Exception as e:
    print(f"DNS FAIL: {e}")

print("\n--- ATTEMPTING LAZY CLIENT ---")
try:
    client = MongoClient(MONGO_URI, tlsCAFile=ca, serverSelectionTimeoutMS=2000)
    print("Client object created (lazy)")
    
    print("\n--- PINGING ADMIN ---")
    client.admin.command('ping')
    print("PING SUCCESS!")
    
    db = client[DB_NAME]
    print(f"Database pointers ready for '{DB_NAME}'")
    
except Exception as e:
    print(f"PING FAIL: {e}")
    sys.exit(1)

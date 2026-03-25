from pymongo import MongoClient
import urllib.parse
import certifi
import socket

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"

# Try resolving the host first
try:
    host = "cluster0.osljpls.mongodb.net"
    print(f"Resolving {host}...")
    ip = socket.gethostbyname(host)
    print(f"Resolved to {ip}")
except Exception as e:
    print(f"Resolution failed: {e}")

try:
    uri = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
    print(f"🔄 Attempting heavy-duty connection to {USER}...")
    client = MongoClient(uri, serverSelectionTimeoutMS=15000, connectTimeoutMS=15000, tlsCAFile=ca, tlsAllowInvalidCertificates=True)
    client.admin.command('ping')
    print("✅ SUCCESS!")
except Exception as e:
    print(f"❌ FINAL FAILURE: {type(e).__name__} - {e}")

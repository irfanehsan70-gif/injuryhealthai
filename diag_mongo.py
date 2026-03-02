from pymongo import MongoClient
import sys

# User provided
uri = "mongodb+srv://Irfan:Fanu916@cluster0.osljpls.mongodb.net/?appName=Cluster0"

try:
    print(f"Connecting to: {uri} (with password)")
    # Replace <db_password> with Fanu916@
    actual_uri = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/?appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true"
    client = MongoClient(actual_uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")

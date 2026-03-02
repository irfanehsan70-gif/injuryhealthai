from pymongo import MongoClient
import sys
import urllib.parse

# User provided lowercase: fanu916@
USER = "Irfan"
PWD = "fanu916@"

try:
    print(f"Connecting to: cluster0.osljpls.mongodb.net as {USER}")
    actual_uri = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
    client = MongoClient(actual_uri, serverSelectionTimeoutMS=10000, tlsAllowInvalidCertificates=True)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")

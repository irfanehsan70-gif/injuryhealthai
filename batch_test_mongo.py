from pymongo import MongoClient
import urllib.parse
import certifi
import sys

ca = certifi.where()

CREDENTIALS = [
    ("Irfan", "Fanu916@"),
    ("irfanehsan70_db_user", "Fanu916@"),
    ("irfanehsan70", "Fanu916@")
]

for user, pwd in CREDENTIALS:
    try:
        uri = f"mongodb+srv://{user}:{urllib.parse.quote_plus(pwd)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
        print(f"Trying: user={user}, pwd={pwd}...")
        client = MongoClient(uri, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000, tlsCAFile=ca, tlsAllowInvalidCertificates=True)
        client.admin.command('ping')
        print(f"SUCCESS with user: {user}")
        break
    except Exception as e:
        print(f"FAILURE for user {user}: {e}")

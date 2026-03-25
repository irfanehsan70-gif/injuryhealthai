from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    client = MongoClient(MONGO_URI, 
                         serverSelectionTimeoutMS=10000, 
                         tlsCAFile=ca, 
                         tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    users = list(db.users.find())
    for u in users:
        print(f"Name: {u.get('name')}, Email: {u.get('email')}, Role: {u.get('role')}, Team: {u.get('team_name')}")
        
except Exception as e:
    print(f"Error: {e}")

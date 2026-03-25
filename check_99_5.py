from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client["injuryguard_ai"]
p = db.predictions.find_one({"result.risk_prob": 99.5})

if p:
    import json
    print(f"Name: {p.get('player_name')}, Risk: {p['result']['risk_prob']}%")
    print(f"Full Input: {json.dumps(p['input'], indent=2)}")
else:
    print("No 99.5% record found")

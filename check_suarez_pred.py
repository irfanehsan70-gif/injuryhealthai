from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client["injuryguard_ai"]
preds = list(db.predictions.find({"player_name": "SUAREZ"}).sort("timestamp", -1).limit(1))

if preds:
    p = preds[0]
    print(f"Player: {p['player_name']}")
    print(f"Inputs: {p['input']}")
    print(f"Risk: {p['result']['risk_prob']}%")
    print(f"Label: {p['result']['risk_label']}")
    print(f"Primary Stressors: {p['result']['key_factors']}")
else:
    print("No prediction found for SUAREZ")

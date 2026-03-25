"""
Find non-serializable field in predictions docs
"""
from pymongo import MongoClient
import urllib.parse, certifi, datetime, json

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
SHARDS = [
    "ac-liw4zgh-shard-00-00.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-01.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-02.osljpls.mongodb.net:27017"
]
DB_NAME = "injuryguard_ai"
MONGO_URI = f"mongodb://{USER}:{urllib.parse.quote_plus(PWD)}@{','.join(SHARDS)}/{DB_NAME}?ssl=true&authSource=admin&retryWrites=true&w=majority"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]
pre_col = db["predictions"]
p_col = db["players"]

# Get first player in BARCELONA
p = p_col.find_one({"team_name": "BARCELONA"})
if p:
    latest = pre_col.find_one({"player_name": p['name'], "team_name": "BARCELONA"}, sort=[("timestamp", -1)])
    if latest:
        print("Latest assessment raw doc:")
        for k, v in latest.items():
            try:
                json.dumps(v, default=str)
                print(f"  OK  {k}: type={type(v).__name__}")
            except Exception as e:
                print(f"  BAD {k}: type={type(v).__name__}, error={e}, value={repr(v)[:200]}")
        
        # Try full json
        try:
            # Simulate serialize_doc
            doc = dict(latest)
            doc['_id'] = str(doc['_id'])
            for key, val in doc.items():
                if isinstance(val, datetime.datetime):
                    doc[key] = val.isoformat()
            j = json.dumps(doc)
            print(f"\nJSON OK: {len(j)} bytes")
        except Exception as e:
            print(f"\nJSON FAILED: {e}")
    else:
        print("No prediction found for this player")

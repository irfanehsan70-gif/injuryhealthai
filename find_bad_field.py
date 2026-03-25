"""
Find which field is not JSON serializable
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
p_col = db["players"]

print("First player raw doc:")
doc = p_col.find_one({"team_name": "BARCELONA"})
if doc:
    for k, v in doc.items():
        try:
            json.dumps({k: str(v)})
            print(f"  {k}: type={type(v).__name__}, value={repr(v)[:100]}")
        except Exception as e:
            print(f"  !! {k}: {e}")

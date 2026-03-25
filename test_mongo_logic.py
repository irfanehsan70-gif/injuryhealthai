from pymongo import MongoClient
import urllib.parse
import certifi
import datetime

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

def serialize_doc(doc):
    if doc is None: return None
    doc = dict(doc)
    if '_id' in doc: doc['_id'] = str(doc['_id'])
    for k, v in doc.items():
        if isinstance(v, datetime.datetime):
            doc[k] = v.isoformat()
    return doc

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]
u_col = db["users"]
p_col = db["players"]
pre_col = db["predictions"]

team = "BARCELONA"
print(f"Syncing {team}...")

try:
    players_list = []
    # 1. Scanned players
    for p in p_col.find({"team_name": team}):
        p_doc = serialize_doc(p)
        p_doc['profile'] = {'position': p.get('position', 'Unknown'), 'age': p.get('age', 'N/A')}
        if pre_col:
            latest = pre_col.find_one({"player_name": p.get('name'), "team_name": team}, sort=[("timestamp", -1)])
            if latest: p_doc['latest_assessment'] = serialize_doc(latest)
        players_list.append(p_doc)
    
    print(f"Scanned: {len(players_list)}")
    
    # 2. Registered users
    processed = {p.get('name') for p in players_list}
    for up in u_col.find({"role": "player", "team_name": team}):
        if up.get('name') not in processed:
            u_doc = serialize_doc(up)
            u_doc['profile'] = serialize_doc(up.get('profile', {}))
            players_list.append(u_doc)
            
    print(f"Total: {len(players_list)}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

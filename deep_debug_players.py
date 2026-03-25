"""
Minimal test: directly call the get_players logic and catch exceptions
"""
from pymongo import MongoClient
import urllib.parse, certifi, datetime, traceback

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

print("Connecting...")
client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]
u_col = db["users"]
p_col = db["players"]
pre_col = db["predictions"]

team = "BARCELONA"
print(f"Team: {team}")

# Simulate get_players
try:
    players_list = []
    raw = list(p_col.find({"team_name": team}))
    print(f"Raw players found: {len(raw)}")
    
    for i, p in enumerate(raw):
        print(f"  Processing player {i}: {p.get('name')}")
        p_doc = serialize_doc(p)
        print(f"    serialize_doc done")
        p_doc['profile'] = {'position': p.get('position', 'Unknown'), 'age': p.get('age', 'N/A')}
        
        latest = pre_col.find_one({"player_name": p.get('name'), "team_name": team}, sort=[("timestamp", -1)])
        if latest:
            p_doc['latest_assessment'] = serialize_doc(latest)
            print(f"    latest_assessment: {latest.get('result', {}).get('risk_label')}")
        players_list.append(p_doc)
        print(f"    appended OK")
    
    print(f"\nTotal from players col: {len(players_list)}")
    
    processed = {p.get('name') for p in players_list}
    for up in u_col.find({"role": "player", "team_name": team}):
        if up.get('name') not in processed:
            u_doc = serialize_doc(up)
            u_doc['profile'] = serialize_doc(up.get('profile', {}))
            players_list.append(u_doc)
    
    print(f"Grand total: {len(players_list)}")
    
    # Try JSON serialization
    import json
    j = json.dumps(players_list)
    print(f"JSON OK, {len(j)} bytes")
    
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()

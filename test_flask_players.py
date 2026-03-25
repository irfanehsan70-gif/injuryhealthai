"""
Minimal Flask test: expose /test_players, run on port 5001
This proves whether the serialize_doc works in a real HTTP response context
"""
from flask import Flask, jsonify
from pymongo import MongoClient
import urllib.parse, certifi, datetime, json

app = Flask(__name__)
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
u_col = db["users"]
p_col = db["players"]
pre_col = db["predictions"]

def serialize_doc(doc):
    if doc is None: return None
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == '_id':
                result[k] = str(v)
            elif isinstance(v, datetime.datetime):
                result[k] = v.isoformat()
            elif isinstance(v, dict):
                result[k] = serialize_doc(v)
            elif isinstance(v, list):
                result[k] = [serialize_doc(item) if isinstance(item, dict) else (item.isoformat() if isinstance(item, datetime.datetime) else item) for item in v]
            elif isinstance(v, bytes):
                result[k] = v.hex()
            else:
                try:
                    json.dumps(v)
                    result[k] = v
                except:
                    result[k] = str(v)
        return result
    elif isinstance(doc, datetime.datetime):
        return doc.isoformat()
    return doc

@app.route('/test_players')
def test_players():
    team = "BARCELONA"
    try:
        players_list = []
        for p in p_col.find({"team_name": team}):
            p_doc = serialize_doc(p)
            p_doc['profile'] = {'position': p.get('position', 'Unknown'), 'age': p.get('age', 'N/A')}
            latest = pre_col.find_one({"player_name": p.get('name'), "team_name": team}, sort=[("timestamp", -1)])
            if latest:
                p_doc['latest_assessment'] = serialize_doc(latest)
            players_list.append(p_doc)
        
        processed = {p.get('name') for p in players_list}
        for up in u_col.find({"role": "player", "team_name": team}):
            if up.get('name') not in processed:
                u_doc = serialize_doc(up)
                u_doc['profile'] = serialize_doc(up.get('profile', {}))
                players_list.append(u_doc)
        return jsonify(players_list)
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'trace': traceback.format_exc()}), 500

if __name__ == '__main__':
    print("Starting test server on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)

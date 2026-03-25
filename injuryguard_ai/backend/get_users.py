from pymongo import MongoClient
import certifi
import urllib.parse
ca = certifi.where()
USER = 'Irfan'
PWD = 'Fanu916@'
SHARDS = [
    'ac-liw4zgh-shard-00-00.osljpls.mongodb.net:27017',
    'ac-liw4zgh-shard-00-01.osljpls.mongodb.net:27017',
    'ac-liw4zgh-shard-00-02.osljpls.mongodb.net:27017'
]
DB_NAME = 'injuryguard_ai'
MONGO_URI = f'mongodb://{USER}:{urllib.parse.quote_plus(PWD)}@{",".join(SHARDS)}/{DB_NAME}?ssl=true&authSource=admin&retryWrites=true&w=majority'
client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client[DB_NAME]
with open('c:/Users/97335/.gemini/antigravity/scratch/injuryguard_ai/backend/out.txt', 'w', encoding='utf-8') as f:
    f.write('USERS:\n')
    for u in db.users.find(): f.write(f"{u.get('email')}, {u.get('role')}, {u.get('team_name')}\n")
    f.write('PLAYERS:\n')
    for p in db.players.find(): f.write(f"{p.get('name')}, {p.get('team_name')}\n")

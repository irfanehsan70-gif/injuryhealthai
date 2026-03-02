from pymongo import MongoClient
import json
from bson import ObjectId
from datetime import datetime

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['injuryguard_ai']
users_col = db["users"]

user = users_col.find_one({"email": "messi@gmail.com"})
if user:
    user['password'] = '[HIDDEN]'
    print(json.dumps(user, indent=4, cls=JSONEncoder))
else:
    print("User not found.")

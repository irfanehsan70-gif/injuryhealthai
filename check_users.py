from pymongo import MongoClient
MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['injuryguard_ai']
users = db.users.find({}).sort('created_at', -1)
for u in users:
    print(f"{u.get('email')} | {u.get('created_at')} | {u.get('role')}")

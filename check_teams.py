from pymongo import MongoClient
MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['injuryguard_ai']
users_col = db["users"]

for email in ["pep@gmail.com", "messi@gmail.com"]:
    u = users_col.find_one({"email": email})
    if u:
        print(f"{email}: team_name='{u.get('team_name')}'")
    else:
        print(f"{email}: Not found")

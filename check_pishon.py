from pymongo import MongoClient
import urllib.parse

USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_col = db["users"]

user_email = "pishon@gmail.com"
user = users_col.find_one({"email": user_email.lower()})

if user:
    print(f"✅ User found: {user_email}")
    print(f"Name: {user.get('name')}")
    print(f"Role: {user.get('role')}")
    print(f"Team: {user.get('team_name')}")
else:
    print(f"❌ User NOT found: {user_email}")
    # List all users to see what we have
    print("\nExisting users in DB:")
    for u in users_col.find({}, {"email": 1, "role": 1}):
        print(f"- {u.get('email')} ({u.get('role')})")

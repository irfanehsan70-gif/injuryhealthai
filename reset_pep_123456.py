import bcrypt
from pymongo import MongoClient
MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client['injuryguard_ai']
users_col = db["users"]

email = "pep@gmail.com"
password = "123456"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

result = users_col.update_one(
    {"email": email},
    {"$set": {"password": hashed}}
)

if result.modified_count > 0:
    print(f"✅ Success: Password for {email} reset to '123456'")
else:
    print(f"⚠️  No changes made.")

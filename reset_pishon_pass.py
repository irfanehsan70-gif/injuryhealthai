from pymongo import MongoClient
import urllib.parse
import bcrypt

USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"
DB_NAME = "injuryguard_ai"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_col = db["users"]

user_email = "pishon@gmail.com"
new_password = "123456"

hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

result = users_col.update_one(
    {"email": user_email.lower()},
    {"$set": {"password": hashed}}
)

if result.modified_count > 0:
    print(f"✅ SUCCESS: Password for {user_email} has been reset to '{new_password}'.")
else:
    # Check if user exists but has same password (unlikely with salt) or not found
    user = users_col.find_one({"email": user_email})
    if user:
         print(f"ℹ️ User {user_email} already exists, but password update didn't change anything (might be same password or salt issue).")
    else:
         print(f"❌ User NOT found: {user_email}")

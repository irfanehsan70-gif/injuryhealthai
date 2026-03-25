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
user = users_col.find_one({"email": user_email.lower()})

if user:
    pwd_in_db = user.get('password')
    print(f"Password type in DB: {type(pwd_in_db)}")
    print(f"Password value (first 10 chars): {str(pwd_in_db)[:10]}...")
    
    # Test a common password
    test_pwd = "123456"
    if isinstance(pwd_in_db, str):
        pwd_in_db = pwd_in_db.encode('utf-8')
    
    try:
        if bcrypt.checkpw(test_pwd.encode('utf-8'), pwd_in_db):
            print(f"✅ Password '123456' is CORRECT")
        else:
            print(f"❌ Password '123456' is INCORRECT")
    except Exception as e:
        print(f"⚠️ Error checking password: {e}")
else:
    print(f"❌ User NOT found: {user_email}")

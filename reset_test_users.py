from pymongo import MongoClient
import bcrypt
import urllib.parse
import certifi

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI, tlsCAFile=ca)
db = client["injuryguard_ai"]
hashed = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
result = db.users.update_one({"email": "irfan@gmail.com"}, {"$set": {"password": hashed}})
print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

# Verify other users too
pep_hashed = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
db.users.update_one({"email": "pep@gmail.com"}, {"$set": {"password": pep_hashed}})
print("Reset pep@gmail.com to password123 as well.")

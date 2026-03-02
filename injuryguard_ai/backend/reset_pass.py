from pymongo import MongoClient
import bcrypt

MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["injuryguard_ai"]
users = db["users"]

hashed = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt())
users.update_one({"email": "pep@gmail.com"}, {"$set": {"password": hashed}})

print("✅ Password for pep@gmail.com reset to 'password123'")

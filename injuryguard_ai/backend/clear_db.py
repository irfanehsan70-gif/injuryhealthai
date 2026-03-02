from pymongo import MongoClient

MONGO_URI = "mongodb+srv://Irfan:Fanu916%40@cluster0.osljpls.mongodb.net/injuryguard_ai?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "injuryguard_ai"

try:
    print("🚀 Initializing database reset sequence...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    collections = ["users", "predictions", "team_uploads", "players"]
    for col in collections:
        db[col].drop()
        print(f"✅ Dropped collection: {col}")
    
    print("\n✅ All clinical archives purged. System is now in a clean state.")
    client.close()
except Exception as e:
    print(f"❌ Error clearing database: {e}")

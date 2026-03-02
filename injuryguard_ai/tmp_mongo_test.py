from pymongo import MongoClient

password = "N3bov4zSQy5PRvjn"
host = "cluster0.osljpls.mongodb.net"
users_to_try = [
    "irfanehsan70_db_user",
    "Irfan",
    "irfan",
    "irfanehsan70",
    "irfanEhsan70_db_user",
]

for user in users_to_try:
    uri = f"mongodb+srv://{user}:{password}@{host}/"
    try:
        c = MongoClient(uri, serverSelectionTimeoutMS=8000)
        c.admin.command('ping')
        print(f"✅ SUCCESS with username: '{user}'")
        break
    except Exception as e:
        code = getattr(e, 'code', 'N/A')
        print(f"❌ FAILED username: '{user}' | Code: {code}")

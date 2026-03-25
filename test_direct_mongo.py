from pymongo import MongoClient
import urllib.parse
import certifi

ca = certifi.where()
# User's provided SRI points to these shards
shards = [
    "ac-liw4zgh-shard-00-00.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-01.osljpls.mongodb.net:27017",
    "ac-liw4zgh-shard-00-02.osljpls.mongodb.net:27017"
]
USER = "Irfan"
PWD = "Fanu916@"
encoded_pwd = urllib.parse.quote_plus(PWD)

# Standard non-SRV connection string
# We ignore the replicaSet here as long as we can connect to one of them
MONGO_URI = f"mongodb://{USER}:{encoded_pwd}@{','.join(shards)}/injuryguard_ai?ssl=true&authSource=admin&retryWrites=true&w=majority"

print(f"Testing direct URI connection...")
try:
    client = MongoClient(MONGO_URI, tlsCAFile=ca, 
                         serverSelectionTimeoutMS=10000, 
                         connectTimeoutMS=10000)
    
    # Try an operation
    print("Listing collections...")
    print(client.injuryguard_ai.list_collection_names())
    print("✅ SUCCESS with direct URI!")
except Exception as e:
    print(f"❌ FAIL with direct URI: {e}")

# Try another variant if that fails (some M0s use different SSL flags)
if 'e' in locals():
     # Try simple one-host if cluster resolution is failing
     ONE_HOST_URI = f"mongodb://{USER}:{encoded_pwd}@{shards[0]}/injuryguard_ai?ssl=true&authSource=admin"
     print(f"\nTesting ONE-HOST connection...")
     try:
         client = MongoClient(ONE_HOST_URI, tlsCAFile=ca, serverSelectionTimeoutMS=10000)
         print(client.injuryguard_ai.list_collection_names())
         print("✅ SUCCESS with one-host!")
     except Exception as e2:
         print(f"❌ FAIL with one-host: {e2}")

import dns.resolver
import urllib.parse
from pymongo import MongoClient
import certifi

ca = certifi.where()
user = "Irfan"
pwd = "Fanu916@"
domain = "cluster0.osljpls.mongodb.net"

try:
    print(f"Resolving nodes for {domain}...")
    srv_records = dns.resolver.resolve(f'_mongodb._tcp.{domain}', 'SRV')
    nodes = []
    for srv in srv_records:
        node = str(srv.target).rstrip('.')
        port = srv.port
        nodes.append(f"{node}:{port}")
    
    encoded_pwd = urllib.parse.quote_plus(pwd)
    node_list = ",".join(nodes)
    # Construct a non-srv URI
    direct_uri = f"mongodb://{user}:{encoded_pwd}@{node_list}/?ssl=true&replicaSet=atlas-osljpls-shard-0&authSource=admin&appName=Cluster0"
    
    print(f"Constructed direct URI: {direct_uri.replace(encoded_pwd, '****')}")
    client = MongoClient(direct_uri, serverSelectionTimeoutMS=10000, tlsCAFile=ca)
    print(f"Databases: {client.list_database_names()}")
    print("✅ SUCCESS")
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__} - {e}")

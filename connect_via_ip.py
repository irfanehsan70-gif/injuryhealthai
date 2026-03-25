import dns.resolver
import urllib.parse
from pymongo import MongoClient
import certifi
import sys

# Google DNS
resolver = dns.resolver.Resolver()
resolver.nameservers = ['8.8.8.8']

ca = certifi.where()
user = "Irfan"
pwd = "Fanu916@"
domain = "cluster0.osljpls.mongodb.net"

try:
    print(f"🔍 Resolving nodes for {domain} via Google DNS...")
    srv_records = resolver.resolve(f'_mongodb._tcp.{domain}', 'SRV')
    nodes = []
    for srv in srv_records:
        target = str(srv.target).rstrip('.')
        # Resolve the target to an IP
        try:
            ips = resolver.resolve(target, 'A')
            for ip in ips:
                nodes.append(f"{ip}:{srv.port}")
                print(f"Found node: {target} -> {ip}:{srv.port}")
        except Exception as e:
            print(f"Could not resolve A record for {target}: {e}")
    
    if not nodes:
        print("❌ No IPs found for cluster nodes.")
        sys.exit(1)
        
    encoded_pwd = urllib.parse.quote_plus(pwd)
    uri = f"mongodb://{user}:{encoded_pwd}@{','.join(nodes)}/?ssl=true&replicaSet=atlas-osljpls-shard-0&authSource=admin&appName=Cluster0"
    
    print(f"🔄 Connecting to DIRECT IPs...")
    # Use tlsAllowInvalidCertificates because we are connecting to IPs (SNI might be needed though)
    client = MongoClient(uri, serverSelectionTimeoutMS=10000, tlsAllowInvalidCertificates=True, tlsCAFile=ca)
    
    dbs = client.list_database_names()
    print(f"✅ SUCCESS! Databases: {dbs}")
    
except Exception as e:
    print(f"❌ FAILURE: {type(e).__name__} - {e}")
    sys.exit(1)

from pymongo import MongoClient
import urllib.parse
import certifi
import sys

ca = certifi.where()
USER = "Irfan"
PWD = "Fanu916@"
MONGO_URI = f"mongodb+srv://{USER}:{urllib.parse.quote_plus(PWD)}@cluster0.osljpls.mongodb.net/?appName=Cluster0"

def test_conn(with_ca=True):
    try:
        print(f"Testing with_ca={with_ca} ...")
        if with_ca:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsCAFile=ca, tlsAllowInvalidCertificates=True)
        else:
            client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
        client.admin.command('ping')
        print(f"  SUCCESS (with_ca={with_ca})")
    except Exception as e:
        print(f"  FAILURE (with_ca={with_ca}): {e}")

test_conn(with_ca=True)
test_conn(with_ca=False)

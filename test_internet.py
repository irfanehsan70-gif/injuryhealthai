import urllib.request
import socket

try:
    print("🌐 Testing internet access...")
    res = urllib.request.urlopen("http://google.com", timeout=10)
    print(f"✅ Success! Response code: {res.getcode()}")
    
    print("\n🔍 Resolving google.com via default socket...")
    print(f"IP: {socket.gethostbyname('google.com')}")
    
except Exception as e:
    print(f"❌ FAILURE: {e}")

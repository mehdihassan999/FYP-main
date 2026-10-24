import requests
import time

def test_backend():
    base_url = "http://localhost:5000"
    
    print("🧪 Testing CyberX Backend...")
    
    # Test 1: Basic connectivity
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"✅ Basic endpoint: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: Health endpoint
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        print(f"✅ Health endpoint: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
    
    # Test 3: IDS status
    try:
        response = requests.get(f"{base_url}/api/ids/status", timeout=5)
        print(f"✅ IDS status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ IDS status failed: {e}")
    
    return True

if __name__ == "__main__":
    test_backend()
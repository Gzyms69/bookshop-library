import requests
import json

def test_api():
    print("🧪 TESTING API CONNECTION")
    print("=" * 40)
    
    endpoints = [
        "http://localhost:8000/",
        "http://localhost:8000/health", 
        "http://localhost:8000/items",
        "http://localhost:8000/analytics/pricing"
    ]
    
    for endpoint in endpoints:
        try:
            print(f"Testing {endpoint}...")
            response = requests.get(endpoint, timeout=5)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {json.dumps(data, indent=2)[:200]}...")
            else:
                print(f"   Error: {response.text[:100]}")
        except Exception as e:
            print(f"   ❌ Failed: {e}")
        print()

if __name__ == "__main__":
    test_api()
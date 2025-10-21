import requests

# First, test if the backend is running at all
print("1. Testing if backend is up...")
try:
    response = requests.get('http://localhost:8080/api/players')
    print(f"   Players endpoint: {response.status_code}")
except Exception as e:
    print(f"   Backend not running: {e}")
    exit(1)

# Test the game endpoint which works
print("\n2. Testing game endpoint (should work)...")
response = requests.get('http://localhost:8080/api/boxscores/game/1')
print(f"   Game boxscores endpoint: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   Returned {len(data)} box scores")

# Test player endpoint
print("\n3. Testing player endpoint (currently broken)...")
response = requests.get('http://localhost:8080/api/boxscores/player/491')
print(f"   Player boxscores endpoint: {response.status_code}")
if response.status_code != 200:
    print(f"   Error: {response.text}")

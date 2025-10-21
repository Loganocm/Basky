import requests
import json

# Wait a moment for server to fully start
import time
time.sleep(3)

try:
    response = requests.get('http://localhost:8080/api/games/recent?limit=5')
    print(f'Status Code: {response.status_code}')
    print(f'Response: {json.dumps(response.json(), indent=2)}')
except Exception as e:
    print(f'Error: {e}')

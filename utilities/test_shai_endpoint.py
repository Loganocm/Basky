import requests
import json

# Test with Shai's actual ID
player_id = 491

print(f"Testing backend endpoint for Shai Gilgeous-Alexander (ID {player_id})...")
try:
    response = requests.get(f'http://localhost:8080/api/boxscores/player/{player_id}')
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Number of box scores returned: {len(data)}")
        if len(data) > 0:
            print("\nFirst 3 box scores:")
            for i, box_score in enumerate(data[:3]):
                print(f"\n  Box Score {i+1}:")
                print(f"    Game ID: {box_score.get('gameId')}")
                print(f"    Points: {box_score.get('points')}")
                print(f"    Rebounds: {box_score.get('rebounds')}")
                print(f"    Assists: {box_score.get('assists')}")
        else:
            print("No box scores returned from backend!")
    else:
        print(f"Error response: {response.text}")
except Exception as e:
    print(f"Error calling backend: {e}")

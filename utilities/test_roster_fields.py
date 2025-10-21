"""
Quick test to see what fields are available in the CommonTeamRoster API
"""
from nba_api.stats.endpoints import commonteamroster
import time

# Test with one team - Lakers
team_id = 1610612747  # Lakers

try:
    roster = commonteamroster.CommonTeamRoster(
        season='2024-25',
        team_id=team_id
    )
    roster_df = roster.get_data_frames()[0]
    
    print("Available columns in roster data:")
    print(roster_df.columns.tolist())
    
    print("\nSample player data:")
    if len(roster_df) > 0:
        print(roster_df.iloc[0].to_dict())
        
except Exception as e:
    print(f"Error: {e}")

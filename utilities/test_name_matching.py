"""
Test if player names match between roster and stats data
"""
from nba_api.stats.endpoints import commonteamroster, leaguedashplayerstats
import time

season_str = '2024-25'

# Get stats for a few players
player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season=season_str,
    season_type_all_star='Regular Season',
    per_mode_detailed='PerGame'
)
stats_df = player_stats.get_data_frames()[0]

print(f"Total players in stats: {len(stats_df)}")
print(f"\nFirst 10 player names from STATS:")
for i in range(min(10, len(stats_df))):
    print(f"  {stats_df.iloc[i]['PLAYER_NAME']}")

# Get roster for Lakers
time.sleep(0.6)
roster = commonteamroster.CommonTeamRoster(
    season=season_str,
    team_id=1610612747  # Lakers
)
roster_df = roster.get_data_frames()[0]

print(f"\n\nFirst 10 player names from ROSTER:")
for i in range(min(10, len(roster_df))):
    print(f"  {roster_df.iloc[i]['PLAYER']} - Jersey #{roster_df.iloc[i]['NUM']}")

# Check if any names match
stats_names = set(stats_df['PLAYER_NAME'].tolist())
roster_names = set(roster_df['PLAYER'].tolist())
common_names = stats_names.intersection(roster_names)

print(f"\n\nNames that match between stats and roster: {len(common_names)}")
print(f"Sample matching names: {list(common_names)[:5]}")

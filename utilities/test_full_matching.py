"""
Check which players from stats have matching roster data
"""
from nba_api.stats.endpoints import commonteamroster, leaguedashplayerstats
from nba_api.stats.static import teams
import time

season_str = '2024-25'

# Get all stats players
player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season=season_str,
    season_type_all_star='Regular Season',
    per_mode_detailed='PerGame'
)
stats_df = player_stats.get_data_frames()[0]
stats_names = set(stats_df['PLAYER_NAME'].tolist())

print(f"Total players in stats: {len(stats_names)}")

# Get all team rosters
all_teams = teams.get_teams()
player_physical_stats = {}

print("Fetching rosters for all teams...")
for i, team in enumerate(all_teams[:5]):  # Just test first 5 teams
    try:
        if i > 0:
            time.sleep(0.6)
        
        roster = commonteamroster.CommonTeamRoster(
            season=season_str,
            team_id=team['id']
        )
        roster_df = roster.get_data_frames()[0]
        
        for _, player_row in roster_df.iterrows():
            player_name = player_row.get('PLAYER')
            if player_name:
                player_physical_stats[player_name] = {
                    'jersey_number': player_row.get('NUM')
                }
        
        print(f"  {team['abbreviation']}: {len(roster_df)} players")
    except Exception as e:
        print(f"  Error with {team['full_name']}: {e}")

roster_names = set(player_physical_stats.keys())

print(f"\nTotal unique players in rosters: {len(roster_names)}")
print(f"Players in stats but NOT in rosters: {len(stats_names - roster_names)}")
print(f"Players in rosters but NOT in stats: {len(roster_names - stats_names)}")
print(f"Players in BOTH: {len(stats_names.intersection(roster_names))}")

print("\nSample mismatches (in stats but not roster):")
for name in list(stats_names - roster_names)[:10]:
    print(f"  {name}")

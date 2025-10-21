"""
Check if Killian Hayes is in the NBA API data for current season
"""
from nba_api.stats.endpoints import leaguedashplayerstats

season_str = '2024-25'

player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season=season_str,
    season_type_all_star='Regular Season',
    per_mode_detailed='PerGame'
)
stats_df = player_stats.get_data_frames()[0]

# Search for Killian Hayes
killian = stats_df[stats_df['PLAYER_NAME'].str.contains('Killian', case=False, na=False)]

print(f"Players with 'Killian' in name for {season_str}:")
if len(killian) > 0:
    for _, row in killian.iterrows():
        print(f"  {row['PLAYER_NAME']} - Team: {row['TEAM_ABBREVIATION']}, GP: {row['GP']}")
else:
    print("  No players found with 'Killian' in name")
    
# Also check for Hayes
hayes = stats_df[stats_df['PLAYER_NAME'].str.contains('Hayes', case=False, na=False)]
print(f"\nPlayers with 'Hayes' in name:")
for _, row in hayes.iterrows():
    print(f"  {row['PLAYER_NAME']} - Team: {row['TEAM_ABBREVIATION']}, GP: {row['GP']}")

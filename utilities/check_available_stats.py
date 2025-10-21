"""
Check what additional stats are available from the NBA API
that we're currently NOT storing in the database
"""

from nba_api.stats.endpoints import leaguedashplayerstats
import pandas as pd
import time

print("\n" + "="*80)
print("📊 AVAILABLE NBA API STATS - Currently NOT Stored")
print("="*80)

# Fetch the same endpoint we use in the scraper
time.sleep(1)
player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season='2024-25',
    season_type_all_star='Regular Season',
    per_mode_detailed='PerGame'
)
stats_df = player_stats.get_data_frames()[0]

# Stats we currently store
stored_stats = {
    'PLAYER_NAME': 'name',
    'GP': 'games_played',
    'MIN': 'minutes_per_game',
    'PTS': 'points',
    'REB': 'rebounds',
    'AST': 'assists',
    'STL': 'steals',
    'BLK': 'blocks',
    'TOV': 'turnovers',
    'FG_PCT': 'field_goal_percentage',
    'FG3_PCT': 'three_point_percentage',
    'FT_PCT': 'free_throw_percentage',
    'PLAYER_ID': '(used for lookups)',
    'TEAM_ID': '(used for team mapping)',
}

# Get all available columns
all_columns = list(stats_df.columns)

print("\n✅ CURRENTLY STORED:")
print("-" * 80)
for api_col, db_col in stored_stats.items():
    print(f"   {api_col:30} -> {db_col}")

print(f"\n❌ NOT STORED (but available!):")
print("-" * 80)

not_stored = [col for col in all_columns if col not in stored_stats.keys()]

# Categorize them
print("\n🏀 SHOOTING STATS:")
shooting_stats = [col for col in not_stored if 'FG' in col or 'FT' in col or '3' in col]
for stat in shooting_stats:
    print(f"   {stat:30} (Field goals, 3-pointers, Free throws)")

print("\n📊 REBOUNDING BREAKDOWN:")
rebounding_stats = [col for col in not_stored if 'REB' in col and col != 'REB']
for stat in rebounding_stats:
    print(f"   {stat:30} (Offensive/Defensive rebounds)")

print("\n⭐ ADVANCED METRICS:")
advanced_stats = [col for col in not_stored if any(x in col for x in ['PLUS_MINUS', 'FANTASY', 'DD', 'TD'])]
for stat in advanced_stats:
    desc = ""
    if 'PLUS_MINUS' in stat:
        desc = "(+/- rating)"
    elif 'FANTASY' in stat:
        desc = "(Fantasy points)"
    elif 'DD2' in stat:
        desc = "(Double-Doubles)"
    elif 'TD3' in stat:
        desc = "(Triple-Doubles)"
    print(f"   {stat:30} {desc}")

print("\n🎯 OTHER STATS:")
other_stats = [col for col in not_stored if col not in shooting_stats + rebounding_stats + advanced_stats]
other_stats = [col for col in other_stats if not col.endswith('_RANK')]
for stat in other_stats:
    desc = ""
    if stat == 'PF':
        desc = "(Personal Fouls)"
    elif stat == 'PFD':
        desc = "(Personal Fouls Drawn)"
    elif stat == 'W' or stat == 'L':
        desc = "(Team Wins/Losses while playing)"
    elif stat == 'W_PCT':
        desc = "(Win Percentage)"
    elif stat == 'NICKNAME':
        desc = "(Player nickname)"
    elif stat == 'TEAM_ABBREVIATION':
        desc = "(Team abbrev)"
    elif stat == 'TEAM_COUNT':
        desc = "(Number of teams played for)"
    elif stat == 'AGE':
        desc = "(Player age)"
    print(f"   {stat:30} {desc}")

# Show sample data for a top player
print("\n" + "="*80)
print("📋 SAMPLE DATA - Top Player")
print("="*80)

top_player = stats_df.iloc[0]
print(f"\nPlayer: {top_player['PLAYER_NAME']}")
print(f"Team: {top_player['TEAM_ABBREVIATION']}")

print(f"\n✅ Currently Stored:")
print(f"   Points: {top_player['PTS']:.1f}")
print(f"   Rebounds: {top_player['REB']:.1f}")
print(f"   Assists: {top_player['AST']:.1f}")

print(f"\n❌ NOT Stored (but available):")
print(f"   Offensive Rebounds: {top_player['OREB']:.1f}")
print(f"   Defensive Rebounds: {top_player['DREB']:.1f}")
print(f"   Plus/Minus: {top_player['PLUS_MINUS']:.1f}")
print(f"   Fantasy Points: {top_player['NBA_FANTASY_PTS']:.1f}")
print(f"   Double-Doubles: {top_player['DD2']}")
print(f"   Triple-Doubles: {top_player['TD3']}")
print(f"   Personal Fouls: {top_player['PF']:.1f}")
print(f"   FG Made: {top_player['FGM']:.1f}")
print(f"   FG Attempted: {top_player['FGA']:.1f}")
print(f"   3PM: {top_player['FG3M']:.1f}")
print(f"   3PA: {top_player['FG3A']:.1f}")
print(f"   FTM: {top_player['FTM']:.1f}")
print(f"   FTA: {top_player['FTA']:.1f}")

# Calculate what we COULD calculate with this data
print(f"\n💡 Metrics we COULD calculate with this data:")
ts_pct = top_player['PTS'] / (2 * (top_player['FGA'] + 0.44 * top_player['FTA']))
efg_pct = (top_player['FGM'] + 0.5 * top_player['FG3M']) / top_player['FGA']
print(f"   True Shooting %: {ts_pct:.1%}")
print(f"   Effective FG %: {efg_pct:.1%}")

print("\n" + "="*80)
print("💡 RECOMMENDATION:")
print("="*80)
print("""
Add these columns to your database for HUGE frontend improvements:

HIGH PRIORITY (Easy wins):
  - offensive_rebounds, defensive_rebounds (better than just total rebounds)
  - plus_minus (shows impact beyond stats)
  - fantasy_points (pre-calculated by NBA)
  - double_doubles, triple_doubles (achievement tracking)
  - personal_fouls (complete player profile)
  
MEDIUM PRIORITY (For calculations):
  - field_goals_made, field_goals_attempted
  - three_pointers_made, three_pointers_attempted
  - free_throws_made, free_throws_attempted
  - (These enable True Shooting %, Effective FG%, etc.)

LOW PRIORITY (Nice to have):
  - age, nickname
  - team_count (shows if player was traded)
  - personal_fouls_drawn
  - wins, losses while playing
""")

print("\n" + "="*80 + "\n")

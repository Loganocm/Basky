import psycopg2

conn = psycopg2.connect(
    dbname='nba_stats_db',
    user='postgres',
    password='1738',
    host='localhost',
    port='5432'
)

cur = conn.cursor()

# Check Bruno Fernando in database
cur.execute("""
    SELECT p.name, p.position, p.points, t.abbreviation, t.name
    FROM players p 
    LEFT JOIN teams t ON p.team_id = t.id 
    WHERE p.name LIKE '%Fernando%'
""")

print("\n" + "="*60)
print("Bruno Fernando Investigation")
print("="*60)

results = cur.fetchall()
if results:
    for row in results:
        print(f"\nPlayer: {row[0]}")
        print(f"Position in DB: {row[1]}")
        print(f"Points: {row[2]}")
        print(f"Team Abbrev: {row[3]}")
        print(f"Team Name: {row[4]}")
else:
    print("No players found matching 'Fernando'")

# Now check if he exists in the roster data
print("\n" + "="*60)
print("Checking NBA API Roster Data")
print("="*60)

from nba_api.stats.endpoints import commonteamroster
from nba_api.stats.static import teams
import time

all_teams = teams.get_teams()

found_in_rosters = []
for i, team in enumerate(all_teams):
    try:
        if i > 0:
            time.sleep(0.6)
        
        roster = commonteamroster.CommonTeamRoster(season='2024-25', team_id=team['id'])
        roster_df = roster.get_data_frames()[0]
        
        for _, player_row in roster_df.iterrows():
            player_name = player_row.get('PLAYER')
            if 'Fernando' in player_name:
                found_in_rosters.append({
                    'name': player_name,
                    'position': player_row.get('POSITION'),
                    'team': team['abbreviation'],
                    'team_name': team['full_name']
                })
                print(f"\nFound: {player_name}")
                print(f"  Position: {player_row.get('POSITION')}")
                print(f"  Team: {team['full_name']} ({team['abbreviation']})")
    except Exception as e:
        continue

if not found_in_rosters:
    print("\n❌ Bruno Fernando not found in any current team rosters for 2024-25 season")
    print("   This likely means he's not on an active roster for this season.")

# Check player stats endpoint
print("\n" + "="*60)
print("Checking Player Stats Endpoint")
print("="*60)

from nba_api.stats.endpoints import leaguedashplayerstats

player_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season='2024-25',
    season_type_all_star='Regular Season',
    per_mode_detailed='PerGame'
)
stats_df = player_stats.get_data_frames()[0]

fernando_stats = stats_df[stats_df['PLAYER_NAME'].str.contains('Fernando', case=False, na=False)]
if not fernando_stats.empty:
    print("\nFound in stats:")
    for _, row in fernando_stats.iterrows():
        print(f"  Name: {row['PLAYER_NAME']}")
        print(f"  Team ID: {row['TEAM_ID']}")
        print(f"  Points: {row['PTS']}")
        print(f"  Games: {row['GP']}")
else:
    print("\n❌ Not found in player stats for 2024-25 season")

conn.close()

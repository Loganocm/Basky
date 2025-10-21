"""Verify that all 37 fields in the players table are properly populated."""

import psycopg2
import pandas as pd

# Database connection
conn = psycopg2.connect(
    dbname="nba_stats_db",
    user="postgres",
    password="1738",
    host="localhost",
    port="5432"
)

print("=== EXTENDED SCHEMA VERIFICATION ===\n")

# 1. Check total columns
cur = conn.cursor()
cur.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'players'
    ORDER BY ordinal_position;
""")
columns = cur.fetchall()
print(f"✅ Total columns in players table: {len(columns)}")
print("\nColumn Structure:")
for col_name, data_type, nullable in columns:
    print(f"  - {col_name:35} {data_type:20} {'NULL' if nullable == 'YES' else 'NOT NULL'}")

# 2. Sample player with all stats
print("\n=== SAMPLE PLAYER (All Fields) ===\n")
cur.execute("""
    SELECT * FROM players 
    WHERE games_played > 10 
    ORDER BY points DESC 
    LIMIT 1;
""")
sample = cur.fetchone()
col_names = [desc[0] for desc in cur.description]

if sample:
    print(f"Player: {sample[col_names.index('name')]}")
    print(f"Position: {sample[col_names.index('position')]}")
    print(f"Games: {sample[col_names.index('games_played')]}")
    print(f"\nBasic Stats:")
    print(f"  PPG: {sample[col_names.index('points')]}")
    print(f"  RPG: {sample[col_names.index('rebounds')]}")
    print(f"  APG: {sample[col_names.index('assists')]}")
    
    print(f"\nShooting Details:")
    print(f"  FGM: {sample[col_names.index('field_goals_made')]}")
    print(f"  FGA: {sample[col_names.index('field_goals_attempted')]}")
    print(f"  3PM: {sample[col_names.index('three_pointers_made')]}")
    print(f"  3PA: {sample[col_names.index('three_pointers_attempted')]}")
    print(f"  FTM: {sample[col_names.index('free_throws_made')]}")
    print(f"  FTA: {sample[col_names.index('free_throws_attempted')]}")
    print(f"  OREB: {sample[col_names.index('offensive_rebounds')]}")
    print(f"  DREB: {sample[col_names.index('defensive_rebounds')]}")
    
    print(f"\nAdvanced Metrics:")
    print(f"  +/-: {sample[col_names.index('plus_minus')]}")
    print(f"  Fantasy Points: {sample[col_names.index('fantasy_points')]}")
    print(f"  Double Doubles: {sample[col_names.index('double_doubles')]}")
    print(f"  Triple Doubles: {sample[col_names.index('triple_doubles')]}")
    print(f"  Personal Fouls: {sample[col_names.index('personal_fouls')]}")
    
    print(f"\nPlayer Info:")
    print(f"  Age: {sample[col_names.index('age')]}")
    print(f"  Height: {sample[col_names.index('height')]}")
    print(f"  Weight: {sample[col_names.index('weight')]}")
    
    print(f"\nCalculated Metrics:")
    print(f"  Efficiency Rating: {sample[col_names.index('efficiency_rating')]}")
    print(f"  True Shooting %: {sample[col_names.index('true_shooting_percentage')]}")
    print(f"  Effective FG %: {sample[col_names.index('effective_field_goal_percentage')]}")
    print(f"  AST/TO Ratio: {sample[col_names.index('assist_to_turnover_ratio')]}")
    print(f"  Impact Score: {sample[col_names.index('impact_score')]}")
    print(f"  Usage Rate: {sample[col_names.index('usage_rate')]}")
    print(f"  PER: {sample[col_names.index('player_efficiency_rating')]}")

# 3. Check for NULL values in each new column
print("\n\n=== NULL VALUE ANALYSIS ===\n")
new_columns = [
    'offensive_rebounds', 'defensive_rebounds', 
    'field_goals_made', 'field_goals_attempted',
    'three_pointers_made', 'three_pointers_attempted',
    'free_throws_made', 'free_throws_attempted',
    'plus_minus', 'fantasy_points', 'double_doubles', 'triple_doubles', 'personal_fouls',
    'age', 'height', 'weight',
    'efficiency_rating', 'true_shooting_percentage', 'effective_field_goal_percentage',
    'assist_to_turnover_ratio', 'impact_score', 'usage_rate', 'player_efficiency_rating'
]

for col in new_columns:
    cur.execute(f"""
        SELECT 
            COUNT(*) as total,
            COUNT({col}) as non_null,
            COUNT(*) - COUNT({col}) as null_count
        FROM players;
    """)
    total, non_null, null_count = cur.fetchone()
    coverage = (non_null / total * 100) if total > 0 else 0
    status = "✅" if coverage > 95 else ("⚠️" if coverage > 80 else "❌")
    print(f"{status} {col:35} {non_null:4}/{total:4} ({coverage:5.1f}%)")

# 4. Check calculated metrics validity
print("\n\n=== CALCULATED METRICS VALIDATION ===\n")
cur.execute("""
    SELECT 
        name,
        points, field_goals_attempted, free_throws_attempted,
        true_shooting_percentage,
        field_goals_made, three_pointers_made,
        effective_field_goal_percentage,
        assists, turnovers, assist_to_turnover_ratio
    FROM players
    WHERE games_played >= 10
    AND field_goals_attempted > 0
    ORDER BY points DESC
    LIMIT 5;
""")

print("\nTop 5 Scorers - Metric Validation:\n")
for row in cur.fetchall():
    name, pts, fga, fta, ts_pct, fgm, tpm, efg_pct, ast, tov, ast_to = row
    print(f"{name}")
    # Display percentages correctly (stored as decimals, display as %)
    ts_display = (ts_pct * 100) if ts_pct else 0
    efg_display = (efg_pct * 100) if efg_pct else 0
    print(f"  TS%: {ts_display:.1f}% | eFG%: {efg_display:.1f}% | AST/TO: {ast_to:.2f}")
    
    # Manually calculate to verify
    if fga and fga > 0:
        calc_ts = (pts / (2 * (fga + 0.44 * (fta or 0)))) * 100 if fga else 0
        calc_efg = ((fgm + 0.5 * tpm) / fga) * 100 if fga else 0
        match_ts = "✅" if abs(ts_display - calc_ts) < 0.5 else "❌"
        match_efg = "✅" if abs(efg_display - calc_efg) < 0.5 else "❌"
        print(f"  Verify: TS% {match_ts} ({calc_ts:.1f}%) | eFG% {match_efg} ({calc_efg:.1f}%)")
    print()

print("\n✅ Extended schema verification complete!")

cur.close()
conn.close()

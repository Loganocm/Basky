"""
Demo: Calculate Advanced Stats from Current Database
Shows what additional metrics can be computed from existing data
"""

import psycopg2
import statistics

DB_CONFIG = {
    'dbname': 'nba_stats_db',
    'user': 'postgres',
    'password': '1738',
    'host': 'localhost',
    'port': '5432'
}

def calculate_player_metrics(player):
    """Calculate advanced metrics for a single player"""
    
    metrics = {}
    
    # Efficiency Rating (simplified PER)
    if player['games_played']:
        metrics['efficiency_rating'] = round(
            (player['points'] + player['rebounds'] + player['assists'] + 
             player['steals'] + player['blocks'] - player['turnovers']) / 
            player['games_played'], 2
        )
    else:
        metrics['efficiency_rating'] = 0
    
    # Assist-to-Turnover Ratio
    if player['turnovers'] and player['turnovers'] > 0:
        metrics['ast_to_ratio'] = round(player['assists'] / player['turnovers'], 2)
    else:
        metrics['ast_to_ratio'] = player['assists'] if player['assists'] else 0
    
    # Impact Score (per game)
    metrics['impact_score'] = round(
        player['points'] + player['rebounds'] + player['assists'] + 
        (player['steals'] * 2) + (player['blocks'] * 2) - player['turnovers'], 2
    )
    
    # Fantasy Points (per game)
    metrics['fantasy_points'] = round(
        player['points'] + 
        (player['rebounds'] * 1.2) + 
        (player['assists'] * 1.5) + 
        (player['steals'] * 3.0) + 
        (player['blocks'] * 3.0) - 
        player['turnovers'], 2
    )
    
    # Stock (Steals + Blocks combined)
    metrics['stock'] = round(player['steals'] + player['blocks'], 2)
    
    # Shooting Efficiency Grade
    shooting_avg = (
        player['field_goal_percentage'] + 
        player['three_point_percentage'] + 
        player['free_throw_percentage']
    ) / 3 if all([player['field_goal_percentage'], 
                   player['three_point_percentage'], 
                   player['free_throw_percentage']]) else 0
    
    if shooting_avg >= 0.55:
        metrics['shooting_grade'] = 'A+'
    elif shooting_avg >= 0.50:
        metrics['shooting_grade'] = 'A'
    elif shooting_avg >= 0.45:
        metrics['shooting_grade'] = 'B'
    elif shooting_avg >= 0.40:
        metrics['shooting_grade'] = 'C'
    else:
        metrics['shooting_grade'] = 'D'
    
    return metrics

def get_league_averages(conn):
    """Calculate league averages for comparison"""
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            AVG(points) as avg_points,
            AVG(rebounds) as avg_rebounds,
            AVG(assists) as avg_assists,
            AVG(steals) as avg_steals,
            AVG(blocks) as avg_blocks,
            AVG(turnovers) as avg_turnovers,
            AVG(field_goal_percentage) as avg_fg_pct,
            AVG(three_point_percentage) as avg_3p_pct,
            AVG(free_throw_percentage) as avg_ft_pct
        FROM players
        WHERE games_played > 10
    """)
    
    row = cur.fetchone()
    return {
        'points': row[0] or 0,
        'rebounds': row[1] or 0,
        'assists': row[2] or 0,
        'steals': row[3] or 0,
        'blocks': row[4] or 0,
        'turnovers': row[5] or 0,
        'fg_pct': row[6] or 0,
        '3p_pct': row[7] or 0,
        'ft_pct': row[8] or 0
    }

def calculate_percentile(value, all_values):
    """Calculate what percentile this value is in"""
    if not all_values or value is None:
        return 50
    
    sorted_values = sorted([v for v in all_values if v is not None])
    if not sorted_values:
        return 50
    
    count_below = sum(1 for v in sorted_values if v < value)
    percentile = (count_below / len(sorted_values)) * 100
    return round(percentile, 1)

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Get all players
    cur.execute("""
        SELECT p.name, p.position, p.games_played, p.minutes_per_game,
               p.points, p.rebounds, p.assists, p.steals, p.blocks, p.turnovers,
               p.field_goal_percentage, p.three_point_percentage, p.free_throw_percentage,
               t.abbreviation as team
        FROM players p
        LEFT JOIN teams t ON p.team_id = t.id
        WHERE p.games_played > 20
        ORDER BY p.points DESC
    """)
    
    players = []
    for row in cur.fetchall():
        players.append({
            'name': row[0],
            'position': row[1],
            'games_played': row[2] or 0,
            'minutes_per_game': row[3] or 0,
            'points': row[4] or 0,
            'rebounds': row[5] or 0,
            'assists': row[6] or 0,
            'steals': row[7] or 0,
            'blocks': row[8] or 0,
            'turnovers': row[9] or 0,
            'field_goal_percentage': row[10] or 0,
            'three_point_percentage': row[11] or 0,
            'free_throw_percentage': row[12] or 0,
            'team': row[13]
        })
    
    # Get league averages
    league_avg = get_league_averages(conn)
    
    print("\n" + "="*80)
    print("🏀 ADVANCED STATS DEMONSTRATION")
    print("="*80)
    
    print(f"\n📊 League Averages (Players with 10+ games):")
    print(f"   Points: {league_avg['points']:.1f} | Rebounds: {league_avg['rebounds']:.1f} | Assists: {league_avg['assists']:.1f}")
    print(f"   FG%: {league_avg['fg_pct']:.1%} | 3P%: {league_avg['3p_pct']:.1%} | FT%: {league_avg['ft_pct']:.1%}")
    
    # Calculate metrics for top players
    print("\n" + "="*80)
    print("🌟 TOP 10 PLAYERS - ADVANCED METRICS")
    print("="*80)
    
    # Get all impact scores for percentile calculation
    all_impact_scores = []
    all_fantasy_points = []
    all_efficiency = []
    
    for player in players:
        metrics = calculate_player_metrics(player)
        all_impact_scores.append(metrics['impact_score'])
        all_fantasy_points.append(metrics['fantasy_points'])
        all_efficiency.append(metrics['efficiency_rating'])
    
    for i, player in enumerate(players[:10]):
        metrics = calculate_player_metrics(player)
        
        # Calculate percentiles
        impact_percentile = calculate_percentile(metrics['impact_score'], all_impact_scores)
        fantasy_percentile = calculate_percentile(metrics['fantasy_points'], all_fantasy_points)
        
        # Above/Below average indicators
        pts_vs_avg = player['points'] - league_avg['points']
        reb_vs_avg = player['rebounds'] - league_avg['rebounds']
        ast_vs_avg = player['assists'] - league_avg['assists']
        
        print(f"\n{i+1}. {player['name']} ({player['position']}) - {player['team']}")
        print(f"   Games: {player['games_played']} | MPG: {player['minutes_per_game']:.1f}")
        print(f"   Stats: {player['points']:.1f} PTS | {player['rebounds']:.1f} REB | {player['assists']:.1f} AST")
        print(f"   Stock: {metrics['stock']:.1f} (STL+BLK)")
        print(f"   ")
        print(f"   📈 Advanced Metrics:")
        print(f"      Efficiency Rating: {metrics['efficiency_rating']:.1f}")
        print(f"      Impact Score: {metrics['impact_score']:.1f} ({impact_percentile:.0f}th percentile)")
        print(f"      Fantasy Points: {metrics['fantasy_points']:.1f} ({fantasy_percentile:.0f}th percentile)")
        print(f"      AST/TO Ratio: {metrics['ast_to_ratio']:.2f}")
        print(f"      Shooting Grade: {metrics['shooting_grade']}")
        print(f"   ")
        print(f"   📊 vs League Average:")
        print(f"      Points: {'+' if pts_vs_avg > 0 else ''}{pts_vs_avg:.1f}")
        print(f"      Rebounds: {'+' if reb_vs_avg > 0 else ''}{reb_vs_avg:.1f}")
        print(f"      Assists: {'+' if ast_vs_avg > 0 else ''}{ast_vs_avg:.1f}")
    
    # Position Leaders
    print("\n" + "="*80)
    print("🏆 POSITION LEADERS (by Impact Score)")
    print("="*80)
    
    positions = {}
    for player in players:
        pos = player['position']
        if pos and pos not in positions:
            metrics = calculate_player_metrics(player)
            positions[pos] = {
                'player': player,
                'metrics': metrics
            }
    
    for pos, data in sorted(positions.items()):
        player = data['player']
        metrics = data['metrics']
        print(f"\n{pos:10} {player['name']:30} ({player['team']})")
        print(f"           {player['points']:.1f} PTS | Impact: {metrics['impact_score']:.1f} | Fantasy: {metrics['fantasy_points']:.1f}")
    
    # Badges/Awards
    print("\n" + "="*80)
    print("🎖️  SPECIAL BADGES")
    print("="*80)
    
    for player in players:
        metrics = calculate_player_metrics(player)
        badges = []
        
        # Elite Scorer
        if player['points'] >= 25:
            badges.append("🔥 Elite Scorer")
        
        # Double-Double Machine
        if player['points'] >= 10 and player['rebounds'] >= 10:
            badges.append("💪 Double-Double Machine")
        
        # Triple-Double Threat
        if player['points'] >= 15 and player['rebounds'] >= 8 and player['assists'] >= 8:
            badges.append("⭐ Triple-Double Threat")
        
        # Defensive Anchor
        if metrics['stock'] >= 2.5:
            badges.append("🛡️ Defensive Anchor")
        
        # Elite Playmaker
        if player['assists'] >= 7 and metrics['ast_to_ratio'] >= 2.5:
            badges.append("🎯 Elite Playmaker")
        
        # Efficient Scorer
        if player['field_goal_percentage'] >= 0.55 and player['points'] >= 15:
            badges.append("📊 Efficient Scorer")
        
        # Iron Man
        if player['games_played'] >= 70 and player['minutes_per_game'] >= 30:
            badges.append("💪 Iron Man")
        
        if badges:
            print(f"\n{player['name']:30} ({player['team']})")
            for badge in badges:
                print(f"   {badge}")
    
    print("\n" + "="*80 + "\n")
    
    conn.close()

if __name__ == "__main__":
    main()

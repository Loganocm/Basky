# Advanced NBA Stats Guide

## 🎯 Calculated Stats from Current Data

### **1. Efficiency Metrics**

#### **Player Efficiency Rating (PER) - Simplified**

```python
# Formula (simplified version):
PER = (points + rebounds + assists + steals + blocks - turnovers) / games_played
```

#### **True Shooting Percentage (TS%)**

Measures shooting efficiency accounting for 3-pointers and free throws

```python
# You need: FGM, FGA, FTM, FTA, 3PM (field goals made/attempted, free throws, 3-pointers)
# TS% = PTS / (2 * (FGA + 0.44 * FTA))
# Note: NBA API provides these in the same endpoint you're using!
```

#### **Effective Field Goal Percentage (eFG%)**

Adjusts for 3-pointers being worth more

```python
# eFG% = (FGM + 0.5 * 3PM) / FGA
# Available from NBA API
```

### **2. Advanced Metrics**

#### **Assist-to-Turnover Ratio**

```python
assist_to_turnover_ratio = assists / turnovers
# Higher is better (guards typically 2.0+, elite is 3.0+)
```

#### **Usage Rate** (requires additional data)

What percentage of team plays a player uses while on court

#### **Offensive/Defensive Rating** (requires +/- data)

Points scored/allowed per 100 possessions

#### **Win Shares** (complex calculation)

Estimate of wins contributed by player

### **3. Fantasy/Impact Scores**

#### **Fantasy Points**

```python
fantasy_points = (points * 1.0) + (rebounds * 1.2) + (assists * 1.5) +
                 (steals * 3.0) + (blocks * 3.0) - (turnovers * 1.0)
```

#### **Impact Score**

```python
impact_score = (points + rebounds + assists + steals + blocks) - turnovers
```

### **4. Comparison Metrics**

#### **Above Average Rating**

Compare player to league average in each category

```python
# For each stat: (player_stat - league_avg) / league_std_dev
```

#### **Position Rank**

Rank players within their position

#### **Percentile Scores**

Where does player rank vs all players (0-100%)

---

## 📊 Additional Stats Available from NBA API (FREE!)

### **Already Using: `LeagueDashPlayerStats`**

You're already using this! It has MORE columns than you're currently storing:

#### **Available but Not Stored:**

- `OREB` - Offensive Rebounds
- `DREB` - Defensive Rebounds
- `FGM`, `FGA` - Field Goals Made/Attempted (for TS% calculation)
- `FG3M`, `FG3A` - 3-Point Makes/Attempts
- `FTM`, `FTA` - Free Throws Made/Attempts
- `PF` - Personal Fouls
- `PLUS_MINUS` - Plus/Minus rating
- `NBA_FANTASY_PTS` - Official NBA fantasy points
- `DD2` - Double-Doubles
- `TD3` - Triple-Doubles

### **Other NBA API Endpoints (Free)**

#### **1. Advanced Stats: `LeagueDashPlayerStats` with different modes**

```python
# Usage Rate, Offensive Rating, Defensive Rating, etc.
from nba_api.stats.endpoints import leaguedashplayerstats

advanced_stats = leaguedashplayerstats.LeagueDashPlayerStats(
    season='2024-25',
    measure_type_detailed_defense='Advanced',  # or 'Defense', 'Scoring', etc.
    per_mode_detailed='PerGame'
)
```

#### **2. Player Game Logs: `PlayerGameLog`**

Recent game performance, hot/cold streaks

```python
from nba_api.stats.endpoints import playergamelog

game_log = playergamelog.PlayerGameLog(
    player_id=player_id,
    season='2024-25'
)
# Calculate: Last 5 games average, trending up/down, consistency
```

#### **3. Shot Chart Data: `ShotChartDetail`**

Where players shoot from (requires visualization)

```python
from nba_api.stats.endpoints import shotchartdetail

shot_chart = shotchartdetail.ShotChartDetail(
    team_id=0,
    player_id=player_id,
    season_nullable='2024-25',
    context_measure_simple='FGA'
)
# Shows shot locations, percentages by zone
```

#### **4. Hustle Stats: `LeagueDashPtStats`**

```python
from nba_api.stats.endpoints import leaguedashptstats

# Tracking stats: Deflections, Charges Drawn, Screen Assists, etc.
hustle_stats = leaguedashptstats.LeagueDashPtStats(
    season='2024-25',
    pt_measure_type='Hustle'  # or 'Defense', 'Drives', 'Passing', etc.
)
```

---

## 🌐 Free External APIs & Data Sources

### **1. ESPN API (Unofficial but Reliable)**

```
http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard
http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/{team}/roster
```

- News, injury reports, player photos
- No authentication needed
- Rate limits unknown but generous

### **2. Balldontlie API** (Free tier available)

```
https://www.balldontlie.io/api/v1/stats
https://www.balldontlie.io/api/v1/players
```

- Clean REST API
- Historical stats
- 60 requests/minute free tier

### **3. SportsData.io** (Free tier: 1000 calls/month)

- Player props/betting odds
- Injuries and news
- Game odds and predictions

### **4. The Odds API** (Free tier available)

```
https://api.the-odds-api.com/v4/sports/basketball_nba/odds
```

- Betting odds (can indicate expected performance)
- 500 requests/month free

### **5. News APIs**

**News API** (Free tier)

```
https://newsapi.org/v2/everything?q=NBA+{player_name}
```

**Reddit API** (Free)

- r/nba sentiment analysis
- Trending players

---

## 🎨 Cool Frontend Display Ideas

### **1. Player Card Metrics**

```
⭐ Impact Score: 28.5 (Top 5%)
📊 Efficiency: 24.8 PER
🎯 True Shooting: 62.3%
🔥 Hot Streak: +4.2 last 5 games
📈 Season Trend: ↗️ +12%
```

### **2. Comparison Spider Chart**

Compare player vs league average in 6 categories:

- Scoring
- Rebounding
- Playmaking
- Defense
- Efficiency
- Durability

### **3. Performance Badges**

```
🏆 Triple-Double Machine (5+ this season)
🎯 Elite Shooter (50/40/90 club)
🛡️ Defensive Anchor (1.5+ STL+BLK)
🔥 Hot Hand (Last 5 games > season avg)
📊 Mr. Consistent (Low variance)
💪 Iron Man (85%+ games played)
```

### **4. Dynamic Stats**

- **Momentum**: Last 10 games vs season average
- **Clutch Factor**: 4th quarter performance (requires game log)
- **Fantasy Value**: Points per $ (if you have salary data)
- **Breakout Score**: Improvement over last season

### **5. Heat Maps**

- Shot chart visualization
- Performance by day of week
- Home vs Away splits
- Conference/division performance

---

## 🔧 Recommended New Columns to Add

### **High Priority:**

```sql
ALTER TABLE players ADD COLUMN offensive_rebounds DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN defensive_rebounds DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN plus_minus DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN fantasy_points DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN double_doubles INTEGER;
ALTER TABLE players ADD COLUMN triple_doubles INTEGER;

-- Calculated columns
ALTER TABLE players ADD COLUMN efficiency_rating DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN assist_to_turnover_ratio DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN impact_score DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN true_shooting_percentage DOUBLE PRECISION;
```

### **Medium Priority:**

```sql
ALTER TABLE players ADD COLUMN personal_fouls DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN fouls_drawn DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN field_goals_made DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN field_goals_attempted DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN three_pointers_made DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN three_pointers_attempted DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN free_throws_made DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN free_throws_attempted DOUBLE PRECISION;
```

### **Advanced (Requires separate API calls):**

```sql
-- From game logs
ALTER TABLE players ADD COLUMN last_5_games_avg DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN season_high_points INTEGER;
ALTER TABLE players ADD COLUMN consistency_score DOUBLE PRECISION;

-- From tracking stats
ALTER TABLE players ADD COLUMN deflections DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN screen_assists DOUBLE PRECISION;
ALTER TABLE players ADD COLUMN charges_drawn INTEGER;

-- From external sources
ALTER TABLE players ADD COLUMN injury_status VARCHAR(50);
ALTER TABLE players ADD COLUMN news_sentiment DOUBLE PRECISION; -- -1 to 1
ALTER TABLE players ADD COLUMN player_photo_url VARCHAR(500);
```

---

## 🚀 Implementation Priority

### **Phase 1: Quick Wins** (Use data you already fetch)

1. Add OREB, DREB, PLUS_MINUS, DD2, TD3 from current API call
2. Calculate efficiency metrics from existing data
3. Add fantasy points calculation

### **Phase 2: Enhanced Stats** (Same endpoint, different params)

1. Fetch advanced stats (Usage Rate, Off/Def Rating)
2. Add shooting splits (FGM/FGA, 3PM/3PA, FTM/FTA)
3. Calculate True Shooting %

### **Phase 3: Dynamic Data** (New API calls)

1. Add player game logs for recent performance
2. Calculate trending/momentum metrics
3. Add consistency scores

### **Phase 4: External Data** (Other APIs)

1. Player photos from ESPN
2. Injury status
3. News/sentiment analysis

---

## 💡 Sample Calculated Stat Script

```python
def calculate_advanced_stats(player_data):
    """Calculate advanced stats from basic stats"""

    # Efficiency Rating (simplified PER)
    efficiency = (
        player_data['points'] +
        player_data['rebounds'] +
        player_data['assists'] +
        player_data['steals'] +
        player_data['blocks'] -
        player_data['turnovers']
    ) / player_data['games_played']

    # Assist to Turnover Ratio
    ast_to = player_data['assists'] / max(player_data['turnovers'], 0.1)

    # Impact Score
    impact = (
        player_data['points'] +
        player_data['rebounds'] +
        player_data['assists'] +
        player_data['steals'] * 2 +
        player_data['blocks'] * 2 -
        player_data['turnovers']
    )

    # Fantasy Points (standard scoring)
    fantasy = (
        player_data['points'] +
        player_data['rebounds'] * 1.2 +
        player_data['assists'] * 1.5 +
        player_data['steals'] * 3 +
        player_data['blocks'] * 3 -
        player_data['turnovers']
    )

    return {
        'efficiency_rating': round(efficiency, 2),
        'assist_to_turnover_ratio': round(ast_to, 2),
        'impact_score': round(impact, 2),
        'fantasy_points': round(fantasy, 2)
    }
```

Would you like me to implement any of these? I can:

1. **Add new columns** to your database
2. **Update the scraper** to fetch additional stats
3. **Create calculation scripts** for derived metrics
4. **Build integration** with external APIs

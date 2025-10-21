# Backend API Reference

## Base URL

```
http://localhost:8080
```

## Endpoints

### Players

#### Get All Players

```http
GET /api/players
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "LeBron James",
    "firstName": "LeBron",
    "lastName": "James",
    "team": "Los Angeles Lakers",
    "position": "SF"
  }
]
```

#### Get Player by ID

```http
GET /api/players/{id}
```

#### Search Players

```http
GET /api/players/search?name=LeBron
GET /api/players/search?team=Lakers
```

#### Create Player

```http
POST /api/players
Content-Type: application/json

{
  "name": "Stephen Curry",
  "team": "Golden State Warriors",
  "position": "PG"
}
```

#### Update Player

```http
PUT /api/players/{id}
Content-Type: application/json

{
  "name": "Stephen Curry",
  "team": "Golden State Warriors",
  "position": "PG"
}
```

#### Delete Player

```http
DELETE /api/players/{id}
```

---

### Teams

#### Get All Teams

```http
GET /api/teams
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Lakers",
    "city": "Los Angeles",
    "abbreviation": "LAL"
  }
]
```

#### Get Team by ID

```http
GET /api/teams/{id}
```

#### Search Teams

```http
GET /api/teams/search?name=Lakers
GET /api/teams/search?abbr=LAL
```

#### Create Team

```http
POST /api/teams
Content-Type: application/json

{
  "name": "Warriors",
  "city": "Golden State",
  "abbreviation": "GSW"
}
```

#### Update Team

```http
PUT /api/teams/{id}
Content-Type: application/json

{
  "name": "Warriors",
  "city": "Golden State",
  "abbreviation": "GSW"
}
```

#### Delete Team

```http
DELETE /api/teams/{id}
```

---

### Games

#### Get All Games

```http
GET /api/games
```

**Response:**

```json
[
  {
    "id": 1,
    "date": "2024-01-15",
    "homeTeamAbbr": "LAL",
    "awayTeamAbbr": "GSW",
    "homeScore": 110,
    "awayScore": 108
  }
]
```

#### Get Game by ID

```http
GET /api/games/{id}
```

#### Search Games

```http
GET /api/games/search?date=2024-01-15
GET /api/games/search?team=LAL
```

#### Create Game

```http
POST /api/games
Content-Type: application/json

{
  "date": "2024-01-15",
  "homeTeamAbbr": "LAL",
  "awayTeamAbbr": "GSW",
  "homeScore": 110,
  "awayScore": 108
}
```

#### Update Game

```http
PUT /api/games/{id}
Content-Type: application/json

{
  "date": "2024-01-15",
  "homeTeamAbbr": "LAL",
  "awayTeamAbbr": "GSW",
  "homeScore": 110,
  "awayScore": 108
}
```

#### Delete Game

```http
DELETE /api/games/{id}
```

---

## Testing with curl

### Get all players

```bash
curl http://localhost:8080/api/players
```

### Create a new player

```bash
curl -X POST http://localhost:8080/api/players \
  -H "Content-Type: application/json" \
  -d '{"name":"Michael Jordan","team":"Chicago Bulls","position":"SG"}'
```

### Search for players

```bash
curl "http://localhost:8080/api/players/search?name=LeBron"
```

---

## Testing with PowerShell

### Get all players

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/players"
```

### Create a new player

```powershell
$body = @{
    name = "Michael Jordan"
    team = "Chicago Bulls"
    position = "SG"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/players" -Method Post -Body $body -ContentType "application/json"
```

### Search for players

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/players/search?name=LeBron"
```

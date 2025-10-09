# NBA Analytics Backend

A comprehensive Spring Boot REST API for NBA player and team statistics with advanced analytics.

## Features

- **Player Management**: CRUD operations for NBA players with 40+ statistical categories
- **Team Management**: Team statistics and standings
- **Advanced Analytics**: Shot creation, clutch performance, defensive metrics, and more
- **Search & Filter**: Search players by name/team, filter by position/team
- **Leaderboards**: Top performers in any statistical category
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: H2 in-memory database (easily configurable for PostgreSQL)

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Running the Application

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Run the application**
```bash
mvn spring-boot:run
```

3. **Access the API**
- API Base URL: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console: `http://localhost:8080/h2-console`

## API Endpoints

### Players API (`/api/players`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all players |
| GET | `/{id}` | Get player by ID |
| POST | `/` | Create new player |
| PUT | `/{id}` | Update player |
| DELETE | `/{id}` | Delete player |
| GET | `/search?q={term}` | Search players by name/team |
| GET | `/team/{team}` | Get players by team |
| GET | `/position/{position}` | Get players by position |
| GET | `/filter?team={team}&position={position}` | Filter players |
| GET | `/leaderboard/{category}?limit={n}` | Get leaderboard |
| GET | `/top/{stat}?limit={n}` | Get top players by stat |
| GET | `/qualified?minGames={n}` | Get qualified players |
| GET | `/teams` | Get all unique teams |
| GET | `/positions` | Get all unique positions |

### Teams API (`/api/teams`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all teams |
| GET | `/{id}` | Get team by ID |
| GET | `/name/{name}` | Get team by name |
| POST | `/` | Create new team |
| PUT | `/{id}` | Update team |
| DELETE | `/{id}` | Delete team |
| GET | `/standings` | Get team standings |
| GET | `/net-rating` | Get teams by net rating |
| GET | `/top-offense?limit={n}` | Get top offensive teams |
| GET | `/top-defense?limit={n}` | Get top defensive teams |
| GET | `/playoff-teams` | Get playoff teams |

## Statistical Categories

### Basic Stats
- Points, Rebounds, Assists, Steals, Blocks
- Field Goal %, 3-Point %, Free Throw %
- Minutes, Games Played, Usage Rate

### Advanced Metrics
- Player Efficiency Rating (PER)
- True Shooting %, Effective FG%
- Box Plus/Minus, Win Shares, VORP

### Shot Creation & Spacing
- Contested vs Uncontested Shot %
- Catch & Shoot vs Pull-up %
- Shots Created for Others
- Gravity Score
- Off-Ball Screen Assists
- Hockey Assists

### Clutch & Situational
- 4th Quarter Performance
- Clutch Time Stats
- Game-Winning Shots
- Performance vs Top 10 Defenses
- Back-to-Back Game Performance

### Defensive Metrics
- Opponent FG% When Guarded
- Deflections Per Game
- Charges Drawn
- Loose Balls Recovered
- Defensive Win Shares
- Rim Protection %

### Hustle Stats
- Contested Shots Per Game
- Screen Assists
- Miles Traveled Per Game
- Diving for Loose Balls
- Transition Defense Stops

## Example API Calls

### Get Top Scorers
```bash
curl "http://localhost:8080/api/players/leaderboard/points?limit=10"
```

### Search Players
```bash
curl "http://localhost:8080/api/players/search?q=LeBron"
```

### Get Lakers Players
```bash
curl "http://localhost:8080/api/players/team/Los%20Angeles%20Lakers"
```

### Get Top Clutch Performers
```bash
curl "http://localhost:8080/api/players/leaderboard/clutchTimeStats?limit=5"
```

### Filter Point Guards
```bash
curl "http://localhost:8080/api/players/filter?position=PG"
```

## Database Configuration

### H2 (Default - In Memory)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:nba_analytics
    driver-class-name: org.h2.Driver
    username: sa
    password: password
```

### PostgreSQL (Production)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nba_analytics
    driver-class-name: org.postgresql.Driver
    username: your_username
    password: your_password
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

## Data Model

### Player Entity
- **Basic Info**: ID, Name, Team, Position
- **Traditional Stats**: Points, Rebounds, Assists, etc.
- **Shooting**: FG%, 3P%, FT%, TS%, eFG%
- **Advanced**: PER, BPM, WS, VORP
- **Shot Creation**: Contested shots, gravity score, etc.
- **Defense**: Opponent FG%, deflections, charges
- **Hustle**: Miles traveled, loose balls, etc.

### Team Entity
- **Basic Info**: ID, Name, Record, Wins, Losses
- **Offense**: PPG, APG, FG%, 3P%, Offensive Rating
- **Defense**: Points Against, Defensive Rating
- **Advanced**: Net Rating, Pace, eFG%, Turnover Rate

## Development

### Build
```bash
mvn clean compile
```

### Test
```bash
mvn test
```

### Package
```bash
mvn clean package
```

### Run with Profile
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Configuration

### CORS
The API is configured to accept requests from:
- `http://localhost:4200` (Angular)
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)

### Logging
- Application logs: `DEBUG` level
- SQL queries: Enabled in development
- Hibernate SQL formatting: Enabled

## API Documentation

Visit `http://localhost:8080/swagger-ui.html` for interactive API documentation with:
- Complete endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
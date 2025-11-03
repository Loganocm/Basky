# Basky - NBA Statistics Platform

A full-stack NBA statistics platform featuring real-time player stats, team analytics, and game data visualization.

## 🏀 Features

- **Player Statistics**: Comprehensive player stats including per-game averages, shooting percentages, and advanced metrics (PER, TS%, eFG%)
- **Team Analytics**: Team roster management with recent game history and performance tracking
- **Game Details**: Detailed box scores for every game with player-by-player breakdowns
- **Category Leaderboards**: Top performers across multiple statistical categories (General, Offense, Defense)
- **Recent Games**: Last 3 games for players and last 5 games for teams
- **Search & Filter**: Easy navigation through players, teams, and statistics
- **Responsive Design**: Modern UI with dark theme optimized for all devices

## 🛠️ Tech Stack

### Frontend

- **Framework**: Angular 18+ (Standalone Components)
- **Styling**: Custom CSS with modern gradients and animations
- **HTTP Client**: RxJS-based async data management
- **Deployment**: Nginx (Docker)

### Backend

- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: PostgreSQL 16
- **ORM**: Spring Data JPA/Hibernate
- **API**: RESTful endpoints with CORS support
- **Health Checks**: Spring Boot Actuator

### Data Pipeline

- **Scraper**: Python 3.x with nba_api
- **Database**: PostgreSQL with psycopg2
- **Data Source**: NBA official statistics

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Cloud Platform**: Microsoft Azure
  - Azure Container Apps
  - Azure Container Registry
  - Azure Database for PostgreSQL

## 📋 Prerequisites

### Local Development

- Node.js 18+ and npm
- Java 21 (JDK)
- PostgreSQL 16
- Python 3.8+ (for data scraping)
- Maven 3.9+

### Docker Development

- Docker Desktop
- Docker Compose

### Azure Deployment

- Azure CLI
- Docker
- Active Azure subscription

## 🚀 Quick Start

### Option 1: Local Development (Traditional)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Basky
   ```

2. **Setup Database**

   ```powershell
   # Run the setup script
   .\setup-database.ps1
   ```

3. **Start Backend**

   ```bash
   cd baskyapp
   ./mvnw spring-boot:run
   ```

4. **Start Frontend**

   ```bash
   npm install
   npm start
   ```

5. **Load Data** (Optional)

   ```bash
   cd utilities
   pip install -r requirements.txt
   python nba_scrape_to_postgres.py
   ```

6. **Access Application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080

### Option 2: Docker Compose (Recommended)

1. **Clone and Configure**

   ```bash
   git clone <repository-url>
   cd Basky
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start All Services**

   ```bash
   docker-compose up --build
   ```

3. **Access Application**

   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5432

4. **Stop Services**
   ```bash
   docker-compose down
   ```

## 📦 Project Structure

```
Basky/
├── baskyapp/              # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/nba/baskyapp/
│   │   │   │       ├── boxscore/    # Box score entities & controllers
│   │   │   │       ├── config/      # CORS & app configuration
│   │   │   │       ├── game/        # Game entities & controllers
│   │   │   │       ├── player/      # Player entities & controllers
│   │   │   │       └── team/        # Team entities & controllers
│   │   │   └── resources/
│   │   │       ├── application.properties       # Default config
│   │   │       └── application-prod.properties  # Production config
│   │   └── test/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── pom.xml
│
├── src/                   # Angular frontend
│   ├── components/
│   │   ├── category-leaderboards.component.ts
│   │   ├── game-page.component.ts
│   │   ├── player-page.component.ts
│   │   ├── recent-games.component.ts
│   │   ├── stat-detail.component.ts
│   │   ├── team-page.component.ts
│   │   └── ...
│   ├── services/
│   │   └── basketball-data.service.ts
│   ├── interfaces/
│   ├── assets/
│   ├── global_styles.css
│   ├── index.html
│   └── main.ts
│
├── utilities/             # Python data scrapers
│   ├── nba_scrape_to_postgres.py
│   ├── requirements.txt
│   └── ...
│
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile.frontend    # Frontend Docker image
├── nginx.conf            # Nginx configuration for frontend
├── azure-deploy.sh       # Azure deployment script (Bash)
├── azure-deploy.ps1      # Azure deployment script (PowerShell)
├── .env.example          # Environment variables template
├── DEPLOYMENT.md         # Detailed deployment guide
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
POSTGRES_DB=nba_stats_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Application
SHOW_SQL=false

# Azure (for deployment)
AZURE_RESOURCE_GROUP=basky-rg
AZURE_LOCATION=eastus
AZURE_CONTAINER_REGISTRY=baskyacr
```

### Backend Configuration

Edit `baskyapp/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/nba_stats_db
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### Frontend API Configuration

The frontend connects to the backend via the basketball data service. No configuration needed for local development (uses relative URLs).

## 📊 Database Schema

### Tables

- **players**: Player information and season statistics
- **teams**: NBA teams data
- **games**: Game results and metadata
- **box_scores**: Player performance in each game

### Key Relationships

- Player → Team (Many-to-One)
- BoxScore → Player (Many-to-One)
- BoxScore → Team (Many-to-One)
- BoxScore → Game (Many-to-One)

## 🐳 Docker

### Build Images

```bash
# Backend
docker build -t basky-backend ./baskyapp

# Frontend
docker build -f Dockerfile.frontend -t basky-frontend .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up volumes
docker-compose down -v
```

## ☁️ Azure Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deploy

```powershell
# Using PowerShell
.\azure-deploy.ps1 -DBAdminPassword "YourSecurePassword123!"
```

```bash
# Using Bash
./azure-deploy.sh
```

## 📈 Data Management

### Populate Database

```bash
cd utilities
pip install -r requirements.txt
python nba_scrape_to_postgres.py
```

The scraper fetches:

- All NBA teams
- All active players
- Season games
- Box scores for each game

### Backup Database

```bash
pg_dump -h localhost -U postgres nba_stats_db > backup.sql
```

### Restore Database

```bash
psql -h localhost -U postgres nba_stats_db < backup.sql
```

## 🧪 Testing

### Backend Tests

```bash
cd baskyapp
./mvnw test
```

### Test Backend API

```bash
# Get all players
curl http://localhost:8080/api/players

# Get player by ID
curl http://localhost:8080/api/players/1

# Get all teams
curl http://localhost:8080/api/teams

# Get box scores for a game
curl http://localhost:8080/api/boxscores/game/1

# Health check
curl http://localhost:8080/actuator/health
```

## 📝 API Endpoints

### Players

- `GET /api/players` - Get all players
- `GET /api/players/{id}` - Get player by ID

### Teams

- `GET /api/teams` - Get all teams
- `GET /api/teams/{id}` - Get team by ID

### Games

- `GET /api/games` - Get all games
- `GET /api/games/{id}` - Get game by ID
- `GET /api/games/team/{teamId}` - Get games by team

### Box Scores

- `GET /api/boxscores` - Get all box scores
- `GET /api/boxscores/game/{gameId}` - Get box scores for a game
- `GET /api/boxscores/player/{playerId}` - Get box scores for a player

### Health & Monitoring

- `GET /actuator/health` - Application health status
- `GET /actuator/info` - Application information
- `GET /actuator/metrics` - Application metrics

## 🎨 UI Features

- **Gold/Silver/Bronze Rankings**: Top 3 players in each category have special styling
- **Dark Theme**: Modern dark UI optimized for viewing statistics
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Gradient effects and transitions
- **Category Tabs**: Switch between General, Offense, and Defense stats

## 🐛 Troubleshooting

### Backend won't start

- Check PostgreSQL is running
- Verify database connection settings
- Ensure port 8080 is available

### Frontend can't connect to backend

- Verify backend is running on port 8080
- Check CORS configuration
- Ensure API endpoints are accessible

### Docker issues

- Run `docker-compose down -v` to clean up
- Check Docker Desktop is running
- Verify port availability (80, 8080, 5432)

### Data scraping issues

- Check NBA API availability
- Verify database connection
- Review scraper logs for errors

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Name/Team]

## 🙏 Acknowledgments

- NBA API for providing the data
- Spring Boot and Angular communities
- All contributors and testers

---

**Built with ❤️ for NBA stats enthusiasts**

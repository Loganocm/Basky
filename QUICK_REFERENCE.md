# Basky - Quick Reference Guide

This guide provides quick commands and references for common development tasks.

## 🚀 Quick Start Commands

### Start Everything (Docker - Recommended)

```powershell
# First time setup
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Start Traditional (Without Docker)

```powershell
# Terminal 1 - Start Database (if not already running)
# Database should be set up via setup-database.ps1

# Terminal 2 - Start Backend
cd baskyapp
./mvnw spring-boot:run

# Terminal 3 - Start Frontend
npm start

# Terminal 4 - Load Data (optional)
cd utilities
pip install -r requirements.txt
python nba_scrape_to_postgres.py
```

---

## 🐳 Docker Commands

### Basic Operations

```powershell
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### Viewing Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Container Management

```powershell
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d nba_stats_db

# View resource usage
docker stats
```

### Building Images

```powershell
# Build backend only
docker build -t basky-backend ./baskyapp

# Build frontend only
docker build -f Dockerfile.frontend -t basky-frontend .

# Build with no cache
docker-compose build --no-cache
```

---

## ⚙️ Backend (Spring Boot)

### Running Locally

```powershell
cd baskyapp

# Run application
./mvnw spring-boot:run

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod

# Clean and run
./mvnw clean spring-boot:run

# Package JAR
./mvnw clean package

# Skip tests
./mvnw clean package -DskipTests
```

### Testing

```powershell
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=PlayerControllerTest

# Run with coverage
./mvnw clean test jacoco:report
```

### Debugging

```powershell
# Run with debug enabled (port 5005)
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

---

## 🎨 Frontend (Angular)

### Development

```powershell
# Install dependencies
npm install

# Start dev server
npm start
# Access at http://localhost:4200

# Start with specific port
ng serve --port 4300

# Start with live reload
npm run watch
```

### Building

```powershell
# Development build
npm run build

# Production build
npm run build:prod

# Build output in dist/
```

### Linting (when configured)

```powershell
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

---

## 🗄️ Database (PostgreSQL)

### Local Database Setup

```powershell
# Initial setup
.\setup-database.ps1

# Connect to database
psql -U postgres -d nba_stats_db

# Via Docker
docker-compose exec postgres psql -U postgres -d nba_stats_db
```

### Common SQL Commands

```sql
-- List all tables
\dt

-- Describe table
\d players
\d teams
\d games
\d box_scores

-- Count records
SELECT COUNT(*) FROM players;
SELECT COUNT(*) FROM teams;
SELECT COUNT(*) FROM games;
SELECT COUNT(*) FROM box_scores;

-- View recent games
SELECT * FROM games ORDER BY game_date DESC LIMIT 10;

-- View top scorers
SELECT p.player_name, p.ppg
FROM players p
ORDER BY p.ppg DESC
LIMIT 10;

-- Exit psql
\q
```

### Backup & Restore

```powershell
# Backup database
pg_dump -U postgres -d nba_stats_db > backup.sql

# Restore database
psql -U postgres -d nba_stats_db < backup.sql

# Backup with Docker
docker-compose exec postgres pg_dump -U postgres nba_stats_db > backup.sql

# Restore with Docker
cat backup.sql | docker-compose exec -T postgres psql -U postgres nba_stats_db
```

---

## 🐍 Python Data Scraper

### Setup

```powershell
cd utilities

# Install dependencies
pip install -r requirements.txt

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac

pip install -r requirements.txt
```

### Running Scraper

```powershell
# Full scrape (takes time!)
python nba_scrape_to_postgres.py

# Resume from specific game
# Edit START_FROM_GAME in the script
python nba_scrape_to_postgres.py
```

### Testing

```powershell
# Test NBA API
python test_nba_scraper.py

# Test database integration
python test_integration.py

# Check data
python verify_data.py
```

---

## ☁️ Azure Deployment

### Initial Deployment

```powershell
# Login to Azure
az login

# Set subscription (if multiple)
az account set --subscription "Your-Subscription-Name"

# Deploy (Windows)
.\azure-deploy.ps1 -DBAdminPassword "YourSecurePassword123!"

# Deploy (Linux/Mac)
./azure-deploy.sh
```

### Monitoring

```powershell
# View backend logs
az containerapp logs show --name basky-backend --resource-group basky-rg --follow

# View frontend logs
az containerapp logs show --name basky-frontend --resource-group basky-rg --follow

# Check health
$BACKEND_URL = az containerapp show --name basky-backend --resource-group basky-rg --query properties.configuration.ingress.fqdn -o tsv
curl "https://$BACKEND_URL/actuator/health"
```

### Management

```powershell
# List container apps
az containerapp list --resource-group basky-rg -o table

# Restart container app
az containerapp restart --name basky-backend --resource-group basky-rg

# Scale container app
az containerapp scale --name basky-backend --resource-group basky-rg --min-replicas 1 --max-replicas 3

# Update environment variables
az containerapp update --name basky-backend --resource-group basky-rg --set-env-vars KEY=VALUE

# View revisions
az containerapp revision list --name basky-backend --resource-group basky-rg -o table
```

### Cleanup

```powershell
# Delete resource group (DELETES EVERYTHING)
az group delete --name basky-rg --yes --no-wait
```

---

## 🧪 API Testing

### Using curl

```powershell
# Get all players
curl http://localhost:8080/api/players

# Get player by ID
curl http://localhost:8080/api/players/1

# Get all teams
curl http://localhost:8080/api/teams

# Get team by ID
curl http://localhost:8080/api/teams/1

# Get all games
curl http://localhost:8080/api/games

# Get box scores for a game
curl http://localhost:8080/api/boxscores/game/1

# Get box scores for a player
curl http://localhost:8080/api/boxscores/player/1

# Health check
curl http://localhost:8080/actuator/health
```

### Using PowerShell

```powershell
# Get players
Invoke-RestMethod -Uri http://localhost:8080/api/players | ConvertTo-Json

# Get specific player
Invoke-RestMethod -Uri http://localhost:8080/api/players/1

# Health check
Invoke-RestMethod -Uri http://localhost:8080/actuator/health
```

---

## 🔧 Troubleshooting

### Backend Won't Start

```powershell
# Check database is running
docker-compose ps postgres
# or
pg_isready -h localhost -p 5432

# Check port 8080 is available
netstat -ano | findstr :8080

# Clean and rebuild
cd baskyapp
./mvnw clean
./mvnw clean install
./mvnw spring-boot:run
```

### Frontend Won't Start

```powershell
# Clear node_modules and reinstall
rm -r node_modules
npm install

# Check port 4200 is available
netstat -ano | findstr :4200

# Clear Angular cache
rm -r .angular
npm start
```

### Docker Issues

```powershell
# Clean everything
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

```powershell
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Try connecting manually
docker-compose exec postgres psql -U postgres -d nba_stats_db

# Reset database
docker-compose down -v
docker-compose up postgres
.\setup-database.ps1
```

---

## 📝 Git Workflow

### Initial Setup

```powershell
# Clone repository
git clone <repository-url>
cd Basky

# Create feature branch
git checkout -b feature/your-feature-name
```

### Daily Workflow

```powershell
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "feat(frontend): add player comparison feature"

# Push to remote
git push origin feature/your-feature-name

# Update branch from main
git checkout main
git pull origin main
git checkout feature/your-feature-name
git rebase main
```

### Common Operations

```powershell
# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename

# Delete local branch
git branch -d feature/old-feature

# Pull latest changes
git pull origin main
```

---

## 📊 Useful Queries

### Database Statistics

```sql
-- Player count by team
SELECT t.team_name, COUNT(p.player_id) as player_count
FROM teams t
LEFT JOIN players p ON t.team_id = p.team_id
GROUP BY t.team_name
ORDER BY player_count DESC;

-- Games count by team
SELECT t.team_name, COUNT(DISTINCT g.game_id) as game_count
FROM teams t
LEFT JOIN games g ON t.team_id = g.home_team_id OR t.team_id = g.away_team_id
GROUP BY t.team_name
ORDER BY game_count DESC;

-- Average points per game
SELECT AVG(ppg) as avg_ppg FROM players WHERE ppg > 0;

-- Top 10 scorers
SELECT player_name, ppg
FROM players
WHERE ppg > 0
ORDER BY ppg DESC
LIMIT 10;
```

---

## 🔗 Important URLs

### Local Development

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health
- Postgres: localhost:5432

### Docker Development

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/actuator/health
- Postgres: localhost:5432

### Azure Production

- URLs provided by deployment script
- Format: `https://<app-name>.<unique-id>.<region>.azurecontainerapps.io`

---

## 📚 Documentation Files

- `README.md` - Project overview
- `DEPLOYMENT.md` - Detailed deployment guide
- `PROJECT_STATUS.md` - Current status and roadmap
- `CONTRIBUTING.md` - Contribution guidelines
- `QUICK_REFERENCE.md` - This file
- `DATABASE_QUICK_START.md` - Database setup
- `utilities/DATA_PIPELINE_GUIDE.md` - Data scraping
- `utilities/ADVANCED_STATS_GUIDE.md` - Statistics explanation

---

## ⌨️ Keyboard Shortcuts

### VS Code

- `Ctrl + ~` - Toggle terminal
- `Ctrl + Shift + P` - Command palette
- `F5` - Start debugging
- `Ctrl + F5` - Run without debugging

### IntelliJ IDEA

- `Alt + F12` - Terminal
- `Shift + Shift` - Search everywhere
- `Shift + F10` - Run
- `Shift + F9` - Debug

---

**Quick tip:** Bookmark this file for easy reference during development! 📖

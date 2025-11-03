# Basky - Deployment Guide

## Table of Contents

1. [Local Development with Docker](#local-development-with-docker)
2. [Azure Deployment](#azure-deployment)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Local Development with Docker

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Basky
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**

   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - PostgreSQL: localhost:5432

5. **Stop the application**

   ```bash
   docker-compose down
   ```

6. **Clean up (remove volumes)**
   ```bash
   docker-compose down -v
   ```

---

## Azure Deployment

### Prerequisites

- Azure CLI installed (`az`)
- Docker installed
- Active Azure subscription

### Deployment Steps

#### Option 1: Automated Deployment (Recommended)

**For PowerShell (Windows):**

```powershell
.\azure-deploy.ps1 `
    -ResourceGroup "basky-rg" `
    -Location "eastus" `
    -ACRName "baskyacr" `
    -DBAdminUser "baskyuser" `
    -DBAdminPassword "YourSecurePassword123!"
```

**For Bash (Linux/Mac):**

```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

#### Option 2: Manual Deployment

1. **Login to Azure**

   ```bash
   az login
   ```

2. **Create Resource Group**

   ```bash
   az group create --name basky-rg --location eastus
   ```

3. **Create Container Registry**

   ```bash
   az acr create \
       --resource-group basky-rg \
       --name baskyacr \
       --sku Basic \
       --admin-enabled true
   ```

4. **Build and Push Images**

   ```bash
   # Login to ACR
   az acr login --name baskyacr

   # Build and push backend
   docker build -t baskyacr.azurecr.io/basky-backend:latest ./baskyapp
   docker push baskyacr.azurecr.io/basky-backend:latest

   # Build and push frontend
   docker build -f Dockerfile.frontend -t baskyacr.azurecr.io/basky-frontend:latest .
   docker push baskyacr.azurecr.io/basky-frontend:latest
   ```

5. **Create PostgreSQL Database**

   ```bash
   az postgres flexible-server create \
       --resource-group basky-rg \
       --name basky-postgres \
       --location eastus \
       --admin-user baskyuser \
       --admin-password <your-password> \
       --sku-name Standard_B1ms \
       --tier Burstable \
       --version 16

   az postgres flexible-server db create \
       --resource-group basky-rg \
       --server-name basky-postgres \
       --database-name nba_stats_db
   ```

6. **Create Container Apps Environment**

   ```bash
   az containerapp env create \
       --name basky-env \
       --resource-group basky-rg \
       --location eastus
   ```

7. **Deploy Backend**

   ```bash
   az containerapp create \
       --name basky-backend \
       --resource-group basky-rg \
       --environment basky-env \
       --image baskyacr.azurecr.io/basky-backend:latest \
       --target-port 8080 \
       --ingress external \
       --env-vars \
           SPRING_DATASOURCE_URL="jdbc:postgresql://basky-postgres.postgres.database.azure.com:5432/nba_stats_db?sslmode=require" \
           SPRING_DATASOURCE_USERNAME=baskyuser \
           SPRING_DATASOURCE_PASSWORD=<your-password> \
           SPRING_PROFILES_ACTIVE=prod
   ```

8. **Deploy Frontend**
   ```bash
   az containerapp create \
       --name basky-frontend \
       --resource-group basky-rg \
       --environment basky-env \
       --image baskyacr.azurecr.io/basky-frontend:latest \
       --target-port 80 \
       --ingress external
   ```

---

## Environment Configuration

### Required Environment Variables

#### Backend (Spring Boot)

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/dbname
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
SPRING_PROFILES_ACTIVE=prod
```

#### Database

```env
POSTGRES_DB=nba_stats_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
```

### Configuration Profiles

- **Development**: `application.properties` (default)
- **Production**: `application-prod.properties` (Azure)

---

## Database Migration

### Initial Data Load

1. **Run the Python scrapers** (after deployment):

   ```bash
   # Install Python dependencies
   pip install -r utilities/requirements.txt

   # Update database connection in scraper
   # Edit utilities/nba_scrape_to_postgres.py with Azure DB connection

   # Run the scraper
   python utilities/nba_scrape_to_postgres.py
   ```

2. **Verify data**:

   ```bash
   # Connect to Azure PostgreSQL
   psql "host=basky-postgres.postgres.database.azure.com port=5432 dbname=nba_stats_db user=baskyuser sslmode=require"

   # Check tables
   \dt
   SELECT COUNT(*) FROM players;
   SELECT COUNT(*) FROM teams;
   SELECT COUNT(*) FROM games;
   SELECT COUNT(*) FROM box_scores;
   ```

### Backup and Restore

**Backup:**

```bash
pg_dump -h basky-postgres.postgres.database.azure.com \
    -U baskyuser \
    -d nba_stats_db \
    -f backup.sql
```

**Restore:**

```bash
psql -h basky-postgres.postgres.database.azure.com \
    -U baskyuser \
    -d nba_stats_db \
    -f backup.sql
```

---

## Monitoring and Maintenance

### Health Checks

- **Frontend Health**: `https://<frontend-url>/health`
- **Backend Health**: `https://<backend-url>/actuator/health`

### View Logs

```bash
# Backend logs
az containerapp logs show \
    --name basky-backend \
    --resource-group basky-rg \
    --follow

# Frontend logs
az containerapp logs show \
    --name basky-frontend \
    --resource-group basky-rg \
    --follow
```

### Scaling

```bash
# Scale backend
az containerapp update \
    --name basky-backend \
    --resource-group basky-rg \
    --min-replicas 2 \
    --max-replicas 5

# Scale frontend
az containerapp update \
    --name basky-frontend \
    --resource-group basky-rg \
    --min-replicas 2 \
    --max-replicas 5
```

### Update Deployment

```bash
# Rebuild and push new images
docker build -t baskyacr.azurecr.io/basky-backend:latest ./baskyapp
docker push baskyacr.azurecr.io/basky-backend:latest

# Update container app
az containerapp update \
    --name basky-backend \
    --resource-group basky-rg \
    --image baskyacr.azurecr.io/basky-backend:latest
```

---

## Cost Optimization

### Recommended Azure Resources

| Resource                   | SKU               | Estimated Monthly Cost |
| -------------------------- | ----------------- | ---------------------- |
| Container Apps (Backend)   | 1 vCPU, 2GB RAM   | ~$30                   |
| Container Apps (Frontend)  | 0.5 vCPU, 1GB RAM | ~$15                   |
| PostgreSQL Flexible Server | B1ms (Burstable)  | ~$15                   |
| Container Registry         | Basic             | ~$5                    |
| **Total**                  |                   | **~$65/month**         |

### Cost-Saving Tips

1. Use burstable database tier for development
2. Set min replicas to 0 for non-production environments
3. Enable auto-scaling based on traffic
4. Use Azure Reserved Instances for production
5. Implement CDN for static assets

---

## Troubleshooting

### Common Issues

1. **Container fails to start**

   - Check logs: `az containerapp logs show`
   - Verify environment variables
   - Check database connectivity

2. **Database connection errors**

   - Verify firewall rules
   - Check connection string format
   - Ensure SSL mode is enabled

3. **Frontend can't connect to backend**
   - Update API base URL in frontend configuration
   - Check CORS settings in backend
   - Verify ingress configuration

---

## Security Considerations

1. **Never commit secrets** to version control
2. Use **Azure Key Vault** for production secrets
3. Enable **HTTPS** for all endpoints
4. Implement **authentication** (Azure AD, OAuth)
5. Regular **security updates** for dependencies
6. Enable **Azure Defender** for Container Apps
7. Use **private endpoints** for database
8. Implement **rate limiting** on APIs

---

## Support

For issues and questions:

- GitHub Issues: <repository-url>/issues
- Documentation: See README.md
- Azure Support: https://azure.microsoft.com/support/

---

## License

[Your License Here]

#!/bin/bash

# Azure Deployment Script for Basky
# This script deploys the application to Azure Container Apps

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-basky-rg}"
LOCATION="${AZURE_LOCATION:-eastus}"
ACR_NAME="${AZURE_CONTAINER_REGISTRY:-baskyacr}"
CONTAINER_APP_ENV="${RESOURCE_GROUP}-env"
DB_SERVER_NAME="${RESOURCE_GROUP}-postgres"
DB_NAME="${POSTGRES_DB:-nba_stats_db}"
DB_ADMIN_USER="${POSTGRES_USER:-baskyuser}"
DB_ADMIN_PASSWORD="${POSTGRES_PASSWORD}"

echo "🚀 Starting Azure deployment..."

# 1. Create Resource Group
echo "📦 Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# 2. Create Azure Container Registry
echo "🐳 Creating Azure Container Registry..."
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# 3. Build and Push Images
echo "🏗️  Building and pushing Docker images..."

# Login to ACR
az acr login --name $ACR_NAME

# Build and push backend
echo "Building backend..."
docker build -t $ACR_LOGIN_SERVER/basky-backend:latest ./baskyapp
docker push $ACR_LOGIN_SERVER/basky-backend:latest

# Build and push frontend
echo "Building frontend..."
docker build -f Dockerfile.frontend -t $ACR_LOGIN_SERVER/basky-frontend:latest .
docker push $ACR_LOGIN_SERVER/basky-frontend:latest

# 4. Create Azure Database for PostgreSQL
echo "🗄️  Creating PostgreSQL database..."
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER_NAME \
    --location $LOCATION \
    --admin-user $DB_ADMIN_USER \
    --admin-password $DB_ADMIN_PASSWORD \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 16 \
    --storage-size 32 \
    --public-access 0.0.0.0

# Create database
az postgres flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $DB_SERVER_NAME \
    --database-name $DB_NAME

# Get database connection string
DB_CONNECTION_STRING="jdbc:postgresql://${DB_SERVER_NAME}.postgres.database.azure.com:5432/${DB_NAME}?sslmode=require"

# 5. Create Container Apps Environment
echo "🌍 Creating Container Apps environment..."
az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# 6. Deploy Backend Container App
echo "🚀 Deploying backend..."
az containerapp create \
    --name basky-backend \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_LOGIN_SERVER/basky-backend:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 8080 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 1.0 \
    --memory 2.0Gi \
    --env-vars \
        SPRING_DATASOURCE_URL=$DB_CONNECTION_STRING \
        SPRING_DATASOURCE_USERNAME=$DB_ADMIN_USER \
        SPRING_DATASOURCE_PASSWORD=$DB_ADMIN_PASSWORD \
        SPRING_PROFILES_ACTIVE=prod

# Get backend URL
BACKEND_URL=$(az containerapp show \
    --name basky-backend \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn -o tsv)

echo "Backend URL: https://$BACKEND_URL"

# 7. Deploy Frontend Container App
echo "🎨 Deploying frontend..."
az containerapp create \
    --name basky-frontend \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_LOGIN_SERVER/basky-frontend:latest \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 80 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 3 \
    --cpu 0.5 \
    --memory 1.0Gi

# Get frontend URL
FRONTEND_URL=$(az containerapp show \
    --name basky-frontend \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn -o tsv)

echo ""
echo "✅ Deployment complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend: https://$FRONTEND_URL"
echo "Backend:  https://$BACKEND_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Note: Update frontend API base URL to point to: https://$BACKEND_URL"

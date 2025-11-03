# Azure Deployment Script for Basky (PowerShell)
# This script deploys the application to Azure Container Apps

param(
    [string]$ResourceGroup = "basky-rg",
    [string]$Location = "eastus",
    [string]$ACRName = "baskyacr",
    [string]$DBServerName = "basky-postgres",
    [string]$DBName = "nba_stats_db",
    [string]$DBAdminUser = "baskyuser",
    [string]$DBAdminPassword
)

$ErrorActionPreference = "Stop"

# Check if password is provided
if (-not $DBAdminPassword) {
    $DBAdminPassword = Read-Host -Prompt "Enter PostgreSQL admin password" -AsSecureString
    $DBAdminPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DBAdminPassword))
}

Write-Host "🚀 Starting Azure deployment..." -ForegroundColor Green

# Variables
$ContainerAppEnv = "$ResourceGroup-env"
$BackendImage = "$ACRName.azurecr.io/basky-backend:latest"
$FrontendImage = "$ACRName.azurecr.io/basky-frontend:latest"

# 1. Create Resource Group
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# 2. Create Azure Container Registry
Write-Host "🐳 Creating Azure Container Registry..." -ForegroundColor Yellow
az acr create `
    --resource-group $ResourceGroup `
    --name $ACRName `
    --sku Basic `
    --admin-enabled true

# Get ACR credentials
$ACRUsername = az acr credential show --name $ACRName --query username -o tsv
$ACRPassword = az acr credential show --name $ACRName --query passwords[0].value -o tsv
$ACRLoginServer = az acr show --name $ACRName --query loginServer -o tsv

# 3. Build and Push Images
Write-Host "🏗️  Building and pushing Docker images..." -ForegroundColor Yellow

# Login to ACR
az acr login --name $ACRName

# Build and push backend
Write-Host "Building backend..." -ForegroundColor Cyan
docker build -t $BackendImage .\baskyapp
docker push $BackendImage

# Build and push frontend  
Write-Host "Building frontend..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t $FrontendImage .
docker push $FrontendImage

# 4. Create Azure Database for PostgreSQL
Write-Host "🗄️  Creating PostgreSQL database..." -ForegroundColor Yellow
az postgres flexible-server create `
    --resource-group $ResourceGroup `
    --name $DBServerName `
    --location $Location `
    --admin-user $DBAdminUser `
    --admin-password $DBAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --version 16 `
    --storage-size 32 `
    --public-access 0.0.0.0

# Create database
az postgres flexible-server db create `
    --resource-group $ResourceGroup `
    --server-name $DBServerName `
    --database-name $DBName

# Get database connection string
$DBConnectionString = "jdbc:postgresql://${DBServerName}.postgres.database.azure.com:5432/${DBName}?sslmode=require"

# 5. Create Container Apps Environment
Write-Host "🌍 Creating Container Apps environment..." -ForegroundColor Yellow
az containerapp env create `
    --name $ContainerAppEnv `
    --resource-group $ResourceGroup `
    --location $Location

# 6. Deploy Backend Container App
Write-Host "🚀 Deploying backend..." -ForegroundColor Yellow
az containerapp create `
    --name basky-backend `
    --resource-group $ResourceGroup `
    --environment $ContainerAppEnv `
    --image $BackendImage `
    --registry-server $ACRLoginServer `
    --registry-username $ACRUsername `
    --registry-password $ACRPassword `
    --target-port 8080 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 3 `
    --cpu 1.0 `
    --memory 2.0Gi `
    --env-vars `
    "SPRING_DATASOURCE_URL=$DBConnectionString" `
    "SPRING_DATASOURCE_USERNAME=$DBAdminUser" `
    "SPRING_DATASOURCE_PASSWORD=$DBAdminPassword" `
    "SPRING_PROFILES_ACTIVE=prod"

# Get backend URL
$BackendURL = az containerapp show `
    --name basky-backend `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn -o tsv

Write-Host "Backend URL: https://$BackendURL" -ForegroundColor Cyan

# 7. Deploy Frontend Container App
Write-Host "🎨 Deploying frontend..." -ForegroundColor Yellow
az containerapp create `
    --name basky-frontend `
    --resource-group $ResourceGroup `
    --environment $ContainerAppEnv `
    --image $FrontendImage `
    --registry-server $ACRLoginServer `
    --registry-username $ACRUsername `
    --registry-password $ACRPassword `
    --target-port 80 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 3 `
    --cpu 0.5 `
    --memory 1.0Gi

# Get frontend URL
$FrontendURL = az containerapp show `
    --name basky-frontend `
    --resource-group $ResourceGroup `
    --query properties.configuration.ingress.fqdn -o tsv

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Frontend: https://$FrontendURL" -ForegroundColor Cyan
Write-Host "Backend:  https://$BackendURL" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Note: Update frontend API base URL to point to: https://$BackendURL" -ForegroundColor Yellow

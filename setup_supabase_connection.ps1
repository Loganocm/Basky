# Supabase Connection Setup Script for Windows PowerShell
# Run this script to configure your environment for Supabase database connection

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host "  SUPABASE DATABASE CONNECTION SETUP" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host ""

# Default values
$DB_HOST = "aws-1-us-east-1.pooler.supabase.com"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres.hbsdjlaogfdcjlghjuct"
$DB_SSLMODE = "require"

Write-Host "Current Configuration:" -ForegroundColor Yellow
Write-Host "  Host:     $DB_HOST" -ForegroundColor Gray
Write-Host "  Port:     $DB_PORT" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  User:     $DB_USER" -ForegroundColor Gray
Write-Host "  SSL Mode: $DB_SSLMODE" -ForegroundColor Gray
Write-Host ""

# Prompt for password
Write-Host "Enter your Supabase database password:" -ForegroundColor Yellow
$DB_PASSWORD = Read-Host -AsSecureString
$DB_PASSWORD_Plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

if ([string]::IsNullOrWhiteSpace($DB_PASSWORD_Plain)) {
    Write-Host ""
    Write-Host "ERROR: Password cannot be empty!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Yellow

# Set environment variables for current session
$env:DB_NAME = $DB_NAME
$env:DB_USER = $DB_USER
$env:DB_PASSWORD = $DB_PASSWORD_Plain
$env:DB_HOST = $DB_HOST
$env:DB_PORT = $DB_PORT
$env:DB_SSLMODE = $DB_SSLMODE

Write-Host "  ✓ DB_NAME" -ForegroundColor Green
Write-Host "  ✓ DB_USER" -ForegroundColor Green
Write-Host "  ✓ DB_PASSWORD" -ForegroundColor Green
Write-Host "  ✓ DB_HOST" -ForegroundColor Green
Write-Host "  ✓ DB_PORT" -ForegroundColor Green
Write-Host "  ✓ DB_SSLMODE" -ForegroundColor Green
Write-Host ""

# Also set for Java Spring Boot
$JDBC_URL = "jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"
$env:SPRING_DATASOURCE_URL = $JDBC_URL
$env:SPRING_DATASOURCE_USERNAME = $DB_USER
$env:SPRING_DATASOURCE_PASSWORD = $DB_PASSWORD_Plain

Write-Host "  ✓ SPRING_DATASOURCE_URL" -ForegroundColor Green
Write-Host "  ✓ SPRING_DATASOURCE_USERNAME" -ForegroundColor Green
Write-Host "  ✓ SPRING_DATASOURCE_PASSWORD" -ForegroundColor Green
Write-Host ""

# Create .env file in utilities directory
$envFilePath = Join-Path $PSScriptRoot "utilities\.env"
Write-Host "Creating .env file at: $envFilePath" -ForegroundColor Yellow

$envContent = @"
# Supabase Database Configuration
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD_Plain
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_SSLMODE=$DB_SSLMODE

# Flask API Configuration
PORT=5000
"@

$envContent | Out-File -FilePath $envFilePath -Encoding UTF8
Write-Host "  ✓ Created $envFilePath" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
Write-Host ""

$testScript = Join-Path $PSScriptRoot "utilities\test_supabase_connection.py"
if (Test-Path $testScript) {
    python $testScript
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=" -NoNewline -ForegroundColor Green
        Write-Host "=" * 69 -ForegroundColor Green
        Write-Host "  ✅ SETUP COMPLETE - Database connection is working!" -ForegroundColor Green
        Write-Host "=" -NoNewline -ForegroundColor Green
        Write-Host "=" * 69 -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run:" -ForegroundColor Cyan
        Write-Host "  • Python scraper:  python utilities\nba_scrape_to_postgres.py" -ForegroundColor Gray
        Write-Host "  • Flask API:       python utilities\flask_api.py" -ForegroundColor Gray
        Write-Host "  • Java backend:    cd baskyapp && mvnw spring-boot:run" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Note: Environment variables are set for this PowerShell session only." -ForegroundColor Yellow
        Write-Host "      Run this script again in new sessions, or add to your profile." -ForegroundColor Yellow
    }
    else {
        Write-Host ""
        Write-Host "=" -NoNewline -ForegroundColor Red
        Write-Host "=" * 69 -ForegroundColor Red
        Write-Host "  ❌ CONNECTION TEST FAILED" -ForegroundColor Red
        Write-Host "=" -NoNewline -ForegroundColor Red
        Write-Host "=" * 69 -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check:" -ForegroundColor Yellow
        Write-Host "  1. Your password is correct" -ForegroundColor Gray
        Write-Host "  2. Your Supabase project is active" -ForegroundColor Gray
        Write-Host "  3. You have network connectivity to Supabase" -ForegroundColor Gray
        Write-Host ""
        Write-Host "See SUPABASE_CONNECTION_GUIDE.md for troubleshooting." -ForegroundColor Yellow
    }
}
else {
    Write-Host "Warning: Test script not found at $testScript" -ForegroundColor Yellow
    Write-Host "Environment variables have been set." -ForegroundColor Green
}

Write-Host ""

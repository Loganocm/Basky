# =============================================================================
# COPY AND PASTE THESE COMMANDS INTO POWERSHELL
# =============================================================================
# These commands will set up your Supabase connection environment variables
# Replace [YOUR_PASSWORD] with your actual Supabase database password
# =============================================================================

# Set Database Connection Environment Variables
$env:DB_NAME = "postgres"
$env:DB_USER = "postgres.hbsdjlaogfdcjlghjuct"
$env:DB_PASSWORD = "[YOUR_PASSWORD]"
$env:DB_HOST = "aws-1-us-east-1.pooler.supabase.com"
$env:DB_PORT = "5432"
$env:DB_SSLMODE = "require"

# Set Java/Spring Boot Environment Variables
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME = "postgres.hbsdjlaogfdcjlghjuct"
$env:SPRING_DATASOURCE_PASSWORD = "[YOUR_PASSWORD]"

# Verify environment variables are set
Write-Host "`nEnvironment variables set:" -ForegroundColor Green
Write-Host "  DB_HOST: $env:DB_HOST" -ForegroundColor Cyan
Write-Host "  DB_PORT: $env:DB_PORT" -ForegroundColor Cyan
Write-Host "  DB_USER: $env:DB_USER" -ForegroundColor Cyan
Write-Host "  DB_PASSWORD: $(if($env:DB_PASSWORD){'***SET***'}else{'NOT SET'})" -ForegroundColor Cyan
Write-Host "`nTo test connection, run:" -ForegroundColor Yellow
Write-Host "  python utilities\test_supabase_connection.py" -ForegroundColor White

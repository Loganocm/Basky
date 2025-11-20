#!/bin/bash
# Supabase Connection Setup Script for Linux/Mac
# Run this script to configure your environment for Supabase database connection

echo "======================================================================"
echo "  SUPABASE DATABASE CONNECTION SETUP"
echo "======================================================================"
echo ""

# Default values
DB_HOST="aws-1-us-east-1.pooler.supabase.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.hbsdjlaogfdcjlghjuct"
DB_SSLMODE="require"

echo "Current Configuration:"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  SSL Mode: $DB_SSLMODE"
echo ""

# Prompt for password
echo "Enter your Supabase database password:"
read -s DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo ""
    echo "ERROR: Password cannot be empty!"
    echo ""
    exit 1
fi

echo ""
echo "Setting environment variables..."

# Set environment variables for current session
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASSWORD="$DB_PASSWORD"
export DB_HOST="$DB_HOST"
export DB_PORT="$DB_PORT"
export DB_SSLMODE="$DB_SSLMODE"

echo "  ✓ DB_NAME"
echo "  ✓ DB_USER"
echo "  ✓ DB_PASSWORD"
echo "  ✓ DB_HOST"
echo "  ✓ DB_PORT"
echo "  ✓ DB_SSLMODE"
echo ""

# Also set for Java Spring Boot
JDBC_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"
export SPRING_DATASOURCE_URL="$JDBC_URL"
export SPRING_DATASOURCE_USERNAME="$DB_USER"
export SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD"

echo "  ✓ SPRING_DATASOURCE_URL"
echo "  ✓ SPRING_DATASOURCE_USERNAME"
echo "  ✓ SPRING_DATASOURCE_PASSWORD"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Create .env file in utilities directory
ENV_FILE="$SCRIPT_DIR/utilities/.env"
echo "Creating .env file at: $ENV_FILE"

cat > "$ENV_FILE" << EOF
# Supabase Database Configuration
# Generated: $(date '+%Y-%m-%d %H:%M:%S')

DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_SSLMODE=$DB_SSLMODE

# Flask API Configuration
PORT=5000
EOF

echo "  ✓ Created $ENV_FILE"
echo ""

# Test connection
echo "Testing database connection..."
echo ""

TEST_SCRIPT="$SCRIPT_DIR/utilities/test_supabase_connection.py"
if [ -f "$TEST_SCRIPT" ]; then
    python3 "$TEST_SCRIPT"
    if [ $? -eq 0 ]; then
        echo ""
        echo "======================================================================"
        echo "  ✅ SETUP COMPLETE - Database connection is working!"
        echo "======================================================================"
        echo ""
        echo "You can now run:"
        echo "  • Python scraper:  python3 utilities/nba_scrape_to_postgres.py"
        echo "  • Flask API:       python3 utilities/flask_api.py"
        echo "  • Java backend:    cd baskyapp && ./mvnw spring-boot:run"
        echo ""
        echo "Note: Environment variables are set for this shell session only."
        echo "      Run this script again in new sessions, or add to your .bashrc"
    else
        echo ""
        echo "======================================================================"
        echo "  ❌ CONNECTION TEST FAILED"
        echo "======================================================================"
        echo ""
        echo "Please check:"
        echo "  1. Your password is correct"
        echo "  2. Your Supabase project is active"
        echo "  3. You have network connectivity to Supabase"
        echo ""
        echo "See SUPABASE_CONNECTION_GUIDE.md for troubleshooting."
    fi
else
    echo "Warning: Test script not found at $TEST_SCRIPT"
    echo "Environment variables have been set."
fi

echo ""

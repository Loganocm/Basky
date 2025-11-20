#!/bin/bash
# =============================================================================
# COPY AND PASTE THESE COMMANDS INTO LINUX/MAC TERMINAL
# =============================================================================
# These commands will set up your Supabase connection environment variables
# Replace [YOUR_PASSWORD] with your actual Supabase database password
# =============================================================================

# Set Database Connection Environment Variables
export DB_NAME="postgres"
export DB_USER="postgres.hbsdjlaogfdcjlghjuct"
export DB_PASSWORD="[YOUR_PASSWORD]"
export DB_HOST="aws-1-us-east-1.pooler.supabase.com"
export DB_PORT="5432"
export DB_SSLMODE="require"

# Set Java/Spring Boot Environment Variables
export SPRING_DATASOURCE_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
export SPRING_DATASOURCE_USERNAME="postgres.hbsdjlaogfdcjlghjuct"
export SPRING_DATASOURCE_PASSWORD="[YOUR_PASSWORD]"

# Verify environment variables are set
echo ""
echo "Environment variables set:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_PORT: $DB_PORT"
echo "  DB_USER: $DB_USER"
echo "  DB_PASSWORD: ***SET***"
echo ""
echo "To test connection, run:"
echo "  python3 utilities/test_supabase_connection.py"

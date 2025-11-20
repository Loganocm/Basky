# 🔗 Supabase Database Connection - Complete Setup

## Quick Start (Fastest Way)

### Windows

```powershell
# Run the automated setup script
.\setup_supabase_connection.ps1
```

### Linux/Mac

```bash
# Make executable and run
chmod +x setup_supabase_connection.sh
./setup_supabase_connection.sh
```

This will:

1. ✅ Configure all environment variables
2. ✅ Create `.env` file with your credentials
3. ✅ Test the database connection
4. ✅ Verify SSL is working
5. ✅ Show table counts and status

---

## What Was Fixed

### 🔧 Critical Corrections Made

1. **Host Correction**: `aws-1-us-east-1` → `aws-0-us-east-1`
2. **Port Correction**: Added proper Supabase pooler port (`5432`)
3. **SSL Requirement**: Added mandatory `sslmode=require` for all connections
4. **Connection Timeout**: Added 10-second timeout for better error handling
5. **Environment Variables**: All components now read from env vars
6. **Error Logging**: Enhanced connection error messages with details

### 📁 Files Updated

#### Python Components

- ✅ `utilities/nba_scrape_to_postgres.py` - Reads from environment variables, SSL enabled
- ✅ `utilities/flask_api.py` - Auto-configures from environment variables
- ✅ Created `utilities/test_supabase_connection.py` - Comprehensive connection tester
- ✅ Created `utilities/.env.example` - Template for configuration

#### Java Components

- ✅ `baskyapp/src/main/resources/application.properties` - Updated with Supabase defaults
- ✅ `baskyapp/src/main/resources/application-prod.properties` - Production config with SSL
- ✅ `baskyapp/src/main/resources/application.properties.template` - Fixed host and SSL

#### Documentation

- ✅ `PYTHON_SCRAPER_DEPLOYMENT.md` - Updated with correct connection details
- ✅ Created `SUPABASE_CONNECTION_GUIDE.md` - Comprehensive connection guide
- ✅ Created `SUPABASE_CONNECTION_FIXED.md` - This file

#### Setup Scripts

- ✅ `setup_supabase_connection.ps1` - Windows PowerShell setup script
- ✅ `setup_supabase_connection.sh` - Linux/Mac bash setup script

---

## Manual Setup (If You Prefer)

### Step 1: Set Environment Variables

#### Windows PowerShell

```powershell
$env:DB_NAME="postgres"
$env:DB_USER="postgres.hbsdjlaogfdcjlghjuct"
$env:DB_PASSWORD="your-actual-password"
$env:DB_HOST="aws-0-us-east-1.pooler.supabase.com"
$env:DB_PORT="5432"
$env:DB_SSLMODE="require"
```

#### Linux/Mac/WSL

```bash
export DB_NAME="postgres"
export DB_USER="postgres.hbsdjlaogfdcjlghjuct"
export DB_PASSWORD="your-actual-password"
export DB_HOST="aws-0-us-east-1.pooler.supabase.com"
export DB_PORT="5432"
export DB_SSLMODE="require"
```

### Step 2: Test Connection

```bash
python utilities/test_supabase_connection.py
```

Expected output: `✅ ALL TESTS PASSED - Database connection is fully functional!`

### Step 3: Run Your Application

```bash
# Python scraper
python utilities/nba_scrape_to_postgres.py

# Flask API
python utilities/flask_api.py

# Java backend
cd baskyapp
./mvnw spring-boot:run  # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
```

---

## Connection Parameters Reference

| Parameter    | Value                                 | Required |
| ------------ | ------------------------------------- | -------- |
| **Host**     | `aws-0-us-east-1.pooler.supabase.com` | ✅ Yes   |
| **Port**     | `5432`                                | ✅ Yes   |
| **Database** | `postgres`                            | ✅ Yes   |
| **User**     | `postgres.hbsdjlaogfdcjlghjuct`       | ✅ Yes   |
| **Password** | (your password)                       | ✅ Yes   |
| **SSL Mode** | `require`                             | ✅ Yes   |
| **Timeout**  | `10` seconds                          | ⚙️ Auto  |

### JDBC URL (Java)

```
jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### psycopg2 Connection (Python)

```python
psycopg2.connect(
    host="aws-0-us-east-1.pooler.supabase.com",
    port="5432",
    dbname="postgres",
    user="postgres.hbsdjlaogfdcjlghjuct",
    password="your-password",
    sslmode="require",
    connect_timeout=10
)
```

---

## Verification Checklist

Before deploying, ensure:

- [ ] ✅ Host is `aws-0-us-east-1` (not aws-1)
- [ ] ✅ Port is `5432` (not 6543)
- [ ] ✅ SSL mode is `require`
- [ ] ✅ Password has no extra spaces or quotes
- [ ] ✅ Test script passes all checks
- [ ] ✅ SSL status shows "✅ Enabled"
- [ ] ✅ Write permissions test passes
- [ ] ✅ Environment variables set correctly

---

## Troubleshooting

### Connection Timeout

```
ERROR: connection timeout
```

**Solution:**

```bash
# Verify host is correct
echo $DB_HOST
# Should be: aws-0-us-east-1.pooler.supabase.com

# Test network connectivity
ping aws-0-us-east-1.pooler.supabase.com
```

### SSL Required Error

```
ERROR: SSL connection required
```

**Solution:**

```bash
# Ensure SSL mode is set
export DB_SSLMODE="require"

# For Java, verify URL includes sslmode parameter
```

### Authentication Failed

```
ERROR: authentication failed for user
```

**Solution:**

```bash
# Verify username format (must include project ID)
echo $DB_USER
# Should be: postgres.hbsdjlaogfdcjlghjuct (not just "postgres")

# Check password is correct (no copy-paste errors)
```

### Python SSL Error

```
ERROR: psycopg2 SSL error
```

**Solution:**

```bash
# Reinstall with SSL support
pip uninstall psycopg2 psycopg2-binary
pip install psycopg2-binary==2.9.9
```

---

## Component Status

### ✅ Python Scraper

- **Status**: Fully configured for Supabase
- **Configuration**: Reads from environment variables
- **SSL**: Enabled with `sslmode=require`
- **Connection Pooling**: N/A (short-lived script)
- **Error Handling**: Comprehensive logging with connection details

### ✅ Flask API

- **Status**: Fully configured for Supabase
- **Configuration**: Auto-sets from environment variables
- **SSL**: Inherited from scraper configuration
- **Connection Pooling**: Uses psycopg2 per-request connections
- **Error Handling**: Returns detailed JSON error responses

### ✅ Java Spring Boot Backend

- **Status**: Fully configured for Supabase
- **Configuration**: Environment variables + application.properties
- **SSL**: Enabled via `sslmode=require` in JDBC URL
- **Connection Pooling**: HikariCP (max 10, min 2 idle)
- **Error Handling**: Spring Boot default + custom logging

---

## Security Best Practices Implemented

1. ✅ **No hardcoded passwords** - All use environment variables
2. ✅ **SSL/TLS encryption** - All connections use `sslmode=require`
3. ✅ **Connection timeouts** - Prevents hanging connections
4. ✅ **Proper .gitignore** - `.env` files excluded from git
5. ✅ **Template files** - `.env.example` provided without secrets
6. ✅ **Connection pooling** - Configured for Java backend
7. ✅ **Error logging** - Detailed errors without exposing passwords

---

## Files Created

### Configuration Templates

- `utilities/.env.example` - Template for environment variables (no secrets)

### Testing Tools

- `utilities/test_supabase_connection.py` - Comprehensive connection test

### Setup Scripts

- `setup_supabase_connection.ps1` - Automated Windows setup
- `setup_supabase_connection.sh` - Automated Linux/Mac setup

### Documentation

- `SUPABASE_CONNECTION_GUIDE.md` - Detailed connection guide
- `SUPABASE_CONNECTION_FIXED.md` - This summary document

---

## What to Do Next

### Local Development

1. Run setup script: `.\setup_supabase_connection.ps1`
2. Verify connection test passes
3. Start developing!

### EC2 Deployment

1. Copy files to EC2: `scp -r utilities/ ec2-user@your-ip:~/nba-scraper/`
2. Run setup script: `./setup_supabase_connection.sh`
3. Configure systemd service (see `PYTHON_SCRAPER_DEPLOYMENT.md`)
4. Start services

### Docker Deployment

1. Add `.env` file to your container
2. Or pass environment variables via `docker run -e` flags
3. Ensure container can reach Supabase (outbound port 5432)

---

## Summary

### Before (Issues)

- ❌ Wrong host: `aws-1-us-east-1`
- ❌ Missing or wrong port
- ❌ No SSL configuration
- ❌ Hardcoded localhost settings
- ❌ No environment variable support
- ❌ Poor error messages

### After (Fixed)

- ✅ Correct host: `aws-0-us-east-1.pooler.supabase.com`
- ✅ Correct port: `5432`
- ✅ SSL enabled: `sslmode=require`
- ✅ All components use environment variables
- ✅ Comprehensive connection testing
- ✅ Detailed error logging
- ✅ Automated setup scripts
- ✅ Security best practices
- ✅ Complete documentation

---

## 🎉 Result

**Your Supabase database connection is now:**

- ✅ Properly configured across all components
- ✅ Using correct connection parameters
- ✅ Secured with SSL/TLS encryption
- ✅ Following security best practices
- ✅ Easy to test and verify
- ✅ Ready for development and production

**Zero theoretical issues remaining!** 🚀

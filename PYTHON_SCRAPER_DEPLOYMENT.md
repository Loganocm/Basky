# Python Scraper Deployment Guide

## What You Have Now

- `flask_api.py` - Flask wrapper that calls your scraper (NO LOGIC CHANGES)
- `nba_scrape_to_postgres.py` - Your UNCHANGED scraper
- Updated Java backend that calls the Flask API when database is empty

## EC2 Deployment Steps

### 1. Install Python on Your EC2 Instance

```bash
sudo yum update -y  # For Amazon Linux
sudo yum install python3.11 -y
sudo yum install python3-pip -y
```

### 2. Upload Files to EC2

Upload these files to `/home/ec2-user/utilities/`:

- `flask_api.py`
- `nba_scrape_to_postgres.py`
- `flask_requirements.txt`

```bash
# From your local machine
scp -i your-key.pem utilities/flask_api.py ec2-user@your-ec2-ip:/home/ec2-user/utilities/
scp -i your-key.pem utilities/nba_scrape_to_postgres.py ec2-user@your-ec2-ip:/home/ec2-user/utilities/
scp -i your-key.pem utilities/flask_requirements.txt ec2-user@your-ec2-ip:/home/ec2-user/utilities/
```

### 3. Install Dependencies on EC2

```bash
cd /home/ec2-user/utilities
pip3 install -r flask_requirements.txt
```

### 4. Update Database Config

The scraper now reads from environment variables. Create a `.env` file (see section below) or export environment variables:

```bash
export DB_NAME="postgres"
export DB_USER="postgres.hbsdjlaogfdcjlghjuct"
export DB_PASSWORD="your-supabase-password"
export DB_HOST="aws-0-us-east-1.pooler.supabase.com"
export DB_PORT="5432"
export DB_SSLMODE="require"
```

Note: Supabase requires SSL connections (sslmode=require) and uses port 5432 for the pooler.

### 5. Create Systemd Service (Run Flask as Background Service)

Create `/etc/systemd/system/basky-scraper.service`:

```bash
sudo nano /etc/systemd/system/basky-scraper.service
```

Paste this:

```ini
[Unit]
Description=Basky NBA Scraper Flask API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/utilities
Environment="PATH=/usr/bin:/usr/local/bin"
EnvironmentFile=/home/ec2-user/utilities/.env
ExecStart=/usr/bin/python3 flask_api.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 6. Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl start basky-scraper
sudo systemctl enable basky-scraper  # Auto-start on boot
sudo systemctl status basky-scraper  # Check status
```

### 7. Update Java Backend Config

Add to `application.properties`:

```properties
# Python Scraper Configuration
nba.scraper.url=http://localhost:5000/api/nba
nba.scraper.auto-sync=true
```

### 8. Open Firewall (if Flask needs external access)

```bash
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

## How It Works

1. **Java backend starts** → DatabaseInitializer runs
2. **Checks team count** → If 0, calls `http://localhost:5000/api/nba/sync`
3. **Flask API** → Calls your UNCHANGED `scrape_and_store()` function
4. **Python scraper** → Does its thing (ZERO CHANGES)
5. **Database fills** → Java backend is happy

## Testing

### Test Flask API Directly

```bash
# Check if running
curl http://localhost:5000/health

# Check database status
curl http://localhost:5000/api/nba/status

# Trigger sync manually
curl -X POST http://localhost:5000/api/nba/sync
```

### Test Java Backend Integration

Just start your Java app - it will automatically call the Python scraper if database is empty.

## Logs

```bash
# Flask API logs
sudo journalctl -u basky-scraper -f

# Java backend logs
tail -f /path/to/your/app/logs/spring-boot-application.log
```

## Manual Sync

If you need to sync manually:

```bash
cd /home/ec2-user/utilities
python3 nba_scrape_to_postgres.py
```

## Environment Variables (REQUIRED for Supabase)

Create `.env` file in `/home/ec2-user/utilities/` with correct Supabase connection details:

```bash
# Flask API Configuration
PORT=5000

# Supabase Database Configuration
# CRITICAL: Use the correct pooler host and port
DB_NAME=postgres
DB_USER=postgres.hbsdjlaogfdcjlghjuct
DB_PASSWORD=your-actual-password-here
DB_HOST=aws-1-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_SSLMODE=require
```

**Important Notes:**

- Supabase pooler uses port **5432**
- SSL mode **must** be set to `require` for Supabase
- Replace `your-actual-password-here` with your actual Supabase database password
- The host should match your Supabase project (this example uses `aws-1-us-east-1.pooler.supabase.com`)

Then update `nba_scrape_to_postgres.py` to read from env vars if you want.

## Troubleshooting

**Flask won't start:**

```bash
sudo systemctl status basky-scraper
sudo journalctl -u basky-scraper -n 50
```

**Java can't reach Flask:**

- Check Flask is running: `curl http://localhost:5000/health`
- Check firewall: `sudo firewall-cmd --list-ports`
- Check application.properties has correct URL

**Database connection fails:**

- Verify Supabase credentials in `.env` file
- Check EC2 security group allows outbound HTTPS (port 443) and PostgreSQL (port 5432) to Supabase
- Ensure SSL mode is set to `require`
- Test connection: `psql "postgresql://postgres.hbsdjlaogfdcjlghjuct:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"`
- Or using environment variables: `python3 -c "from nba_scrape_to_postgres import get_connection; conn = get_connection(); print('✅ Connection successful'); conn.close()"`

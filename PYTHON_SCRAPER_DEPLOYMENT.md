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

Upload these files to `/home/ec2-user/nba-scraper/`:

- `flask_api.py`
- `nba_scrape_to_postgres.py`
- `flask_requirements.txt`

```bash
# From your local machine
scp -i your-key.pem utilities/flask_api.py ec2-user@your-ec2-ip:/home/ec2-user/nba-scraper/
scp -i your-key.pem utilities/nba_scrape_to_postgres.py ec2-user@your-ec2-ip:/home/ec2-user/nba-scraper/
scp -i your-key.pem utilities/flask_requirements.txt ec2-user@your-ec2-ip:/home/ec2-user/nba-scraper/
```

### 3. Install Dependencies on EC2

```bash
cd /home/ec2-user/nba-scraper
pip3 install -r flask_requirements.txt
```

### 4. Update Database Config

Edit `nba_scrape_to_postgres.py` on EC2 to use Supabase:

```python
DB_NAME = "postgres"
DB_USER = "postgres.hbsdjlaogfdcjlghjuct"
DB_PASSWORD = "your-supabase-password"
DB_HOST = "aws-0-us-east-1.pooler.supabase.com"
DB_PORT = "6543"
```

### 5. Create Systemd Service (Run Flask as Background Service)

Create `/etc/systemd/system/nba-scraper.service`:

```bash
sudo nano /etc/systemd/system/nba-scraper.service
```

Paste this:

```ini
[Unit]
Description=NBA Scraper Flask API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/nba-scraper
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/python3 flask_api.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 6. Start the Service

```bash
sudo systemctl daemon-reload
sudo systemctl start nba-scraper
sudo systemctl enable nba-scraper  # Auto-start on boot
sudo systemctl status nba-scraper  # Check status
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
sudo journalctl -u nba-scraper -f

# Java backend logs
tail -f /path/to/your/app/logs/spring-boot-application.log
```

## Manual Sync

If you need to sync manually:

```bash
cd /home/ec2-user/nba-scraper
python3 nba_scrape_to_postgres.py
```

## Environment Variables (Optional)

Create `.env` file in `/home/ec2-user/nba-scraper/`:

```bash
PORT=5000
DB_NAME=postgres
DB_USER=postgres.hbsdjlaogfdcjlghjuct
DB_PASSWORD=your-password
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
```

Then update `nba_scrape_to_postgres.py` to read from env vars if you want.

## Troubleshooting

**Flask won't start:**

```bash
sudo systemctl status nba-scraper
sudo journalctl -u nba-scraper -n 50
```

**Java can't reach Flask:**

- Check Flask is running: `curl http://localhost:5000/health`
- Check firewall: `sudo firewall-cmd --list-ports`
- Check application.properties has correct URL

**Database connection fails:**

- Verify Supabase credentials
- Check EC2 security group allows outbound to Supabase
- Test connection: `psql -h aws-0-us-east-1.pooler.supabase.com -U postgres.hbsdjlaogfdcjlghjuct -d postgres -p 6543`

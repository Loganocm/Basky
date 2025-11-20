# EC2 Server Maintenance Commands

## SSH into EC2

```bash
ssh -i /path/to/your-key.pem ec2-user@your-ec2-ip-address
```

---

## Docker Backend (Spring Boot)

### Start Backend Container from Docker Hub

```bash
docker stop basky-backend && docker rm basky-backend && docker run -d --name basky-backend --restart unless-stopped -p 8080:8080 -e SPRING_DATASOURCE_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connectTimeout=30&socketTimeout=60" -e SPRING_DATASOURCE_USERNAME="postgres.hbsdjlaogfdcjlghjuct" -e SPRING_DATASOURCE_PASSWORD="NuUnmn301cHHAU0F" -e SPRING_JPA_HIBERNATE_DDL_AUTO="none" -e SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE="5" -e SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT="30000" shxde/basky-backend:latest
```

### Pull Latest Backend Image and Restart

```bash
docker pull shxde/basky-backend:latest
docker stop basky-backend && docker rm basky-backend && docker run -d --name basky-backend --restart unless-stopped -p 8080:8080 -e SPRING_DATASOURCE_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connectTimeout=30&socketTimeout=60" -e SPRING_DATASOURCE_USERNAME="postgres.hbsdjlaogfdcjlghjuct" -e SPRING_DATASOURCE_PASSWORD="NuUnmn301cHHAU0F" -e SPRING_JPA_HIBERNATE_DDL_AUTO="none" -e SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE="5" -e SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT="30000" shxde/basky-backend:latest
```

### Stop Backend Container

```bash
docker stop basky-backend
```

### View Backend Logs

```bash
docker logs -f basky-backend
```

### Check Backend Status

```bash
docker ps | grep basky-backend
curl http://localhost:8080/actuator/health
```

---

## Docker Frontend (Angular + Nginx)

### Start Frontend Container from Docker Hub

```bash
docker stop basky-frontend && docker rm basky-frontend && docker run -d --name basky-frontend --restart unless-stopped -p 80:80 shxde/basky-frontend:latest
```

### Pull Latest Frontend Image and Restart

```bash
docker pull shxde/basky-frontend:latest
docker stop basky-frontend && docker rm basky-frontend && docker run -d --name basky-frontend --restart unless-stopped -p 80:80 shxde/basky-frontend:latest
```

### Stop Frontend Container

```bash
docker stop basky-frontend
```

### View Frontend Logs

```bash
docker logs -f basky-frontend
```

---

## Flask API (NBA Data Scraper)

## Flask API (NBA Data Scraper)

### Pull Latest Code from GitHub

```bash
cd /home/ec2-user/Basky
git stash
git pull origin main
```

### Install/Update Dependencies

```bash
cd /home/ec2-user/Basky/utilities
pip3 install -r flask_requirements.txt
```

### Start Flask API

```bash
cd /home/ec2-user/Basky/utilities
nohup python3 flask_api.py > flask_api.log 2>&1 &
```

### Stop Flask API

```bash
pkill -f flask_api.py
```

### Restart Flask API

```bash
pkill -f flask_api.py && sleep 2 && cd /home/ec2-user/Basky/utilities && nohup python3 flask_api.py > flask_api.log 2>&1 &
```

### View Flask Logs

```bash
tail -f /home/ec2-user/Basky/utilities/flask_api.log
```

### Check Flask Status

```bash
ps aux | grep flask_api.py | grep -v grep
curl http://localhost:5000/api/nba/status
```

---

## Quick Commands

### Restart All Services

```bash
# Backend
docker stop basky-backend && docker rm basky-backend && docker run -d --name basky-backend --restart unless-stopped -p 8080:8080 -e SPRING_DATASOURCE_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connectTimeout=30&socketTimeout=60" -e SPRING_DATASOURCE_USERNAME="postgres.hbsdjlaogfdcjlghjuct" -e SPRING_DATASOURCE_PASSWORD="NuUnmn301cHHAU0F" -e SPRING_JPA_HIBERNATE_DDL_AUTO="none" -e SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE="5" -e SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT="30000" shxde/basky-backend:latest

# Frontend
docker stop basky-frontend && docker rm basky-frontend && docker run -d --name basky-frontend --restart unless-stopped -p 80:80 shxde/basky-frontend:latest

# Flask API
pkill -f flask_api.py && sleep 2 && cd /home/ec2-user/Basky/utilities && nohup python3 flask_api.py > flask_api.log 2>&1 &
```

### Update and Restart Everything

```bash
# Pull latest Docker images
docker pull shxde/basky-backend:latest
docker pull shxde/basky-frontend:latest

# Pull latest code
cd /home/ec2-user/Basky && git pull origin main

# Restart backend
docker stop basky-backend && docker rm basky-backend && docker run -d --name basky-backend --restart unless-stopped -p 8080:8080 -e SPRING_DATASOURCE_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require&connectTimeout=30&socketTimeout=60" -e SPRING_DATASOURCE_USERNAME="postgres.hbsdjlaogfdcjlghjuct" -e SPRING_DATASOURCE_PASSWORD="NuUnmn301cHHAU0F" -e SPRING_JPA_HIBERNATE_DDL_AUTO="none" -e SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE="5" -e SPRING_DATASOURCE_HIKARI_CONNECTION_TIMEOUT="30000" shxde/basky-backend:latest

# Restart frontend
docker stop basky-frontend && docker rm basky-frontend && docker run -d --name basky-frontend --restart unless-stopped -p 80:80 shxde/basky-frontend:latest

# Restart Flask
pkill -f flask_api.py && sleep 2 && cd /home/ec2-user/Basky/utilities && nohup python3 flask_api.py > flask_api.log 2>&1 &
```

### Check All Services Status

```bash
echo "=== Backend ===" && docker ps | grep basky-backend && curl -s http://localhost:8080/actuator/health
echo -e "\n=== Frontend ===" && docker ps | grep basky-frontend
echo -e "\n=== Flask API ===" && ps aux | grep flask_api.py | grep -v grep && curl -s http://localhost:5000/api/nba/status
```

---

## Troubleshooting

### Port Already in Use

```bash
# Port 8080 (Backend)
lsof -i :8080
docker stop basky-backend

# Port 80 (Frontend)
lsof -i :80
docker stop basky-frontend

# Port 5000 (Flask)
lsof -i :5000
pkill -f flask_api.py
```

### Remove All Containers and Start Fresh

```bash
docker stop basky-backend basky-frontend
docker rm basky-backend basky-frontend
# Then run the start commands above
```

### View All Docker Containers

```bash
docker ps -a
```

### Clean Up Docker

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f
```

# Docker Troubleshooting Guide

## 🔴 Common Issues & Solutions

---

## Issue: "pnpm install" Timeout during Build

### Problem
```
ERROR [stage-1 5/7] RUN pnpm install --frozen-lockfile --prod
CANCELED [builder 4/7] RUN npm install -g pnpm
```

### Solutions

**Option 1: Use Rebuild Script (Recommended)**
```powershell
# PowerShell
.\docker-rebuild.ps1

# Bash/Linux
bash docker-rebuild.sh
```

**Option 2: Increase Docker Resources**
1. Open Docker Desktop
2. Settings → Resources
3. Increase CPUs to 4+, Memory to 4GB+
4. Apply & Restart
5. Retry build

**Option 3: Manual Rebuild**
```bash
docker-compose down -v
docker system prune -a --volumes -f
docker-compose build --no-cache
docker-compose up -d
```

---

## Issue: "docker: command not found"

### Problem
Docker is not installed or not in PATH

### Solutions

**Windows/macOS:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and launch Docker Desktop
3. Restart terminal/PowerShell
4. Verify: `docker --version`

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Check installation
docker --version
docker-compose --version
```

---

## Issue: Port 3000 Already in Use

### Problem
```
Error: bind: address already in use
```

### Solutions

**Windows (PowerShell):**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

**macOS/Linux:**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

**Docker Compose Method:**
Edit `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "3001:3000"  # Changed from 3000 to 3001
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

---

## Issue: Port 27017 Already in Use

### Problem
MongoDB port is already in use

### Solutions

**Option 1: Change MongoDB Port**
Edit `docker-compose.yml`:
```yaml
services:
  mongodb:
    ports:
      - "27018:27017"  # Changed from 27017
```

**Option 2: Kill Existing Process**

Windows:
```powershell
netstat -ano | findstr :27017
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -i :27017
kill -9 <PID>
```

**Option 3: Use Different MongoDB Instance**
```bash
# Stop existing MongoDB
brew services stop mongodb-community
# or
sudo service mongod stop
```

---

## Issue: "Cannot connect to Docker daemon"

### Problem
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

### Solutions

**Windows/macOS:**
1. Make sure Docker Desktop is running
2. If not running, start Docker Desktop
3. Wait 30 seconds for it to fully start
4. Try again

**Linux:**
```bash
# Start Docker service
sudo service docker start

# Or with systemd
sudo systemctl start docker

# Verify
docker ps
```

**Permission Issues (Linux):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Test
docker ps
```

---

## Issue: Containers Won't Start

### Diagnostics
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs

# Check specific service
docker-compose logs app
docker-compose logs mongodb
```

### Common Causes

**MongoDB Won't Start:**
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Solutions:
# 1. Volume permission issue (Linux)
sudo chown -R 999:999 /var/lib/docker/volumes/buddy-connect_mongodb_data/_data

# 2. Out of disk space
docker system df

# 3. Restart MongoDB
docker-compose restart mongodb
```

**App Won't Start:**
```bash
# Check app logs
docker-compose logs app

# Common issues:
# - MONGODB_URI not set
# - JWT_SECRET not set
# - Port already in use
# - Dependencies not installed

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## Issue: "ECONNREFUSED" - Can't Connect to MongoDB

### Problem
Application can't connect to MongoDB

### Solutions

**1. Verify MongoDB is Running**
```bash
docker-compose ps

# Should show mongodb running
```

**2. Check Connection String**
```bash
# Verify in .env.local
cat .env.local | grep MONGODB

# Should match:
# MONGODB_HOST=mongodb (inside docker)
# or
# MONGODB_URI=... (if using Atlas)
```

**3. Test MongoDB Connection**
```bash
# Connect from host
docker-compose exec mongodb mongosh -u admin -p admin123

# Should connect successfully
```

**4. Check Network**
```bash
# Verify services are on same network
docker-compose config | grep networks

# Both should be on 'buddy-network'
```

**5. Restart Services**
```bash
docker-compose down
docker-compose up -d
sleep 10  # Wait for MongoDB to start
```

---

## Issue: High CPU/Memory Usage

### Diagnostics
```bash
# Check resource usage
docker stats

# Should show CPU and Memory %
```

### Solutions

**Reduce Resource Limits**
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'          # Reduced from 2
      memory: 512M       # Reduced from 1G
    reservations:
      cpus: '0.5'        # Reduced
      memory: 256M       # Reduced
```

**Increase Available Resources**
- Close other applications
- Increase Docker Desktop memory allocation
  - Windows/macOS: Docker Desktop Settings → Resources

**Database Optimization**
```yaml
mongodb:
  environment:
    - wiredTigerCacheSizeGB=0.5  # Limit cache
```

---

## Issue: Build Takes Too Long

### Problem
Docker build is very slow

### Solutions

**1. Clear Docker Cache**
```bash
docker system prune -a
docker-compose build --no-cache
```

**2. Check Internet Connection**
- Node dependencies are being downloaded
- Ensure stable connection

**3. Increase Docker Resources**
- Docker Desktop Settings → Resources
- Increase CPU and Memory available

**4. Use Pre-built Images**
Instead of building:
```bash
docker pull node:20-alpine
```

---

## Issue: Can't Access Application

### Problem
http://localhost:3000 returns "Unable to connect"

### Solutions

**1. Verify Container is Running**
```bash
docker-compose ps

# app should show: Up
```

**2. Check Logs**
```bash
docker-compose logs app

# Look for errors
```

**3. Test Port**

Windows:
```powershell
netstat -ano | findstr :3000

# Should show LISTENING
```

macOS/Linux:
```bash
lsof -i :3000

# Should show docker process
```

**4. Wait for Application**
- App takes ~30-60 seconds to start first time
- Try again after waiting

**5. Try From Container**
```bash
docker-compose exec app curl http://localhost:3000

# Should return HTML
```

**6. Restart Everything**
```bash
docker-compose down
docker-compose up -d
sleep 60
```

---

## Issue: MongoDB Won't Accept Connection

### Problem
```
MongoAuthenticationError: Authentication failed
```

### Solutions

**1. Verify Credentials**
Check `.env.local`:
```bash
cat .env.local

# Should have:
# MONGODB_USER=admin
# MONGODB_PASSWORD=admin123
```

**2. Test MongoDB Directly**
```bash
docker-compose exec mongodb mongosh -u admin -p admin123

# Should connect
```

**3. Reset MongoDB**
```bash
# Remove volume and recreate
docker-compose down -v
docker-compose up -d mongodb

# Wait for MongoDB to initialize
sleep 20

# Try connecting
docker-compose exec mongodb mongosh -u admin -p admin123
```

**4. Check MongoDB Logs**
```bash
docker-compose logs mongodb

# Look for initialization messages
```

---

## Issue: Disk Space Issues

### Diagnostics
```bash
# Check Docker disk usage
docker system df

# Check system disk
df -h
```

### Solutions

**1. Clean Docker Resources**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (WARNING: removes everything)
docker system prune -a --volumes
```

**2. Remove Old Images**
```bash
docker images

# Remove by ID
docker rmi <IMAGE_ID>
```

**3. Increase Disk Space**
- Add more storage to system
- Move Docker data to different drive

---

## Issue: Network Errors in Application

### Problem
Application can't reach external APIs

### Solutions

**1. Check Internet Connection**
```bash
docker-compose exec app curl https://google.com

# Should return HTML
```

**2. Check DNS Resolution**
```bash
docker-compose exec app nslookup google.com

# Should resolve to IP
```

**3. Check Firewall**
- Windows Firewall might block Docker
- Disable or add exception

**4. Restart Network**
```bash
docker-compose down
docker network prune
docker-compose up -d
```

---

## Issue: Files Not Updating in Container

### Problem
Code changes don't reflect in running container

### Solutions

**This is normal behavior in production mode.**

For development with live reload:

**Option 1: Run App Locally, MongoDB in Docker**
```bash
# Stop app container only
docker-compose stop app

# Update .env.local to use local MongoDB
# MONGODB_HOST=localhost

# Run app locally
pnpm dev
```

**Option 2: Rebuild Container**
```bash
docker-compose build --no-cache
docker-compose restart app
```

**Option 3: Mount Volume**
Edit `docker-compose.yml`:
```yaml
services:
  app:
    volumes:
      - ./app:/app/app
      - ./components:/app/components
      - ./.env.local:/app/.env.local
```

Then rebuild:
```bash
docker-compose up -d
```

---

## Issue: Out of Memory

### Problem
```
Cannot allocate memory
OOMKilled
```

### Solutions

**1. Check Current Limits**
```bash
docker stats

# Check Memory % column
```

**2. Increase Container Limits**
Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increased from 1G
```

**3. Increase Docker Resources**
- Docker Desktop → Settings → Resources
- Increase available memory for Docker

**4. Optimize Application**
```bash
# Check app memory usage
docker-compose exec app node --max-old-space-size=512 /app/node_modules/.bin/next start
```

---

## Issue: Slow Performance

### Problem
Application is very slow

### Solutions

**1. Check Resource Usage**
```bash
docker stats

# Monitor CPU, Memory, Network
```

**2. Enable Query Logging**
```bash
docker-compose exec mongodb mongosh -u admin -p admin123

# In mongosh
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().limit(5).sort({ ts: -1 }).pretty()
```

**3. Review API Optimization**
See **API_OPTIMIZATION_GUIDE.md**

**4. Database Indexes**
Ensure indexes are created:
```bash
docker-compose exec app npm run build
```

---

## 🆘 Still Stuck?

### Collect Information
```bash
# System info
docker version
docker-compose version

# Container info
docker-compose ps
docker-compose config

# Logs (last 100 lines)
docker-compose logs --tail=100

# Resource usage
docker stats

# Disk usage
docker system df
```

### Reset Everything
```bash
# Complete reset
docker-compose down -v
docker system prune -a
docker-compose up -d
```

### Get Help
1. Check **DOCKER_SETUP.md** for detailed docs
2. Review logs: `docker-compose logs`
3. Check Docker Desktop Status
4. Restart Docker Desktop
5. Restart system

---

## 📞 Emergency Commands

```bash
# View all logs
docker-compose logs

# Kill all containers
docker-compose kill

# Remove everything
docker-compose down -v
docker system prune -a --volumes

# Completely reset
docker-compose down -v
docker system prune -a
rm -rf node_modules
docker-compose up -d
```

---

Last Resort: Full Clean Slate
```bash
docker-compose down -v
docker system prune -a --volumes
docker ps  # Should be empty
docker images  # Should be empty
docker-compose up -d  # Start fresh
```

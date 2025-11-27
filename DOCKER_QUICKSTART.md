# Docker Quick Start - Buddy Connect

## ⚡ Quick Start (30 seconds)

### Windows (PowerShell)
```powershell
.\docker-setup.ps1
```

### macOS / Linux (Bash)
```bash
bash docker-setup.sh
```

### Manual Setup
```bash
# 1. Copy environment file
cp .env.docker .env.local

# 2. Start services
docker-compose up -d

# 3. Open browser
# http://localhost:3000
```

---

## 🐳 What Gets Set Up

| Service | Port | Details |
|---------|------|---------|
| **Next.js App** | 3000 | Your Buddy Connect application |
| **MongoDB** | 27017 | Database (local development) |

---

## 📋 Available Commands

### Using Make (macOS/Linux)
```bash
make up          # Start all services
make down        # Stop all services
make logs        # View app logs
make shell       # Access app container
make clean       # Remove everything including data
make help        # Show all commands
```

### Using Docker Compose Directly
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123
```

---

## 🎯 First Time Setup

1. **Install Docker**
   - Download: https://www.docker.com/products/docker-desktop
   - Start Docker Desktop

2. **Clone and Setup**
   ```bash
   git clone <repository>
   cd buddy-connect
   ```

3. **Run Setup Script**
   ```bash
   # Windows
   .\docker-setup.ps1
   
   # macOS/Linux
   bash docker-setup.sh
   ```

4. **Access Application**
   - Open: http://localhost:3000
   - Done! ✨

---

## 📦 MongoDB Access

### From Host Machine
```bash
# Connection string
mongodb://admin:admin123@localhost:27017

# Using MongoDB Compass GUI
# Download: https://www.mongodb.com/products/compass
```

### From Command Line
```bash
docker-compose exec mongodb mongosh -u admin -p admin123
```

### Inside MongoDB
```javascript
// List databases
show dbs

// Use database
use college-linkedin

// List collections
show collections

// View documents
db.users.find()
```

---

## 🔧 Configuration

### Environment Variables
Edit `.env.local`:

```env
# Database
MONGODB_USER=admin
MONGODB_PASSWORD=admin123
MONGODB_HOST=mongodb
MONGODB_DB_NAME=college-linkedin

# Security
JWT_SECRET=your-secret-key

# Node
NODE_ENV=production
```

### Production with MongoDB Atlas
Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/college-linkedin
JWT_SECRET=production-secret-key
NODE_ENV=production
```

---

## 📊 Checking Status

```bash
# View all containers
docker-compose ps

# Example output:
# NAME              STATUS       PORTS
# buddy-connect-app-1      Up    0.0.0.0:3000->3000/tcp
# buddy-connect-mongodb-1  Up    0.0.0.0:27017->27017/tcp

# View running resources
docker stats
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Fix Port 3000:**
```bash
# Option 1: Change in docker-compose.yml
# ports:
#   - "3001:3000"

# Then restart
docker-compose restart
```

**Fix Port 27017:**
```bash
# Kill process on port 27017
lsof -i :27017
kill -9 <PID>

# Or in docker-compose.yml change MongoDB port
```

### Services Won't Start

```bash
# 1. Check logs
docker-compose logs

# 2. Rebuild without cache
docker-compose build --no-cache

# 3. Full reset
docker-compose down -v
docker-compose up -d
```

### Can't Connect to MongoDB

```bash
# 1. Verify container is running
docker-compose ps

# 2. Check MongoDB logs
docker-compose logs mongodb

# 3. Verify connection string
echo "mongodb://admin:admin123@localhost:27017"

# 4. Test connection
docker-compose exec mongodb mongosh -u admin -p admin123
```

### Application Crashes

```bash
# 1. Check app logs
docker-compose logs app

# 2. Look for errors related to:
#    - MONGODB_URI not set
#    - JWT_SECRET not set
#    - Port already in use

# 3. Verify .env.local exists
ls -la .env.local
```

---

## 🚀 Production Deployment

### Using Production Compose File
```bash
# Set production variables
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=your-production-secret

# Start with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Push to Docker Registry
```bash
# Build image
docker-compose build

# Tag image
docker tag buddy-connect:latest your-registry/buddy-connect:v1.0

# Push to registry
docker push your-registry/buddy-connect:v1.0

# Deploy
docker run -d \
  --name buddy-connect \
  -p 80:3000 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  your-registry/buddy-connect:v1.0
```

---

## 💾 Data Persistence

Database data is stored in Docker volumes:
```bash
# View volumes
docker volume ls | grep buddy

# View volume location
docker volume inspect buddy-connect_mongodb_data

# Backup database
docker-compose exec mongodb mongodump --out /backup

# Restore database
docker-compose exec mongodb mongorestore /backup
```

---

## 🧹 Cleanup

### Stop Services (keep data)
```bash
docker-compose down
```

### Stop Services (delete data)
```bash
docker-compose down -v
```

### Remove All Docker Resources
```bash
docker system prune -a --volumes
```

---

## 📈 Performance Tips

### For Low-End Machines
1. Edit `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
       reservations:
         memory: 256M
   ```

2. Reduce MongoDB memory:
   ```yaml
   environment:
     - wiredTigerCacheSizeGB=0.5
   ```

### For High-Performance Machines
1. Increase resources in `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 4G
   ```

2. Scale MongoDB:
   ```yaml
   environment:
     - wiredTigerCacheSizeGB=2
   ```

---

## 📚 Useful Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **MongoDB Docker**: https://hub.docker.com/_/mongo
- **Next.js Docker**: https://nextjs.org/docs/deployment/docker

---

## ❓ FAQ

**Q: Can I use MongoDB Atlas instead of local MongoDB?**  
A: Yes! Set `MONGODB_URI` and remove MongoDB service from docker-compose.yml

**Q: How do I persist data between restarts?**  
A: Data is automatically persisted in Docker volumes. Use `docker-compose down -v` to delete.

**Q: Can I develop locally while using Docker?**  
A: Yes! Run `docker-compose up -d mongodb` and run the app locally with `pnpm dev`

**Q: How do I access MongoDB from my IDE?**  
A: Use connection string `mongodb://admin:admin123@localhost:27017` in MongoDB Compass

**Q: Is my data safe if Docker crashes?**  
A: Yes, data is persisted in Docker volumes on your disk.

---

## 🆘 Still Having Issues?

1. Check **DOCKER_SETUP.md** for detailed documentation
2. Review logs: `docker-compose logs`
3. Verify Docker is running: `docker ps`
4. Restart Docker Desktop
5. Run full reset: `docker-compose down -v && docker-compose up -d`

---

## 📝 Next Steps

- Read **DOCKER_SETUP.md** for advanced configuration
- Check **API_OPTIMIZATION_GUIDE.md** for performance tuning
- Review **ENVIRONMENT.md** for environment variables

Happy Coding! 🎉

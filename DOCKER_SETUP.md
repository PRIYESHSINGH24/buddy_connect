# Docker Setup Guide - Buddy Connect

## Prerequisites

1. **Docker Desktop** - Download from https://www.docker.com/products/docker-desktop
2. **Docker Compose** - Usually included with Docker Desktop
3. **Git** - For cloning the repository

## Quick Start

### 1. Copy Environment File

```bash
cp .env.docker .env.local
```

### 2. Start the Application (Choose One)

**Option A: Automated (Recommended)**
```powershell
# PowerShell
.\docker-rebuild.ps1

# Bash/Linux
bash docker-rebuild.sh
```

**Option B: Manual Start**
```bash
docker-compose up -d
```

This will:
- Build the Next.js application (5-10 minutes on first run)
- Start MongoDB on port 27017
- Start the Next.js app on port 3000

### 3. Access the Application

```
🌐 Web App: http://localhost:3000
🗄️  MongoDB: mongodb://admin:admin123@localhost:27017
```

### ⏳ First Build Takes Time
The first build will take 5-10 minutes as it:
- Installs Node.js dependencies
- Builds Next.js application
- Starts MongoDB

Subsequent builds are much faster (~30 seconds)

---

## Common Commands

### View running containers
```bash
docker-compose ps
```

### View application logs
```bash
docker-compose logs -f app
```

### View MongoDB logs
```bash
docker-compose logs -f mongodb
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose down -v
```

### Rebuild the application
```bash
docker-compose build --no-cache
```

### Restart services
```bash
docker-compose restart
```

---

## Environment Configuration

### Local Development (.env.docker)

```env
MONGODB_USER=admin
MONGODB_PASSWORD=admin123
MONGODB_HOST=mongodb
MONGODB_DB_NAME=college-linkedin
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Production with MongoDB Atlas

1. Update `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/college-linkedin?retryWrites=true&w=majority
JWT_SECRET=your-production-secret-key
NODE_ENV=production
```

2. Remove MongoDB service from `docker-compose.yml` if using Atlas

3. Start only the app:
```bash
docker-compose up -d app
```

---

## Accessing MongoDB

### Inside Docker

```bash
docker-compose exec mongodb mongosh -u admin -p admin123
```

### From Host Machine

```bash
mongosh mongodb://admin:admin123@localhost:27017
```

### Using MongoDB Compass

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connection String: `mongodb://admin:admin123@localhost:27017`
3. Connect

---

## Troubleshooting

### Port Already in Use

**Port 3000 already in use:**
```bash
docker-compose down
# or change port in docker-compose.yml:
# ports:
#   - "3001:3000"
```

**Port 27017 already in use:**
```bash
# Change MongoDB port in docker-compose.yml:
# ports:
#   - "27018:27017"
```

### MongoDB Connection Failed

1. Check if MongoDB is running:
```bash
docker-compose ps
```

2. Wait for MongoDB to start (takes ~10-15 seconds)

3. Check MongoDB logs:
```bash
docker-compose logs mongodb
```

4. Restart MongoDB:
```bash
docker-compose restart mongodb
```

### Application Won't Start

1. Check app logs:
```bash
docker-compose logs app
```

2. Verify environment variables:
```bash
docker-compose config
```

3. Check if port 3000 is available

4. Rebuild the image:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Building Takes Too Long

1. Ensure you have enough disk space (minimum 5GB)
2. Check internet connection
3. Clear Docker cache:
```bash
docker system prune -a
```

---

## Performance Optimization

### Resource Limits

The `docker-compose.yml` includes resource limits:
- **CPU Limit**: 2 cores
- **Memory Limit**: 1GB
- **Reservations**: 1 core, 512MB

### Adjust for Low-End Machines

Edit `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### Adjust for High-Performance Machines

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G
    reservations:
      cpus: '2'
      memory: 2G
```

---

## Development Workflow

### Option 1: Docker for Both App & DB

```bash
docker-compose up -d
# Then access http://localhost:3000
```

### Option 2: Local App with Docker MongoDB

```bash
# Start only MongoDB
docker-compose up -d mongodb

# Update MONGODB_URI to: mongodb://admin:admin123@localhost:27017

# Run app locally
pnpm dev
```

### Option 3: Docker App with Local MongoDB

Keep local MongoDB running on port 27017, update `docker-compose.yml`:
```yaml
environment:
  - MONGODB_URI=mongodb://host.docker.internal:27017/college-linkedin
```

---

## Deployment

### Build for Production

```bash
docker-compose build --no-cache
```

### Push to Docker Registry

```bash
docker login
docker tag buddy-connect:latest your-registry/buddy-connect:latest
docker push your-registry/buddy-connect:latest
```

### Run in Production

```bash
docker run -d \
  --name buddy-connect \
  -p 80:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="production-secret" \
  your-registry/buddy-connect:latest
```

---

## Docker Image Details

### Base Image
- **Node.js**: 20-alpine (lightweight, secure)
- **Size**: ~250MB (without dependencies)

### Multi-Stage Build
1. **Builder Stage**: Compiles Next.js
2. **Production Stage**: Only includes production dependencies

### Health Checks
- Runs every 30 seconds
- Returns 200 status from `http://localhost:3000/`
- 5-second timeout
- 3 retries before marking unhealthy

---

## Monitoring

### Check Application Health

```bash
docker-compose ps
# Healthy status shown as (healthy)

curl http://localhost:3000
# Should return HTML
```

### View Resource Usage

```bash
docker stats
```

### View Container Details

```bash
docker inspect buddy-connect_app_1
```

---

## Advanced Usage

### Custom Docker Build Args

Edit `docker-compose.yml`:
```yaml
build:
  context: .
  dockerfile: Dockerfile
  args:
    NODE_VERSION: 20
```

### Using Docker Volumes

Edit `docker-compose.yml`:
```yaml
volumes:
  - ./app:/app/app
  - ./components:/app/components
  - /app/.next
```

### Network Communication

Services communicate via service name:
- App → MongoDB: `mongodb://admin:admin123@mongodb:27017`
- MongoDB → (none, database)

---

## Cleanup

### Remove All Docker Resources

```bash
# Stop and remove containers, networks
docker-compose down

# Also remove volumes (database data)
docker-compose down -v

# Remove unused images
docker image prune

# Full cleanup
docker system prune -a --volumes
```

---

## Getting Help

### Check Docker Logs
```bash
docker-compose logs --tail=100 app
docker-compose logs --tail=100 mongodb
```

### Rebuild Everything
```bash
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### Reset Application State
```bash
docker-compose down -v
docker-compose up -d
```

---

## References

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Next.js Docker: https://nextjs.org/docs/deployment/docker
- MongoDB Docker: https://hub.docker.com/_/mongo

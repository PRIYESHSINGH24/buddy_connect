# Docker Quick Reference - Buddy Connect

## 🚀 QUICK START (Pick One)

### Automated (Windows)
```powershell
.\docker-rebuild.ps1
```

### Automated (Linux/Mac)
```bash
bash docker-rebuild.sh
```

### Manual
```bash
docker-compose up -d
```

---

## 📍 AFTER STARTUP

| What | URL | Command |
|------|-----|---------|
| **Web App** | http://localhost:3000 | `docker-compose ps` |
| **MongoDB** | mongodb://admin:admin123@localhost:27017 | `docker-compose exec mongodb mongosh -u admin -p admin123` |
| **View Logs** | - | `docker-compose logs -f app` |

---

## 🛑 STOP / RESTART

```bash
# Stop all
docker-compose down

# Stop and delete data
docker-compose down -v

# Restart
docker-compose restart

# View status
docker-compose ps
```

---

## 🔧 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| **Build timeout** | `.\docker-rebuild.ps1` |
| **Port in use** | Change port in `docker-compose.yml` |
| **MongoDB connection fails** | Wait 30s, then `docker-compose restart mongodb` |
| **Out of memory** | Docker Desktop Settings → Resources → Increase |

---

## 📊 BUILD TIMES

- **First Build**: 5-10 minutes ⏳
- **Next Builds**: 30-60 seconds ⚡

---

## 📋 USEFUL COMMANDS

```bash
# Check what's running
docker-compose ps

# See everything in real-time
docker-compose logs -f

# Get app logs only
docker-compose logs -f app

# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Full system cleanup
docker system prune -a --volumes -f
```

---

## 🆘 WHEN THINGS GO WRONG

### Step 1: Check logs
```bash
docker-compose logs
```

### Step 2: Restart
```bash
docker-compose restart
```

### Step 3: Rebuild
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Step 4: Full reset
```powershell
.\docker-rebuild.ps1
```

---

## ✅ VERIFY IT WORKS

```bash
# All green?
docker-compose ps

# Can you reach the app?
curl http://localhost:3000

# Can MongoDB respond?
docker-compose exec mongodb mongosh -u admin -p admin123 --eval "db.runCommand('ping')"
```

---

## 📚 MORE INFO

- **Setup Guide**: `DOCKER_SETUP.md`
- **Troubleshooting**: `DOCKER_TROUBLESHOOTING.md`
- **Full Summary**: `DOCKER_FIX_SUMMARY.md`

---

**Last Updated**: November 26, 2025  
**Status**: ✅ Ready to Use

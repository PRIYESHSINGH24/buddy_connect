# 🚀 Buddy Connect - Docker Complete Setup

## ⚡ Start Here (30 Seconds)

### Windows
```powershell
.\docker-setup.ps1
```

### macOS/Linux
```bash
bash docker-setup.sh
```

Then open: **http://localhost:3000**

---

## 📚 Documentation Quick Links

| Need | Read |
|------|------|
| **Quick Start** 👈 | [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) |
| **How to...?** | [DOCKER_SETUP.md](./DOCKER_SETUP.md) |
| **Something Broke** | [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md) |
| **File Reference** | [DOCKER_FILES_REFERENCE.md](./DOCKER_FILES_REFERENCE.md) |
| **Setup Summary** | [DOCKER_SETUP_SUMMARY.md](./DOCKER_SETUP_SUMMARY.md) |

---

## 🎯 What's Included

### 🐳 Docker Files
- ✅ Dockerfile (multi-stage, production-ready)
- ✅ docker-compose.yml (development)
- ✅ docker-compose.prod.yml (production)
- ✅ .dockerignore (optimization)

### 🔧 Configuration
- ✅ .env.docker (default variables)
- ✅ .env.example (template)

### 🤖 Automation
- ✅ docker-setup.sh (Linux/macOS)
- ✅ docker-setup.ps1 (Windows)
- ✅ Makefile (easy commands)

### 📖 Documentation
- ✅ 5 comprehensive guides
- ✅ Troubleshooting included
- ✅ Examples & code snippets

---

## 🚀 Common Commands

```bash
# Start services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f app

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123

# Stop services
docker-compose down
```

---

## ✨ Features

✅ **One-Command Setup** - Run script and you're done  
✅ **Development Ready** - Includes local MongoDB  
✅ **Production Ready** - Optimized Dockerfile, MongoDB Atlas support  
✅ **Cross-Platform** - Windows, macOS, Linux scripts  
✅ **Well Documented** - 5 comprehensive guides  
✅ **Easy Management** - Makefile with common commands  
✅ **Resource Limited** - Won't crash low-end machines  
✅ **Health Checks** - Built-in service monitoring  

---

## 📊 Architecture

```
Your Machine
    ↓
[Docker Engine]
    ↓
┌───────────────────────────┐
│  Docker Container Network  │
├───────────────────────────┤
│ ┌─────────────┐            │
│ │ Next.js App │ Port 3000  │
│ │ (Container) │            │
│ └──────┬──────┘            │
│        │ connects to        │
│ ┌──────▼──────────────┐    │
│ │ MongoDB Database    │    │
│ │ (Container)         │    │
│ │ mongodb://...       │    │
│ └─────────────────────┘    │
└───────────────────────────┘
```

---

## 🎓 3-Step Guide

### Step 1: Run Setup Script
Choose based on your OS:

**Windows:**
```powershell
.\docker-setup.ps1
```

**macOS/Linux:**
```bash
bash docker-setup.sh
```

### Step 2: Wait for Services
The script will:
- Check Docker installation
- Create environment file
- Start containers
- Verify connectivity

### Step 3: Open Browser
```
http://localhost:3000
```

**Done!** ✨

---

## 🔍 Check Everything Works

```bash
# View containers
docker-compose ps

# Expected output:
# NAME              STATUS
# buddy-connect-app-1       Up (healthy)
# buddy-connect-mongodb-1   Up (healthy)

# Test application
curl http://localhost:3000

# Test MongoDB
docker-compose exec mongodb mongosh -u admin -p admin123
```

---

## 🛠️ Using Makefile (Unix-like)

```bash
make up          # Start services
make down        # Stop services
make logs        # View logs
make rebuild     # Build without cache
make clean       # Remove everything
make help        # Show all commands
```

---

## 🐛 If Something's Wrong

### Container won't start?
```bash
docker-compose logs
```

### Can't connect to MongoDB?
```bash
docker-compose restart mongodb
```

### Port 3000 already in use?
Edit `docker-compose.yml`, change port 3000 to 3001

### See guide: [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)

---

## 📦 What You Get

### Application
- Next.js 16 running on port 3000
- Auto-restart on crash
- Health monitoring
- Resource limits (1GB RAM, 2 CPU)

### Database
- MongoDB 7.0
- Local data persistence
- Auto-initialization
- Health checks

### Network
- Internal Docker network
- Services communicate by name
- Isolated from host

---

## 🔐 Security

- Default credentials: admin/admin123 (change in production)
- Isolated Docker network (not exposed)
- Environment variables for secrets
- Production config with better security

---

## 📱 Works On

✅ Windows 10+  
✅ macOS (Intel & Apple Silicon)  
✅ Linux (Ubuntu, Debian, CentOS, etc.)  
✅ Docker Desktop  
✅ Docker CLI  

---

## 🚀 Next Steps

1. **Run Setup**: `.\docker-setup.ps1` or `bash docker-setup.sh`
2. **Open App**: http://localhost:3000
3. **Read Guide**: [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)
4. **Explore Commands**: `make help` or `docker-compose --help`
5. **Deploy**: See [DOCKER_SETUP.md](./DOCKER_SETUP.md#-production-deployment)

---

## 📞 Need Help?

| Issue | Solution |
|-------|----------|
| Docker not installed | Download Docker Desktop |
| Container won't start | Check `docker-compose logs` |
| Can't connect to app | Wait 30s, refresh browser |
| Port already in use | Change port in docker-compose.yml |
| Database not responding | Restart: `docker-compose restart mongodb` |
| Detailed troubleshooting | Read DOCKER_TROUBLESHOOTING.md |

---

## 📚 All Files Explained

| File | Purpose |
|------|---------|
| Dockerfile | How to build the image |
| docker-compose.yml | Development setup (app + MongoDB) |
| docker-compose.prod.yml | Production setup |
| .dockerignore | Files to exclude from image |
| .env.docker | Environment template |
| docker-setup.sh | Auto-setup for Linux/macOS |
| docker-setup.ps1 | Auto-setup for Windows |
| Makefile | Shortcut commands |
| DOCKER_QUICKSTART.md | Quick reference guide |
| DOCKER_SETUP.md | Comprehensive documentation |
| DOCKER_TROUBLESHOOTING.md | Problem solutions |
| DOCKER_FILES_REFERENCE.md | File inventory |
| DOCKER_SETUP_SUMMARY.md | What was created |

---

## ✅ Verification

After setup, you should see:

```
✓ Docker Desktop running
✓ docker-compose ps shows 2 containers
✓ Both containers status: "Up"
✓ Application loads at http://localhost:3000
✓ MongoDB accessible at localhost:27017
```

---

## 🎯 Commands by Task

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Access Container
```bash
docker-compose exec app sh
docker-compose exec mongodb mongosh -u admin -p admin123
```

### Restart Services
```bash
docker-compose restart
```

### Stop & Remove
```bash
docker-compose down
docker-compose down -v  # Also remove data
```

---

## 🎉 You're Ready!

Your Buddy Connect application is now fully containerized and can be started with a single command.

**Get started:** Choose your command above and run it now! 🚀

---

## 📖 Documentation Hierarchy

```
This File (You Are Here)
    ↓
DOCKER_QUICKSTART.md (Quick Reference)
    ├─→ Common Tasks
    ├─→ FAQ
    └─→ Troubleshooting Basics
    ↓
DOCKER_SETUP.md (Deep Dive)
    ├─→ Installation Details
    ├─→ Configuration Options
    ├─→ Deployment Strategies
    └─→ Advanced Topics
    ↓
DOCKER_TROUBLESHOOTING.md (Problem Solving)
    ├─→ 20+ Common Issues
    ├─→ Step-by-Step Solutions
    └─→ Emergency Procedures
```

---

**Ready? Let's go!** 🚀

[→ Start with DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md)

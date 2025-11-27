# Buddy Connect - Docker Rebuild & Clean Script (PowerShell)
# This script removes all Docker containers and images and rebuilds from scratch

Write-Host "🔄 Buddy Connect - Docker Cleanup & Rebuild" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if docker is installed
try {
    $dockerVersion = docker --version
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Step 1: Stopping all containers..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host "🗑️  Step 2: Removing volumes (database data will be deleted)..." -ForegroundColor Yellow
docker-compose down -v 2>$null

Write-Host "🧹 Step 3: Pruning unused images and volumes..." -ForegroundColor Yellow
docker system prune -a --volumes -f 2>$null

Write-Host "🏗️  Step 4: Building Docker image (this may take 2-5 minutes)..." -ForegroundColor Yellow
Write-Host ""
docker-compose build --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Starting containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    Write-Host ""
    Write-Host "⏳ Waiting for MongoDB to start (30 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host ""
    Write-Host "✅ All containers started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "🌐 Application: http://localhost:3000" -ForegroundColor Green
    Write-Host "🗄️  MongoDB: mongodb://admin:admin123@localhost:27017" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 View logs: docker-compose logs -f app" -ForegroundColor Gray
    Write-Host "🛑 Stop: docker-compose down" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check logs above." -ForegroundColor Red
    exit 1
}

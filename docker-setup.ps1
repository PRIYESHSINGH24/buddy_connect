# Buddy Connect - Docker Quick Start Script (Windows PowerShell)

Write-Host "🚀 Buddy Connect - Docker Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
try {
    $null = docker --version
    Write-Host "✓ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    $null = docker-compose --version
    Write-Host "✓ Docker Compose found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local from .env.docker..." -ForegroundColor Yellow
    Copy-Item .env.docker .env.local
    Write-Host "✓ .env.local created" -ForegroundColor Green
    Write-Host ""
}

# Start services
Write-Host "🐳 Starting Buddy Connect services..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services
Write-Host ""
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check MongoDB
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Yellow
$mongoCheck = docker-compose exec -T mongodb mongosh -u admin -p admin123 --eval "db.adminCommand('ping')" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB is starting, this may take a moment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Check Application
Write-Host "🔍 Checking Application..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -ErrorAction SilentlyContinue
    Write-Host "✓ Application is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Application is starting, this may take a moment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  MongoDB:     mongodb://admin:admin123@localhost:27017" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Useful commands:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f app        # View app logs"
Write-Host "   docker-compose logs -f mongodb    # View database logs"
Write-Host "   docker-compose ps                 # View running containers"
Write-Host "   docker-compose down               # Stop all services"
Write-Host ""
Write-Host "📖 For more info, see DOCKER_SETUP.md" -ForegroundColor Gray

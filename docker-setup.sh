#!/bin/bash

# Buddy Connect - Docker Quick Start Script

set -e

echo "🚀 Buddy Connect - Docker Setup"
echo "================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Desktop."
    exit 1
fi

echo "✓ Docker and Docker Compose found"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.docker..."
    cp .env.docker .env.local
    echo "✓ .env.local created"
    echo ""
fi

# Start services
echo "🐳 Starting Buddy Connect services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check MongoDB health
echo "🔍 Checking MongoDB..."
if docker-compose exec -T mongodb mongosh -u admin -p admin123 --eval "db.adminCommand('ping')" &> /dev/null; then
    echo "✓ MongoDB is running"
else
    echo "⚠️  MongoDB is starting, this may take a moment..."
    sleep 10
fi

# Check App health
echo "🔍 Checking Application..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Application is running"
else
    echo "⚠️  Application is starting, this may take a moment..."
    sleep 10
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🌐 Application: http://localhost:3000"
echo "🗄️  MongoDB:     mongodb://admin:admin123@localhost:27017"
echo ""
echo "📚 Useful commands:"
echo "   docker-compose logs -f app        # View app logs"
echo "   docker-compose logs -f mongodb    # View database logs"
echo "   docker-compose ps                 # View running containers"
echo "   docker-compose down               # Stop all services"
echo ""
echo "📖 For more info, see DOCKER_SETUP.md"

#!/bin/bash

# Buddy Connect - Docker Rebuild & Clean Script
# This script removes all Docker containers and images and rebuilds from scratch

echo "🔄 Buddy Connect - Docker Cleanup & Rebuild"
echo "==========================================="
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Desktop."
    exit 1
fi

echo "📋 Step 1: Stopping all containers..."
docker-compose down 2>/dev/null || true

echo "🗑️  Step 2: Removing volumes (database data will be deleted)..."
docker-compose down -v 2>/dev/null || true

echo "🧹 Step 3: Pruning unused images and volumes..."
docker system prune -a --volumes -f 2>/dev/null || true

echo "🏗️  Step 4: Building Docker image..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting containers..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for MongoDB to start (30 seconds)..."
    sleep 30
    
    echo ""
    echo "✅ All containers started successfully!"
    echo ""
    echo "📊 Container Status:"
    docker-compose ps
    echo ""
    echo "🌐 Application: http://localhost:3000"
    echo "🗄️  MongoDB: mongodb://admin:admin123@localhost:27017"
    echo ""
    echo "📝 View logs: docker-compose logs -f app"
    echo "🛑 Stop: docker-compose down"
else
    echo ""
    echo "❌ Build failed. Check logs above."
    exit 1
fi

.PHONY: help build up down logs shell clean restart rebuild

help:
	@echo "Buddy Connect Docker Commands"
	@echo "=============================="
	@echo ""
	@echo "make up                - Start all services"
	@echo "make down              - Stop all services"
	@echo "make build             - Build Docker image"
	@echo "make rebuild           - Rebuild without cache"
	@echo "make logs              - View application logs"
	@echo "make logs-db           - View MongoDB logs"
	@echo "make shell             - Access app shell"
	@echo "make shell-db          - Access MongoDB shell"
	@echo "make restart           - Restart all services"
	@echo "make clean             - Remove containers and volumes"
	@echo "make status            - Show container status"
	@echo "make prod-up           - Start production setup"
	@echo ""

# Development commands
up:
	@echo "Starting Buddy Connect..."
	docker-compose up -d
	@echo "✓ Application running on http://localhost:3000"
	@echo "✓ MongoDB running on mongodb://admin:admin123@localhost:27017"

down:
	@echo "Stopping Buddy Connect..."
	docker-compose down
	@echo "✓ All services stopped"

build:
	@echo "Building Docker image..."
	docker-compose build
	@echo "✓ Build complete"

rebuild:
	@echo "Rebuilding Docker image (no cache)..."
	docker-compose build --no-cache
	@echo "✓ Rebuild complete"

logs:
	@echo "Showing application logs (Ctrl+C to exit)..."
	docker-compose logs -f app

logs-db:
	@echo "Showing MongoDB logs (Ctrl+C to exit)..."
	docker-compose logs -f mongodb

shell:
	@echo "Accessing application container..."
	docker-compose exec app sh

shell-db:
	@echo "Accessing MongoDB shell..."
	docker-compose exec mongodb mongosh -u admin -p admin123

restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "✓ Services restarted"

clean:
	@echo "Removing containers and volumes..."
	docker-compose down -v
	@echo "✓ Cleanup complete"

status:
	@echo "Container Status:"
	docker-compose ps

# Production commands
prod-up:
	@echo "Starting production setup..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "✓ Production application running on http://localhost"

prod-down:
	@echo "Stopping production setup..."
	docker-compose -f docker-compose.prod.yml down
	@echo "✓ Production stopped"

prod-logs:
	@echo "Showing production logs..."
	docker-compose -f docker-compose.prod.yml logs -f app

# Utility commands
ps:
	docker-compose ps

system-prune:
	@echo "Cleaning up unused Docker resources..."
	docker system prune -a
	@echo "✓ Cleanup complete"

size:
	@echo "Docker image sizes:"
	docker images | grep buddy

# Help command
usage: help

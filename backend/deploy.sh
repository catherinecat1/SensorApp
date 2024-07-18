#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables
source .env

# Step 1: Pull the latest changes from the repository
echo "Pulling latest changes from the repository..."
git pull origin main

# Step 2: Build Docker images
echo "Building Docker images..."
docker-compose build

# Step 3: Stop and remove existing containers
echo "Stopping and removing existing containers..."
docker-compose down

# Step 4: Start PostgreSQL and Redis containers
echo "Starting PostgreSQL and Redis containers..."
docker-compose up -d postgres redis

# Step 5: Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

# Step 6: Run database migrations
echo "Running database migrations..."
docker-compose run --rm app npm run scripts/setup-db.js

# Step 7: Start the application container
echo "Starting the application container..."
docker-compose up -d app

# Step 8: Run tests
echo "Running tests..."
docker-compose run --rm app npm test

# Step 9: Clean up unused Docker resources
echo "Cleaning up unused Docker resources..."
docker system prune -f

# Step 10: Check application logs
echo "Checking application logs..."
docker-compose logs --tail=100 app

echo "Deployment completed successfully!"
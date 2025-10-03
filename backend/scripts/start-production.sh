#!/bin/bash

# Production Startup Script for Rishabh Vendor Connect
# This script handles database migrations, seeding, and application startup

set -e

echo "Starting Rishabh Vendor Connect in production mode..."
echo "Timestamp: $(date)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Wait for database to be ready
echo "Waiting for database connection..."
until pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 2
done
echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Database migrations completed successfully"
else
    echo "ERROR: Database migrations failed"
    exit 1
fi

# Optional: Run database seeding (uncomment if needed)
# echo "Seeding database with initial data..."
# npm run seed

# Create necessary directories
echo "Creating storage directories..."
mkdir -p /opt/render/project/src/storage/uploads
mkdir -p /opt/render/project/src/storage/pdfs
mkdir -p /opt/render/project/src/storage/backups

# Set proper permissions
chmod 755 /opt/render/project/src/storage
chmod 755 /opt/render/project/src/storage/uploads
chmod 755 /opt/render/project/src/storage/pdfs
chmod 755 /opt/render/project/src/storage/backups

echo "Storage directories created and configured"

# Start the application
echo "Starting application server..."
exec node src/server.js

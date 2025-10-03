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

# Resolve absolute paths for migration files
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BACKEND_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)
SCHEMA_FILE="$BACKEND_ROOT/db/schema.sql"
SEED_FILE="$BACKEND_ROOT/db/seed.sql"

# Run database migrations (absolute path to avoid CWD issues)
echo "Running database migrations..."
if [ ! -f "$SCHEMA_FILE" ]; then
  echo "ERROR: Schema file not found at $SCHEMA_FILE"
  exit 1
fi

psql "$DATABASE_URL" -f "$SCHEMA_FILE"

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "Database migrations completed successfully"
else
    echo "ERROR: Database migrations failed"
    exit 1
fi

# Optional: Run database seeding (uncomment to enable)
# if [ -f "$SEED_FILE" ]; then
#   echo "Seeding database with initial data..."
#   psql "$DATABASE_URL" -f "$SEED_FILE"
# fi

# Create ephemeral storage directories (resets on restart)
echo "Creating ephemeral storage directories..."
mkdir -p /tmp/uploads
mkdir -p /tmp/pdfs
mkdir -p /tmp/backups

# Set proper permissions
chmod 755 /tmp/uploads
chmod 755 /tmp/pdfs
chmod 755 /tmp/backups

echo "Ephemeral storage directories created and configured"
echo "Note: Files in /tmp will be lost on service restart/deploy"

# Start the application
echo "Starting application server..."
exec node src/server.js

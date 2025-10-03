#!/bin/bash

# Database Backup Script for Rishabh Vendor Connect
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration - Using ephemeral storage (resets on restart)
BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="rishabh_vendor_connect_backup_${DATE}.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "Starting database backup at $(date)"
echo "Backup file: $BACKUP_FILE"

# Create the backup
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_FILE.gz"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE.gz" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
    
    # Clean up old backups (keep only last 30 days)
    echo "Cleaning up old backups (older than $RETENTION_DAYS days)"
    find "$BACKUP_DIR" -name "rishabh_vendor_connect_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # List remaining backups
    echo "Remaining backups:"
    ls -la "$BACKUP_DIR"/rishabh_vendor_connect_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    
else
    echo "ERROR: Backup failed"
    exit 1
fi

echo "Backup process completed at $(date)"

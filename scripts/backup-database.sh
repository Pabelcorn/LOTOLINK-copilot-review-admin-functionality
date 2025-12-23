#!/bin/bash

###############################################################################
# Database Backup Script for LOTOLINK
# This script creates automated PostgreSQL backups with rotation
###############################################################################

set -e  # Exit on error

# Configuration (override with environment variables)
BACKUP_DIR="${BACKUP_DIR:-/var/backups/lotolink/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATABASE_HOST="${DATABASE_HOST:-localhost}"
DATABASE_PORT="${DATABASE_PORT:-5432}"
DATABASE_USER="${DATABASE_USER:-lotolink}"
DATABASE_NAME="${DATABASE_NAME:-lotolink_db}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
LOG_FILE="/var/log/lotolink/backup.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting database backup..."
log "Database: $DATABASE_NAME@$DATABASE_HOST:$DATABASE_PORT"
log "Backup location: $BACKUP_DIR/$BACKUP_FILE"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Create backup
log "Creating backup..."
if PGPASSWORD="$DATABASE_PASSWORD" pg_dump \
    -h "$DATABASE_HOST" \
    -p "$DATABASE_PORT" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_DIR/$BACKUP_FILE"; then
    
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "✅ Backup created successfully: $BACKUP_FILE (Size: $BACKUP_SIZE)"
else
    error "❌ Backup failed!"
    exit 1
fi

# Verify backup file
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    if [ -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log "✅ Backup file verified (non-empty)"
    else
        error "❌ Backup file is empty!"
        exit 1
    fi
else
    error "❌ Backup file not found!"
    exit 1
fi

# Create a symlink to the latest backup
ln -sf "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/latest.sql.gz"
log "✅ Symlink created: latest.sql.gz -> $BACKUP_FILE"

# Cleanup old backups
log "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime "+$RETENTION_DAYS" -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "✅ Deleted $DELETED_COUNT old backup(s)"
else
    log "No old backups to delete"
fi

# List current backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Current backup count: $BACKUP_COUNT (Total size: $TOTAL_SIZE)"

# Optional: Upload to S3 or cloud storage
if [ -n "$S3_BUCKET" ]; then
    log "Uploading backup to S3: $S3_BUCKET"
    if command -v aws &> /dev/null; then
        if aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$S3_BUCKET/backups/postgres/" --storage-class GLACIER; then
            log "✅ Backup uploaded to S3"
        else
            warning "⚠️  S3 upload failed (backup still saved locally)"
        fi
    else
        warning "⚠️  AWS CLI not found, skipping S3 upload"
    fi
fi

log "✅ Backup completed successfully!"
log "================================================"

exit 0

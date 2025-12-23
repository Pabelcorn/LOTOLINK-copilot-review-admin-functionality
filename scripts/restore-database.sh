#!/bin/bash

###############################################################################
# Database Restore Script for LOTOLINK
# This script restores a PostgreSQL backup
###############################################################################

set -e  # Exit on error

# Configuration
DATABASE_HOST="${DATABASE_HOST:-localhost}"
DATABASE_PORT="${DATABASE_PORT:-5432}"
DATABASE_USER="${DATABASE_USER:-lotolink}"
DATABASE_NAME="${DATABASE_NAME:-lotolink_db}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/lotolink/postgres}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Usage function
usage() {
    echo "Usage: $0 [BACKUP_FILE]"
    echo ""
    echo "Restore a PostgreSQL backup for LOTOLINK database"
    echo ""
    echo "Arguments:"
    echo "  BACKUP_FILE    Path to the backup file (*.sql.gz or *.sql)"
    echo "                 If not provided, uses the latest backup"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Restore latest backup"
    echo "  $0 /path/to/backup_20251219_120000.sql.gz"
    echo ""
    exit 1
}

# Determine backup file
if [ -z "$1" ]; then
    BACKUP_FILE="$BACKUP_DIR/latest.sql.gz"
    if [ ! -f "$BACKUP_FILE" ]; then
        error "No backup file specified and latest backup not found"
        error "Available backups:"
        ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "  (none)"
        exit 1
    fi
    log "Using latest backup: $BACKUP_FILE"
else
    BACKUP_FILE="$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

# Confirm restore operation
warning "⚠️  WARNING: This will DROP and RECREATE the database!"
warning "Database: $DATABASE_NAME@$DATABASE_HOST:$DATABASE_PORT"
warning "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled by user"
    exit 0
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

log "Starting database restore..."

# Drop existing connections
log "Terminating existing connections..."
PGPASSWORD="$DATABASE_PASSWORD" psql \
    -h "$DATABASE_HOST" \
    -p "$DATABASE_PORT" \
    -U "$DATABASE_USER" \
    -d postgres \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DATABASE_NAME' AND pid <> pg_backend_pid();" \
    2>/dev/null || warning "Could not terminate connections (database may not exist yet)"

# Drop and recreate database
log "Dropping database if exists..."
PGPASSWORD="$DATABASE_PASSWORD" psql \
    -h "$DATABASE_HOST" \
    -p "$DATABASE_PORT" \
    -U "$DATABASE_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DATABASE_NAME;"

log "Creating new database..."
PGPASSWORD="$DATABASE_PASSWORD" psql \
    -h "$DATABASE_HOST" \
    -p "$DATABASE_PORT" \
    -U "$DATABASE_USER" \
    -d postgres \
    -c "CREATE DATABASE $DATABASE_NAME;"

# Restore backup
log "Restoring backup..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed backup
    if gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DATABASE_PASSWORD" psql \
        -h "$DATABASE_HOST" \
        -p "$DATABASE_PORT" \
        -U "$DATABASE_USER" \
        -d "$DATABASE_NAME" \
        -q; then
        log "✅ Backup restored successfully!"
    else
        error "❌ Restore failed!"
        exit 1
    fi
else
    # Uncompressed backup
    if PGPASSWORD="$DATABASE_PASSWORD" psql \
        -h "$DATABASE_HOST" \
        -p "$DATABASE_PORT" \
        -U "$DATABASE_USER" \
        -d "$DATABASE_NAME" \
        -f "$BACKUP_FILE" \
        -q; then
        log "✅ Backup restored successfully!"
    else
        error "❌ Restore failed!"
        exit 1
    fi
fi

# Verify restore
log "Verifying restore..."
TABLE_COUNT=$(PGPASSWORD="$DATABASE_PASSWORD" psql \
    -h "$DATABASE_HOST" \
    -p "$DATABASE_PORT" \
    -U "$DATABASE_USER" \
    -d "$DATABASE_NAME" \
    -t \
    -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" \
    | tr -d ' ')

log "✅ Database restored with $TABLE_COUNT tables"
log "================================================"

exit 0

#!/bin/bash

# Database Backup Script for Fraternity Base
# This script creates regular backups of the SQLite database

set -e  # Exit on any error

# Configuration
DB_PATH="/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/fraternity-base.db"
BACKUP_DIR="/Users/jacksonfitzgerald/CollegeOrgNetwork/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/fraternity-base_$TIMESTAMP.db"
LOG_FILE="$BACKUP_DIR/backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_message "Starting database backup..."

# Check if source database exists
if [ ! -f "$DB_PATH" ]; then
    log_message "ERROR: Source database not found at $DB_PATH"
    exit 1
fi

# Create backup using SQLite backup command
sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"

if [ $? -eq 0 ]; then
    log_message "SUCCESS: Database backed up to $BACKUP_FILE"

    # Get file size for verification
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_message "Backup file size: $SIZE"

    # Verify backup integrity
    sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" > /dev/null
    if [ $? -eq 0 ]; then
        log_message "SUCCESS: Backup integrity verified"
    else
        log_message "ERROR: Backup integrity check failed"
        exit 1
    fi
else
    log_message "ERROR: Database backup failed"
    exit 1
fi

# Clean up old backups (keep last 30 days)
log_message "Cleaning up old backups..."
find "$BACKUP_DIR" -name "fraternity-base_*.db" -mtime +30 -delete
REMAINING=$(find "$BACKUP_DIR" -name "fraternity-base_*.db" | wc -l)
log_message "Cleanup complete. $REMAINING backup files remaining."

# Compress older backups (older than 7 days)
find "$BACKUP_DIR" -name "fraternity-base_*.db" -mtime +7 ! -name "*.gz" -exec gzip {} \;

log_message "Database backup completed successfully"

# Optional: Send notification email on failure
# Uncomment the following lines if you want email notifications
# if [ $? -ne 0 ]; then
#     python3 /Users/jacksonfitzgerald/Documents/Bankroll/email_notify.py "🚨 Database Backup Failed" "The database backup for Fraternity Base failed at $(date). Please check the logs at $LOG_FILE"
# fi
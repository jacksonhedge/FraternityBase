#!/bin/bash

# Setup Cron Jobs for Fraternity Base Production
# This script configures automated backup and monitoring

set -e

PROJECT_PATH="/Users/jacksonfitzgerald/CollegeOrgNetwork/backend"
BACKUP_SCRIPT="$PROJECT_PATH/scripts/backup-database.sh"
HEALTH_CHECK_SCRIPT="$PROJECT_PATH/scripts/health-check.js"

echo "Setting up cron jobs for Fraternity Base..."

# Create temporary crontab file
TEMP_CRON=$(mktemp)

# Get existing crontab (if any)
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Remove existing Fraternity Base entries
sed -i '' '/# Fraternity Base/d' "$TEMP_CRON" 2>/dev/null || true
sed -i '' '/backup-database.sh/d' "$TEMP_CRON" 2>/dev/null || true
sed -i '' '/health-check.js/d' "$TEMP_CRON" 2>/dev/null || true

# Add new cron jobs
cat >> "$TEMP_CRON" << EOF

# Fraternity Base Production Jobs
# Backup database every 6 hours
0 */6 * * * $BACKUP_SCRIPT >> $PROJECT_PATH/logs/backup-cron.log 2>&1

# Health check every 5 minutes
*/5 * * * * /usr/bin/node $HEALTH_CHECK_SCRIPT >> $PROJECT_PATH/logs/health-cron.log 2>&1

# Daily backup at 2 AM
0 2 * * * $BACKUP_SCRIPT >> $PROJECT_PATH/logs/backup-cron.log 2>&1

EOF

# Install the new crontab
crontab "$TEMP_CRON"

# Clean up
rm "$TEMP_CRON"

echo "Cron jobs installed successfully!"
echo
echo "Scheduled jobs:"
echo "- Database backup: Every 6 hours + daily at 2 AM"
echo "- Health check: Every 5 minutes"
echo
echo "View logs:"
echo "- Backup logs: $PROJECT_PATH/logs/backup-cron.log"
echo "- Health check logs: $PROJECT_PATH/logs/health-cron.log"
echo
echo "To view current crontab: crontab -l"
echo "To remove cron jobs: crontab -r"
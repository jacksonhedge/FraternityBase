#!/bin/bash

# Fraternity Base - Start Brand Research Bot
# This script starts the brand researcher in the background

echo "🚀 Starting Fraternity Base Brand Research Bot..."

# Check if already running
if pgrep -f "brand_researcher.py" > /dev/null; then
    echo "⚠️  Brand researcher is already running!"
    echo "To stop it, run: ./stop_brand_research.sh"
    exit 1
fi

# Start the researcher in background
cd /Users/jacksonfitzgerald/CollegeOrgNetwork
nohup python3 scripts/brand_researcher.py > logs/brand_researcher.log 2>&1 &

# Get the process ID
PID=$!
echo $PID > /tmp/brand_researcher.pid

echo "✅ Brand Research Bot started with PID: $PID"
echo "📝 Logs: ~/CollegeOrgNetwork/logs/brand_researcher.log"
echo "📍 Updating: ~/CollegeOrgNetwork/BRAND_PROSPECTS.md"
echo ""
echo "To stop the bot, run: ./scripts/stop_brand_research.sh"
echo "To check status, run: tail -f logs/brand_researcher.log"
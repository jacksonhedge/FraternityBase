#!/bin/bash

# Stop the Brand Research Bot

echo "🛑 Stopping Brand Research Bot..."

# Check if PID file exists
if [ -f /tmp/brand_researcher.pid ]; then
    PID=$(cat /tmp/brand_researcher.pid)

    # Check if process is still running
    if ps -p $PID > /dev/null; then
        kill $PID
        echo "✅ Brand Research Bot (PID: $PID) stopped"
        rm /tmp/brand_researcher.pid
    else
        echo "⚠️  Process not found. Cleaning up PID file..."
        rm /tmp/brand_researcher.pid
    fi
else
    # Try to find and kill by process name
    if pgrep -f "brand_researcher.py" > /dev/null; then
        pkill -f "brand_researcher.py"
        echo "✅ Brand Research Bot stopped"
    else
        echo "ℹ️  Brand Research Bot is not running"
    fi
fi
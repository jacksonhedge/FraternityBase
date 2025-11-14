#!/bin/bash
#
# Update Travel Map Members Script
#
# This script combines importing member data and exporting to the travel map JSON.
# It's a convenient wrapper around the import and export Python scripts.
#
# Usage:
#   ./scripts/update_travel_map_members.sh <csv_file> <chapter_name>
#
# Example:
#   ./scripts/update_travel_map_members.sh data/rutgers_roster.csv "Rutgers University Sigma Chi"
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  FraternityBase Travel Map Update Tool   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check arguments
if [ "$#" -lt 1 ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 <csv_file> <chapter_name>  - Import CSV and update travel map"
    echo "  $0 --export-only               - Only export existing database to travel map"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 data/rutgers.csv \"Rutgers University Sigma Chi\""
    echo "  $0 --export-only"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${RED}❌ Error: .env file not found in project root${NC}"
    echo "Please create a .env file with the following variables:"
    echo "  DB_HOST=your-supabase-host"
    echo "  DB_NAME=postgres"
    echo "  DB_USER=postgres"
    echo "  DB_PASSWORD=your-password"
    echo "  DB_PORT=5432"
    echo "  ROSTER_ENCRYPTION_KEY=your-encryption-key"
    exit 1
fi

# Export-only mode
if [ "$1" == "--export-only" ]; then
    echo -e "${BLUE}📤 Export-only mode: Exporting database to travel map JSON...${NC}"
    echo ""

    cd "$PROJECT_ROOT"
    python3 scripts/export_travel_map_data.py

    echo ""
    echo -e "${GREEN}✅ Travel map data exported successfully!${NC}"
    echo -e "${YELLOW}ℹ️  Refresh your browser to see the updated travel map${NC}"
    exit 0
fi

# Full import + export mode
CSV_FILE="$1"
CHAPTER_NAME="$2"

# Check if CSV file exists
if [ ! -f "$CSV_FILE" ]; then
    echo -e "${RED}❌ Error: CSV file not found: $CSV_FILE${NC}"
    exit 1
fi

if [ -z "$CHAPTER_NAME" ]; then
    echo -e "${RED}❌ Error: Chapter name is required${NC}"
    echo "Example: \"Rutgers University Sigma Chi\""
    exit 1
fi

echo -e "${BLUE}📥 Step 1: Importing member data...${NC}"
echo "  CSV File: $CSV_FILE"
echo "  Chapter: $CHAPTER_NAME"
echo ""

cd "$PROJECT_ROOT"

# Run import script
python3 scripts/import_sigma_chi_roster.py "$CSV_FILE" "$CHAPTER_NAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Import failed! Check the error messages above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Import complete!${NC}"
echo ""

# Run export script
echo -e "${BLUE}📤 Step 2: Exporting to travel map JSON...${NC}"
echo ""

python3 scripts/export_travel_map_data.py

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Export failed! Check the error messages above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ All Done! Success!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}ℹ️  Next steps:${NC}"
echo "  1. The member data has been imported to the database"
echo "  2. The travel map JSON has been updated"
echo "  3. Refresh your browser to see the new members on the map"
echo ""
echo -e "${BLUE}📊 View logs:${NC}"
echo "  Import log: roster_import.log"
echo "  Export log: export_travel_map.log"
echo ""

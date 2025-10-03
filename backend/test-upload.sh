#!/bin/bash

# Test script for uploading Florida State roster CSV

CHAPTER_ID="$1"
CSV_PATH="/Users/jacksonfitzgerald/Downloads/epsilon_zeta_florida_state_roster_reformatted.csv"

if [ -z "$CHAPTER_ID" ]; then
  echo "Usage: ./test-upload.sh <chapter-id>"
  echo ""
  echo "First, find the Florida State chapter ID by visiting:"
  echo "http://localhost:3001/api/admin/chapters"
  exit 1
fi

echo "📁 Uploading roster for chapter: $CHAPTER_ID"
echo ""

curl -X POST "http://localhost:3001/api/admin/chapters/$CHAPTER_ID/upload-roster" \
  -H "x-admin-token: sk_admin_fra7ernity_b4se_sec2ret_92fj39" \
  -F "csv=@$CSV_PATH" \
  | jq '.'

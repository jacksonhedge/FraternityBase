#!/bin/bash

# This script will be used to coordinate multiple SQL queries
# Since we can't fetch all 3939 rows at once, we'll do it in batches

OUTPUT_FILE="/Users/jacksonfitzgerald/CollegeOrgNetwork/sorority_instagram_handles.csv"

# Write header
echo "College,Sorority Name,Instagram Handle" > "$OUTPUT_FILE"

echo "Starting batch export of sorority chapters..."
echo "This will take a few minutes for 3,939 rows..."

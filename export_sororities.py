#!/usr/bin/env python3
import os
from supabase import create_client
import csv

# Supabase credentials
SUPABASE_URL = "https://vvsawtexgpopqxgaqyxg.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_KEY environment variable not set")
    print("Please set it with: export SUPABASE_KEY='your-key-here'")
    exit(1)

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Fetching sorority chapters from database...")

# Fetch all sorority chapters in batches
all_chapters = []
batch_size = 1000
offset = 0

while True:
    # Query chapters with sorority organization type
    response = supabase.table('chapters') \
        .select('universities(name), greek_organizations(name, organization_type), instagram_handle') \
        .eq('greek_organizations.organization_type', 'sorority') \
        .range(offset, offset + batch_size - 1) \
        .order('universities.name') \
        .execute()

    if not response.data:
        break

    all_chapters.extend(response.data)
    print(f"Fetched {len(all_chapters)} chapters so far...")

    if len(response.data) < batch_size:
        break

    offset += batch_size

print(f"\nTotal sorority chapters fetched: {len(all_chapters)}")

# Write to CSV
output_file = '/Users/jacksonfitzgerald/CollegeOrgNetwork/sorority_instagram_handles.csv'

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['College', 'Sorority Name', 'Instagram Handle'])

    for chapter in all_chapters:
        college_name = chapter.get('universities', {}).get('name', '') if chapter.get('universities') else ''
        sorority_name = chapter.get('greek_organizations', {}).get('name', '') if chapter.get('greek_organizations') else ''
        instagram_handle = chapter.get('instagram_handle', '') or ''

        writer.writerow([college_name, sorority_name, instagram_handle])

print(f"\n✅ CSV file created: {output_file}")
print(f"Total rows: {len(all_chapters)}")

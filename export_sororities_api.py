#!/usr/bin/env python3
import requests
import csv
import json

SUPABASE_URL = "https://vvsawtexgpopqxgaqyxg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2c2F3dGV4Z3BvcHF4Z2FxeXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE4MDAwMiwiZXhwIjoyMDc0NzU2MDAyfQ.hk5UvQAQ7TLlATqUgr6rW9BNI3P-WXQZCx4cJJb_1u4"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

print("Fetching all sorority chapters...")

all_chapters = []
limit = 1000
offset = 0

while True:
    # Fetch chapters with joins
    url = f"{SUPABASE_URL}/rest/v1/chapters"
    params = {
        "select": "universities(name),greek_organizations(name,organization_type),instagram_handle",
        "greek_organizations.organization_type": "eq.sorority",
        "order": "universities(name)",
        "limit": limit,
        "offset": offset
    }

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.text)
        break

    data = response.json()

    if not data:
        break

    all_chapters.extend(data)
    print(f"Fetched {len(all_chapters)} chapters so far...")

    if len(data) < limit:
        break

    offset += limit

print(f"\nTotal sorority chapters: {len(all_chapters)}")

# Write to CSV
output_file = '/Users/jacksonfitzgerald/CollegeOrgNetwork/sorority_instagram_handles.csv'

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['College', 'Sorority Name', 'Instagram Handle'])

    for chapter in all_chapters:
        college = chapter.get('universities', {}).get('name', '') if chapter.get('universities') else ''
        sorority = chapter.get('greek_organizations', {}).get('name', '') if chapter.get('greek_organizations') else ''
        instagram = chapter.get('instagram_handle', '') or ''

        writer.writerow([college, sorority, instagram])

print(f"\n✅ CSV file created: {output_file}")
print(f"Total rows: {len(all_chapters)}")

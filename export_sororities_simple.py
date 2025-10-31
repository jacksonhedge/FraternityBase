#!/usr/bin/env python3
import psycopg2
import csv
import os

# Database connection string for Supabase
DB_HOST = "aws-0-us-east-1.pooler.supabase.com"
DB_NAME = "postgres"
DB_USER = "postgres.vvsawtexgpopqxgaqyxg"
DB_PORT = "6543"
DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")

if not DB_PASSWORD:
    print("ERROR: SUPABASE_DB_PASSWORD environment variable not set")
    exit(1)

print("Connecting to database...")

# Connect to database
conn = psycopg2.connect(
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    port=DB_PORT
)

cursor = conn.cursor()

print("Fetching sorority chapters...")

# Query all sorority chapters
query = """
SELECT
  u.name as college_name,
  go.name as sorority_name,
  COALESCE(c.instagram_handle, '') as instagram_handle
FROM chapters c
JOIN universities u ON c.university_id = u.id
JOIN greek_organizations go ON c.greek_organization_id = go.id
WHERE go.organization_type = 'sorority'
ORDER BY u.name, go.name;
"""

cursor.execute(query)
rows = cursor.fetchall()

print(f"Fetched {len(rows)} sorority chapters")

# Write to CSV
output_file = '/Users/jacksonfitzgerald/CollegeOrgNetwork/sorority_instagram_handles.csv'

with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['College', 'Sorority Name', 'Instagram Handle'])
    writer.writerows(rows)

cursor.close()
conn.close()

print(f"\n✅ CSV file created: {output_file}")
print(f"Total rows: {len(rows)}")

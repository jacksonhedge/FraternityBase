#!/usr/bin/env python3
"""
Geocode Sigma Chi Chapters
Adds latitude/longitude coordinates to all 240 Sigma Chi chapters
"""

import csv
import json
import time
from typing import Dict, Optional, List
import requests
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class GeocodeService:
    """Geocodes addresses using free Nominatim API"""

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'FraternityBase/1.0 (contact@fraternitybase.com)'
        })
        self.cache = {}

    def geocode(self, university: str, city: str, state: str, country: str) -> Optional[Dict]:
        """
        Geocodes a university address

        Returns dict with 'lat' and 'lng' or None
        """
        # Check cache first
        cache_key = f"{university}|{city}|{state}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        # Build query
        if country == "United States":
            query = f"{university}, {city}, {state}, USA"
        elif country == "Canada":
            query = f"{university}, {city}, {state}, Canada"
        else:
            query = f"{university}, {city}, {state}, {country}"

        logger.info(f"Geocoding: {query}")

        try:
            response = self.session.get(
                self.base_url,
                params={
                    'q': query,
                    'format': 'json',
                    'limit': 1
                },
                timeout=10
            )
            response.raise_for_status()
            data = response.json()

            if data and len(data) > 0:
                result = {
                    'lat': float(data[0]['lat']),
                    'lng': float(data[0]['lon']),
                    'display_name': data[0]['display_name']
                }
                self.cache[cache_key] = result
                logger.info(f"  ✓ Found: {result['lat']}, {result['lng']}")
                return result
            else:
                logger.warning(f"  ✗ Not found: {query}")
                return None

        except Exception as e:
            logger.error(f"  ✗ Error: {str(e)}")
            return None

        finally:
            # Rate limiting - Nominatim requires 1 request per second
            time.sleep(1.1)


def process_sigma_chi_chapters(input_csv: str, output_json: str, output_sql: str):
    """
    Process all Sigma Chi chapters: geocode them and export to JSON + SQL

    Args:
        input_csv: Path to sigma_chi_chapters.csv
        output_json: Path for JSON output
        output_sql: Path for SQL output
    """
    geocoder = GeocodeService()
    chapters = []
    failed = []

    logger.info("\n" + "="*80)
    logger.info("GEOCODING 240 SIGMA CHI CHAPTERS")
    logger.info("="*80 + "\n")

    # Read CSV
    with open(input_csv, 'r') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    logger.info(f"Processing {len(rows)} chapters...\n")

    for i, row in enumerate(rows, 1):
        chapter_name = row['chapter_name']
        university = row['university']
        city = row['city']
        state = row['state_province']
        country = row['country']
        region = row['region']

        logger.info(f"[{i}/{len(rows)}] {chapter_name} - {university}")

        # Geocode
        coords = geocoder.geocode(university, city, state, country)

        if coords:
            chapter = {
                'chapter_name': chapter_name,
                'fraternity': 'Sigma Chi',
                'university': university,
                'city': city,
                'state': state,
                'country': country,
                'region': region,
                'latitude': coords['lat'],
                'longitude': coords['lng'],
                'full_address': coords['display_name'],
                'members': None,  # To be filled in later
                'founded_year': None,
                'instagram': None,
                'website': None
            }
            chapters.append(chapter)
        else:
            failed.append({
                'chapter_name': chapter_name,
                'university': university,
                'city': city,
                'state': state
            })

    # Export to JSON
    logger.info("\n" + "="*80)
    logger.info("EXPORTING RESULTS")
    logger.info("="*80)

    with open(output_json, 'w') as f:
        json.dump({
            'total_chapters': len(chapters),
            'successful': len(chapters),
            'failed': len(failed),
            'chapters': chapters,
            'failed_geocodes': failed
        }, f, indent=2)

    logger.info(f"✓ Saved JSON: {output_json}")

    # Export to SQL
    generate_sql_insert(chapters, output_sql)
    logger.info(f"✓ Saved SQL: {output_sql}")

    # Print summary
    logger.info("\n" + "="*80)
    logger.info("SUMMARY")
    logger.info("="*80)
    logger.info(f"Total chapters: {len(rows)}")
    logger.info(f"Successfully geocoded: {len(chapters)}")
    logger.info(f"Failed to geocode: {len(failed)}")

    if failed:
        logger.info(f"\nFailed chapters:")
        for ch in failed[:10]:  # Show first 10
            logger.info(f"  - {ch['chapter_name']} at {ch['university']}")
        if len(failed) > 10:
            logger.info(f"  ... and {len(failed) - 10} more")

    logger.info("="*80 + "\n")


def generate_sql_insert(chapters: List[Dict], output_file: str):
    """Generate SQL INSERT statements"""
    with open(output_file, 'w') as f:
        f.write("-- Sigma Chi Chapter Import\n")
        f.write("-- 240 Chapters with Geocoded Coordinates\n\n")

        # Insert fraternity
        f.write("-- Insert Sigma Chi Fraternity\n")
        f.write("INSERT INTO fraternity_data.fraternities (name, founding_year, headquarters)\n")
        f.write("VALUES ('Sigma Chi', 1855, 'Evanston, IL')\n")
        f.write("ON CONFLICT (name) DO NOTHING;\n\n")

        # Get fraternity_id
        f.write("DO $$\n")
        f.write("DECLARE\n")
        f.write("    v_fraternity_id UUID;\n")
        f.write("BEGIN\n")
        f.write("    SELECT id INTO v_fraternity_id FROM fraternity_data.fraternities WHERE name = 'Sigma Chi';\n\n")

        # Insert chapters
        f.write("    -- Insert Chapters\n")
        for chapter in chapters:
            chapter_name = chapter['chapter_name'].replace("'", "''")
            university = chapter['university'].replace("'", "''")
            city = chapter['city'].replace("'", "''")
            state = chapter['state'].replace("'", "''")
            country = chapter['country'].replace("'", "''")
            region = chapter['region'].replace("'", "''")

            f.write(f"    INSERT INTO fraternity_data.chapters (\n")
            f.write(f"        fraternity_id, chapter_name, university, city, state, country, region,\n")
            f.write(f"        latitude, longitude, status\n")
            f.write(f"    ) VALUES (\n")
            f.write(f"        v_fraternity_id,\n")
            f.write(f"        '{chapter_name}',\n")
            f.write(f"        '{university}',\n")
            f.write(f"        '{city}',\n")
            f.write(f"        '{state}',\n")
            f.write(f"        '{country}',\n")
            f.write(f"        '{region}',\n")
            f.write(f"        {chapter['latitude']},\n")
            f.write(f"        {chapter['longitude']},\n")
            f.write(f"        'active'\n")
            f.write(f"    ) ON CONFLICT DO NOTHING;\n\n")

        f.write("END $$;\n")


def main():
    """Run the geocoding process"""
    input_csv = '../data/sigma_chi_chapters.csv'
    output_json = '../data/sigma_chi_geocoded.json'
    output_sql = '../data/sigma_chi_import.sql'

    logger.info("\n🎯 Sigma Chi Chapter Geocoding")
    logger.info("This will take ~5 minutes (1 request per second rate limit)\n")

    try:
        process_sigma_chi_chapters(input_csv, output_json, output_sql)
        logger.info("\n✅ SUCCESS! All chapters geocoded and exported.")
        logger.info(f"\nNext steps:")
        logger.info(f"1. Review the JSON file: {output_json}")
        logger.info(f"2. Import to database: psql < {output_sql}")
        logger.info(f"3. Verify data in your Supabase dashboard\n")

    except KeyboardInterrupt:
        logger.info("\n\n⚠️  Interrupted by user. Partial data may be saved.")
    except Exception as e:
        logger.error(f"\n\n❌ Error: {str(e)}")
        raise


if __name__ == '__main__':
    main()
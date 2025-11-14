#!/usr/bin/env python3
"""
Export Travel Map Data Script

Exports member data from the Supabase PostgreSQL database to the travel map JSON file.
This script decrypts member PII and formats it for the frontend travel map visualization.

Usage:
    python scripts/export_travel_map_data.py

Output:
    frontend/src/data/travelMapData.json
"""

import json
import os
import sys
from typing import Dict, List
import psycopg2
from psycopg2.extras import RealDictCursor
from cryptography.fernet import Fernet
from datetime import datetime
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('export_travel_map.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TravelMapExporter:
    """Exports encrypted member data to travel map JSON format"""

    def __init__(self, db_config: Dict, encryption_key: str):
        self.db_config = db_config
        self.conn = None
        self.encryption_key = encryption_key

        if not self.encryption_key:
            raise ValueError("Encryption key must be provided or set in ROSTER_ENCRYPTION_KEY env var")

        # Initialize Fernet encryption
        self.cipher_suite = Fernet(self.encryption_key.encode() if isinstance(self.encryption_key, str) else self.encryption_key)

    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config, cursor_factory=RealDictCursor)
            logger.info("✅ Database connection established")
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            raise

    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def decrypt_field(self, encrypted_bytes) -> str:
        """Decrypt a bytes field"""
        if not encrypted_bytes:
            return None
        try:
            return self.cipher_suite.decrypt(bytes(encrypted_bytes)).decode()
        except Exception as e:
            logger.warning(f"Failed to decrypt field: {e}")
            return None

    def calculate_age(self, birthday_str: str) -> int:
        """Calculate age from birthday string"""
        if not birthday_str:
            return None

        try:
            # Try common date formats
            for fmt in ['%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y']:
                try:
                    birth_date = datetime.strptime(birthday_str, fmt)
                    today = datetime.today()
                    age = today.year - birth_date.year
                    if (today.month, today.day) < (birth_date.month, birth_date.day):
                        age -= 1
                    return age
                except ValueError:
                    continue
        except Exception as e:
            logger.warning(f"Could not calculate age from {birthday_str}: {e}")

        return None

    def is_birthday_today(self, birthday_str: str) -> bool:
        """Check if today is the person's birthday"""
        if not birthday_str:
            return False

        try:
            for fmt in ['%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y']:
                try:
                    birth_date = datetime.strptime(birthday_str, fmt)
                    today = datetime.today()
                    return (today.month == birth_date.month) and (today.day == birth_date.day)
                except ValueError:
                    continue
        except Exception:
            pass

        return False

    def export_to_json(self, output_path: str):
        """Export member data to JSON file for travel map"""
        logger.info("🗺️  Starting travel map data export...")

        cursor = self.conn.cursor()

        # Query members with chapter and university data
        query = """
            SELECT
                m.id,
                m.first_name_encrypted,
                m.last_name_encrypted,
                m.birthday_encrypted,
                m.city_encrypted,
                m.state,
                m.alt_city_encrypted,
                m.alt_state,
                m.member_type,
                m.status,
                m.graduation_year,
                c.chapter_name,
                c.id as chapter_id,
                u.name as university_name,
                u.state as university_state,
                u.city as university_city,
                u.latitude as university_lat,
                u.longitude as university_lng
            FROM encrypted_pii.members m
            LEFT JOIN fraternity_data.chapters c ON m.chapter_id = c.id
            LEFT JOIN fraternity_data.universities u ON c.university_id = u.id
            WHERE m.status IN ('Active', 'Alumni')
            ORDER BY c.chapter_name, m.last_name_encrypted
        """

        cursor.execute(query)
        members = cursor.fetchall()

        logger.info(f"📊 Found {len(members)} members to export")

        # Track statistics
        stats = {
            'total': len(members),
            'exported': 0,
            'skipped': 0,
            'errors': 0
        }

        formatted_members = []
        routes = []
        universities_set = set()

        for idx, member in enumerate(members):
            try:
                # Skip members without chapter data
                if not member['chapter_id'] or not member['university_name']:
                    stats['skipped'] += 1
                    continue

                # Decrypt fields
                first_name = self.decrypt_field(member['first_name_encrypted']) or 'Unknown'
                last_name = self.decrypt_field(member['last_name_encrypted']) or 'Unknown'
                birthday_str = self.decrypt_field(member['birthday_encrypted'])
                home_city = self.decrypt_field(member['city_encrypted']) or 'Unknown'

                # Calculate age and birthday
                age = self.calculate_age(birthday_str)
                birthday_today = self.is_birthday_today(birthday_str)

                # Determine locations based on member type
                is_alumni = member['member_type'] == 'Alumni'

                # Home location (where they're from)
                home_state = member['state'] or 'Unknown'

                # Current location (where they are now)
                if is_alumni:
                    # For alumni: current location is their career location (alt_state if available)
                    current_state = member['alt_state'] or home_state
                    current_name = member['university_name']  # Or could be company/city
                    current_lat = member['university_lat'] or 0
                    current_lng = member['university_lng'] or 0
                else:
                    # For undergrads: current location is their university
                    current_state = member['university_state']
                    current_name = member['university_name']
                    current_lat = member['university_lat'] or 0
                    current_lng = member['university_lng'] or 0

                # Format member data
                formatted_member = {
                    'id': idx,
                    'first_name': first_name,
                    'last_name': last_name,
                    'chapter': member['chapter_name'] or 'Unknown',
                    'age': age,
                    'birthday': birthday_str,
                    'birthday_today': birthday_today,
                    'current_location': {
                        'name': current_name,
                        'state': current_state,
                        'lat': current_lat,
                        'lng': current_lng
                    },
                    'home_location': {
                        'city': home_city,
                        'state': home_state,
                        'lat': 0,  # TODO: Geocode cities for exact coordinates
                        'lng': 0
                    }
                }

                formatted_members.append(formatted_member)

                # Create route (home -> college for undergrads, college -> career for alumni)
                route = {
                    'member_id': idx,
                    'from_lat': 0 if is_alumni else 0,  # Home lat for undergrads
                    'from_lng': 0 if is_alumni else 0,  # Home lng for undergrads
                    'from_state': member['university_state'] if is_alumni else home_state,
                    'to_lat': current_lat,
                    'to_lng': current_lng,
                    'to_state': current_state,
                    'age': age
                }

                routes.append(route)

                # Track universities
                if member['university_name']:
                    universities_set.add((
                        member['university_name'],
                        member['university_state'],
                        member['university_lat'] or 0,
                        member['university_lng'] or 0
                    ))

                stats['exported'] += 1

            except Exception as e:
                logger.error(f"Error processing member {member.get('id', 'unknown')}: {e}")
                stats['errors'] += 1
                continue

        # Format universities
        universities = [
            {
                'name': name,
                'state': state,
                'lat': lat,
                'lng': lng
            }
            for name, state, lat, lng in universities_set
        ]

        # Create final output
        output_data = {
            'members': formatted_members,
            'routes': routes,
            'universities': universities
        }

        # Write to JSON file
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✅ Export complete!")
        logger.info(f"📄 Output file: {output_path}")
        logger.info(f"📊 Statistics:")
        logger.info(f"   Total members queried: {stats['total']}")
        logger.info(f"   Successfully exported: {stats['exported']}")
        logger.info(f"   Skipped (no chapter): {stats['skipped']}")
        logger.info(f"   Errors: {stats['errors']}")
        logger.info(f"   Total routes: {len(routes)}")
        logger.info(f"   Total universities: {len(universities)}")


def main():
    """Main entry point"""
    load_dotenv()

    # Database configuration
    db_config = {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': os.environ.get('DB_PORT', 5432),
        'database': os.environ.get('DB_NAME', 'fraternitybase'),
        'user': os.environ.get('DB_USER', 'postgres'),
        'password': os.environ.get('DB_PASSWORD')
    }

    encryption_key = os.environ.get('ROSTER_ENCRYPTION_KEY')

    if not encryption_key:
        logger.error("❌ ROSTER_ENCRYPTION_KEY environment variable not set")
        sys.exit(1)

    # Output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_path = os.path.join(project_root, 'frontend', 'src', 'data', 'travelMapData.json')

    logger.info(f"🎯 Exporting travel map data to: {output_path}")

    # Initialize exporter
    exporter = TravelMapExporter(db_config, encryption_key)

    try:
        exporter.connect()
        exporter.export_to_json(output_path)
    except Exception as e:
        logger.error(f"❌ Export failed: {e}")
        sys.exit(1)
    finally:
        exporter.disconnect()


if __name__ == "__main__":
    main()

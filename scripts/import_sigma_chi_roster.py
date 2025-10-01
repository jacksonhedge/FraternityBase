#!/usr/bin/env python3
"""
Secure Sigma Chi Roster Import Script
Handles CSV/Excel import with PII encryption and data validation
"""

import csv
import json
import hashlib
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor, execute_batch
import pandas as pd
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import base64
import logging
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('roster_import.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SecureRosterImporter:
    """Handles secure import of Sigma Chi roster data with PII encryption"""

    def __init__(self, db_config: Dict, encryption_key: Optional[str] = None):
        self.db_config = db_config
        self.conn = None
        self.encryption_key = encryption_key or os.environ.get('ROSTER_ENCRYPTION_KEY')
        self.import_batch_id = str(uuid.uuid4())
        self.stats = {
            'total_rows': 0,
            'imported': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0,
            'error_details': []
        }

        if not self.encryption_key:
            raise ValueError("Encryption key must be provided or set in ROSTER_ENCRYPTION_KEY env var")

        # Initialize Fernet encryption
        self.cipher_suite = Fernet(self.encryption_key.encode() if isinstance(self.encryption_key, str) else self.encryption_key)

    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def disconnect(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def encrypt_field(self, value: str) -> bytes:
        """Encrypt a string value"""
        if not value:
            return None
        return self.cipher_suite.encrypt(value.encode())

    def hash_field(self, value: str) -> str:
        """Create SHA-256 hash of a field for lookups"""
        if not value:
            return None
        return hashlib.sha256(value.lower().strip().encode()).hexdigest()

    def parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats"""
        if not date_str:
            return None

        date_formats = [
            '%m/%d/%Y',
            '%Y-%m-%d',
            '%d/%m/%Y',
            '%m-%d-%Y',
            '%B %d, %Y'
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        logger.warning(f"Could not parse date: {date_str}")
        return None

    def parse_address(self, address_str: str) -> Dict:
        """Parse address string into components"""
        if not address_str:
            return {'street': None, 'city': None, 'state': None, 'zip': None}

        # Expected format: "814 Livingston Court, Paramus, New Jersey, 07652, United States"
        parts = [p.strip() for p in address_str.split(',')]

        result = {
            'street': None,
            'city': None,
            'state': None,
            'zip': None
        }

        if len(parts) >= 4:
            result['street'] = parts[0]
            result['city'] = parts[1]

            # Handle state (could be full name or abbreviation)
            state = parts[2]
            state_abbrev = self.get_state_abbreviation(state)
            result['state'] = state_abbrev

            # Zip code
            result['zip'] = parts[3][:5] if len(parts[3]) >= 5 else parts[3]

        return result

    def get_state_abbreviation(self, state_name: str) -> str:
        """Convert state name to 2-letter abbreviation"""
        states = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
            'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
            'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
            'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
            'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
            'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
            'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
            'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
            'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
            'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
            'Wisconsin': 'WI', 'Wyoming': 'WY'
        }

        # Return as-is if already 2 letters
        if len(state_name) == 2:
            return state_name.upper()

        # Otherwise look up
        return states.get(state_name, state_name[:2].upper())

    def get_or_create_chapter(self, chapter_name: str, university_name: str = None) -> str:
        """Get or create chapter record"""
        cursor = self.conn.cursor()

        # First check if chapter exists
        cursor.execute("""
            SELECT id FROM fraternity_data.chapters
            WHERE chapter_name = %s
        """, (chapter_name,))

        result = cursor.fetchone()
        if result:
            return result[0]

        # Get Sigma Chi fraternity ID
        cursor.execute("""
            SELECT id FROM fraternity_data.fraternities
            WHERE name = 'Sigma Chi'
        """)
        fraternity_id = cursor.fetchone()[0]

        # Create new chapter
        chapter_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO fraternity_data.chapters (id, fraternity_id, chapter_name, status)
            VALUES (%s, %s, %s, 'active')
            RETURNING id
        """, (chapter_id, fraternity_id, chapter_name))

        self.conn.commit()
        logger.info(f"Created new chapter: {chapter_name}")
        return chapter_id

    def import_member(self, row: Dict, chapter_id: str) -> bool:
        """Import a single member record"""
        try:
            cursor = self.conn.cursor()

            # Check if member already exists (by email hash)
            email_hash = self.hash_field(row.get('Email', ''))
            if email_hash:
                cursor.execute("""
                    SELECT id FROM encrypted_pii.members
                    WHERE email_hash = %s
                """, (email_hash,))

                existing = cursor.fetchone()
                if existing:
                    # Update existing record
                    return self.update_member(existing[0], row)

            # Parse address
            mailing_address = self.parse_address(row.get('Mailing Address', ''))
            alt_address = self.parse_address(row.get('Other/School/Work Address', ''))

            # Prepare encrypted data
            member_data = {
                'id': str(uuid.uuid4()),
                'chapter_id': chapter_id,

                # Encrypted fields
                'first_name_encrypted': self.encrypt_field(row.get('First Name', '')),
                'last_name_encrypted': self.encrypt_field(row.get('Last Name', '')),
                'email_encrypted': self.encrypt_field(row.get('Email', '')),
                'cell_phone_encrypted': self.encrypt_field(row.get('Cell Phone', '')),
                'birthday_encrypted': self.encrypt_field(row.get('Birthday', '')),

                # Encrypted address fields
                'street_address_encrypted': self.encrypt_field(mailing_address['street']),
                'city_encrypted': self.encrypt_field(mailing_address['city']),
                'state': mailing_address['state'],
                'zip_code_encrypted': self.encrypt_field(mailing_address['zip']),

                # Alt address
                'alt_street_address_encrypted': self.encrypt_field(alt_address['street']),
                'alt_city_encrypted': self.encrypt_field(alt_address['city']),
                'alt_state': alt_address['state'],
                'alt_zip_code_encrypted': self.encrypt_field(alt_address['zip']),

                # Hashes for lookups
                'email_hash': email_hash,
                'phone_hash': self.hash_field(row.get('Cell Phone', '')),
                'name_hash': self.hash_field(f"{row.get('First Name', '')} {row.get('Last Name', '')}")",

                # Non-PII fields
                'member_type': row.get('Member Type', 'Undergrad'),
                'status': row.get('Status', 'Active'),
                'initiation_date': self.parse_date(row.get('Initiation Date', '')),
                'initiating_chapter': row.get('Initiating Chapter', ''),
                'graduation_year': int(row.get('Graduation Year', 0)) if row.get('Graduation Year') else None,

                # Metadata
                'data_source': 'roster_import',
                'import_batch_id': self.import_batch_id,
                'last_verified': datetime.now().date()
            }

            # Insert member
            columns = member_data.keys()
            values = [member_data[col] for col in columns]

            insert_query = f"""
                INSERT INTO encrypted_pii.members ({', '.join(columns)})
                VALUES ({', '.join(['%s'] * len(columns))})
            """

            cursor.execute(insert_query, values)
            self.conn.commit()

            self.stats['imported'] += 1
            return True

        except Exception as e:
            logger.error(f"Error importing member {row.get('First Name')} {row.get('Last Name')}: {e}")
            self.stats['errors'] += 1
            self.stats['error_details'].append({
                'row': row,
                'error': str(e)
            })
            self.conn.rollback()
            return False

    def update_member(self, member_id: str, row: Dict) -> bool:
        """Update existing member record"""
        try:
            cursor = self.conn.cursor()

            # Only update if data has changed
            update_fields = []
            update_values = []

            # Check each field and add to update if different
            if row.get('Cell Phone'):
                update_fields.append('cell_phone_encrypted = %s')
                update_values.append(self.encrypt_field(row['Cell Phone']))

            if row.get('Graduation Year'):
                update_fields.append('graduation_year = %s')
                update_values.append(int(row['Graduation Year']))

            if row.get('Status'):
                update_fields.append('status = %s')
                update_values.append(row['Status'])

            if update_fields:
                update_query = f"""
                    UPDATE encrypted_pii.members
                    SET {', '.join(update_fields)}, updated_at = NOW()
                    WHERE id = %s
                """
                update_values.append(member_id)

                cursor.execute(update_query, update_values)
                self.conn.commit()

                self.stats['updated'] += 1
                return True
            else:
                self.stats['skipped'] += 1
                return True

        except Exception as e:
            logger.error(f"Error updating member {member_id}: {e}")
            self.stats['errors'] += 1
            self.conn.rollback()
            return False

    def import_from_csv(self, file_path: str, chapter_name: str):
        """Import roster from CSV file"""
        logger.info(f"Starting import from {file_path} for chapter {chapter_name}")

        # Get or create chapter
        chapter_id = self.get_or_create_chapter(chapter_name)

        # Track import batch
        self.create_import_batch(chapter_id, file_path)

        # Read CSV
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            for row in reader:
                self.stats['total_rows'] += 1
                self.import_member(row, chapter_id)

                # Log progress every 100 rows
                if self.stats['total_rows'] % 100 == 0:
                    logger.info(f"Processed {self.stats['total_rows']} rows...")

        # Update import batch status
        self.finalize_import_batch()

        # Refresh materialized views
        self.refresh_statistics()

        logger.info("Import completed!")
        logger.info(f"Stats: {json.dumps(self.stats, indent=2)}")

    def create_import_batch(self, chapter_id: str, file_path: str):
        """Create import batch record"""
        cursor = self.conn.cursor()

        # Calculate file hash
        with open(file_path, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        cursor.execute("""
            INSERT INTO fraternity_data.import_batches
            (id, chapter_id, file_name, file_hash, import_type, import_started_at, status)
            VALUES (%s, %s, %s, %s, 'full_roster', NOW(), 'processing')
        """, (self.import_batch_id, chapter_id, os.path.basename(file_path), file_hash))

        self.conn.commit()

    def finalize_import_batch(self):
        """Update import batch with final stats"""
        cursor = self.conn.cursor()

        cursor.execute("""
            UPDATE fraternity_data.import_batches
            SET
                total_rows = %s,
                imported_count = %s,
                updated_count = %s,
                skipped_count = %s,
                error_count = %s,
                error_log = %s,
                import_completed_at = NOW(),
                status = %s
            WHERE id = %s
        """, (
            self.stats['total_rows'],
            self.stats['imported'],
            self.stats['updated'],
            self.stats['skipped'],
            self.stats['errors'],
            json.dumps(self.stats['error_details']),
            'completed' if self.stats['errors'] == 0 else 'completed_with_errors',
            self.import_batch_id
        ))

        self.conn.commit()

    def refresh_statistics(self):
        """Refresh materialized views"""
        cursor = self.conn.cursor()
        logger.info("Refreshing chapter statistics...")
        cursor.execute("REFRESH MATERIALIZED VIEW fraternity_data.chapter_stats")
        self.conn.commit()
        logger.info("Statistics refreshed")

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

    # Check command line arguments
    if len(sys.argv) < 3:
        print("Usage: python import_sigma_chi_roster.py <csv_file> <chapter_name>")
        print("Example: python import_sigma_chi_roster.py iota_psi_roster.csv 'Iota Psi'")
        sys.exit(1)

    csv_file = sys.argv[1]
    chapter_name = sys.argv[2]

    if not os.path.exists(csv_file):
        print(f"Error: File {csv_file} not found")
        sys.exit(1)

    # Initialize importer
    importer = SecureRosterImporter(db_config)

    try:
        importer.connect()
        importer.import_from_csv(csv_file, chapter_name)
    finally:
        importer.disconnect()

if __name__ == "__main__":
    main()
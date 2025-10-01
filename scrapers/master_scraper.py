#!/usr/bin/env python3
"""
Master Scraper
Orchestrates college, Instagram, and LinkedIn scrapers to build complete database
"""

import json
import time
from typing import Dict, List
import logging
from datetime import datetime

from college_scraper import CollegeScraper
from instagram_scraper import InstagramScraper
from linkedin_scraper import LinkedInScraper
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'scraper_log_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class MasterScraper:
    """
    Orchestrates all scrapers to build complete Greek life database

    Pipeline:
    1. College Scraper → Get chapter lists
    2. Instagram Scraper → Get follower counts
    3. LinkedIn Scraper → Get member profiles
    4. Export → JSON + SQL for database import
    """

    def __init__(self, proxycurl_api_key: Optional[str] = None):
        self.college_scraper = CollegeScraper()
        self.instagram_scraper = InstagramScraper()
        self.linkedin_scraper = LinkedInScraper(
            use_api=bool(proxycurl_api_key),
            api_key=proxycurl_api_key
        )
        self.results = {
            'colleges': [],
            'chapters': [],
            'instagram_profiles': {},
            'linkedin_profiles': {},
            'scraped_at': datetime.now().isoformat()
        }

    def run_full_pipeline(
        self,
        scrape_colleges: bool = True,
        scrape_instagram: bool = True,
        scrape_linkedin: bool = False,  # Off by default (requires API key)
        output_dir: str = '../data/scraped'
    ):
        """
        Runs complete scraping pipeline

        Args:
            scrape_colleges: Scrape college Greek life pages
            scrape_instagram: Scrape Instagram follower data
            scrape_linkedin: Scrape LinkedIn profiles (requires API)
            output_dir: Directory to save results
        """
        logger.info("\n" + "="*80)
        logger.info("STARTING MASTER SCRAPER PIPELINE")
        logger.info("="*80 + "\n")

        # STEP 1: Scrape College Greek Life Pages
        if scrape_colleges:
            logger.info("\n📚 STEP 1: Scraping College Greek Life Pages")
            logger.info("-" * 80)
            self._scrape_colleges()

        # STEP 2: Scrape Instagram Data
        if scrape_instagram and self.results['chapters']:
            logger.info("\n📸 STEP 2: Scraping Instagram Profiles")
            logger.info("-" * 80)
            self._scrape_instagram()

        # STEP 3: Scrape LinkedIn Profiles
        if scrape_linkedin and self.results['chapters']:
            logger.info("\n💼 STEP 3: Scraping LinkedIn Profiles")
            logger.info("-" * 80)
            self._scrape_linkedin()

        # STEP 4: Export Results
        logger.info("\n💾 STEP 4: Exporting Results")
        logger.info("-" * 80)
        self._export_results(output_dir)

        logger.info("\n" + "="*80)
        logger.info("✅ SCRAPING PIPELINE COMPLETE")
        logger.info("="*80 + "\n")

        self._print_summary()

    def _scrape_colleges(self):
        """Scrape college Greek life pages"""
        colleges_data = self.college_scraper.scrape_all_d1_schools()

        for college in colleges_data:
            self.results['colleges'].append(college)

            # Flatten chapters into separate list
            for frat in college.get('fraternities', []):
                frat['college_name'] = college['name']
                frat['college_state'] = college['state']
                frat['chapter_type'] = 'fraternity'
                self.results['chapters'].append(frat)

            for sorority in college.get('sororities', []):
                sorority['college_name'] = college['name']
                sorority['college_state'] = college['state']
                sorority['chapter_type'] = 'sorority'
                self.results['chapters'].append(sorority)

        logger.info(f"✓ Scraped {len(self.results['colleges'])} colleges")
        logger.info(f"✓ Found {len(self.results['chapters'])} total chapters")

    def _scrape_instagram(self):
        """Scrape Instagram data for chapters"""
        chapters_with_instagram = [
            ch for ch in self.results['chapters']
            if ch.get('instagram')
        ]

        logger.info(f"Scraping Instagram for {len(chapters_with_instagram)} chapters...")

        instagram_data = self.instagram_scraper.batch_scrape_chapters(chapters_with_instagram)
        self.results['instagram_profiles'] = {
            username: profile.__dict__
            for username, profile in instagram_data.items()
        }

        # Update chapters with follower counts
        for chapter in self.results['chapters']:
            instagram_handle = chapter.get('instagram')
            if instagram_handle and instagram_handle in instagram_data:
                chapter['instagram_followers'] = instagram_data[instagram_handle].followers
                chapter['instagram_posts'] = instagram_data[instagram_handle].posts

        logger.info(f"✓ Scraped {len(instagram_data)} Instagram profiles")

    def _scrape_linkedin(self):
        """Scrape LinkedIn profiles"""
        logger.info(f"Scraping LinkedIn for {len(self.results['chapters'])} chapters...")

        linkedin_data = self.linkedin_scraper.batch_scrape_chapters(
            self.results['chapters'],
            find_officers=True
        )

        self.results['linkedin_profiles'] = {
            key: [profile.__dict__ for profile in profiles]
            for key, profiles in linkedin_data.items()
        }

        # Count total profiles
        total_profiles = sum(len(profiles) for profiles in linkedin_data.values())
        logger.info(f"✓ Scraped {total_profiles} LinkedIn profiles")

    def _export_results(self, output_dir: str):
        """Export results to JSON and SQL"""
        os.makedirs(output_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Export to JSON
        json_file = f"{output_dir}/greek_life_data_{timestamp}.json"
        with open(json_file, 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        logger.info(f"✓ Exported JSON: {json_file}")

        # Export to SQL
        sql_file = f"{output_dir}/greek_life_import_{timestamp}.sql"
        self._generate_sql_import(sql_file)
        logger.info(f"✓ Exported SQL: {sql_file}")

        # Export summary CSV
        csv_file = f"{output_dir}/chapters_summary_{timestamp}.csv"
        self._generate_csv_summary(csv_file)
        logger.info(f"✓ Exported CSV: {csv_file}")

    def _generate_sql_import(self, filename: str):
        """Generate SQL INSERT statements"""
        with open(filename, 'w') as f:
            f.write("-- Greek Life Data Import\n")
            f.write(f"-- Generated: {datetime.now().isoformat()}\n\n")

            # Insert colleges
            f.write("-- Insert Colleges\n")
            for college in self.results['colleges']:
                f.write(
                    f"INSERT INTO fraternity_data.universities (name, state, city, division) "
                    f"VALUES ('{college['name']}', '{college['state']}', '{college['city']}', '{college['division']}');\n"
                )

            f.write("\n-- Insert Chapters\n")
            for chapter in self.results['chapters']:
                name = chapter['name'].replace("'", "''")  # Escape quotes
                college = chapter['college_name'].replace("'", "''")
                f.write(
                    f"INSERT INTO fraternity_data.chapters (name, college, chapter_type, instagram, instagram_followers) "
                    f"VALUES ('{name}', '{college}', '{chapter['chapter_type']}', '{chapter.get('instagram', '')}', {chapter.get('instagram_followers', 0)});\n"
                )

        logger.info(f"Generated SQL import file with {len(self.results['chapters'])} chapters")

    def _generate_csv_summary(self, filename: str):
        """Generate CSV summary of chapters"""
        import csv

        with open(filename, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'name', 'college', 'state', 'chapter_type',
                'instagram', 'instagram_followers', 'website'
            ])
            writer.writeheader()

            for chapter in self.results['chapters']:
                writer.writerow({
                    'name': chapter.get('name', ''),
                    'college': chapter.get('college_name', ''),
                    'state': chapter.get('college_state', ''),
                    'chapter_type': chapter.get('chapter_type', ''),
                    'instagram': chapter.get('instagram', ''),
                    'instagram_followers': chapter.get('instagram_followers', ''),
                    'website': chapter.get('website', '')
                })

    def _print_summary(self):
        """Print scraping summary"""
        logger.info("\n📊 SCRAPING SUMMARY")
        logger.info("="*60)
        logger.info(f"Colleges Scraped: {len(self.results['colleges'])}")
        logger.info(f"Chapters Found: {len(self.results['chapters'])}")
        logger.info(f"Instagram Profiles: {len(self.results['instagram_profiles'])}")

        linkedin_count = sum(
            len(profiles) for profiles in self.results['linkedin_profiles'].values()
        )
        logger.info(f"LinkedIn Profiles: {linkedin_count}")

        # Count by type
        fraternities = len([ch for ch in self.results['chapters'] if ch['chapter_type'] == 'fraternity'])
        sororities = len([ch for ch in self.results['chapters'] if ch['chapter_type'] == 'sorority'])
        logger.info(f"  - Fraternities: {fraternities}")
        logger.info(f"  - Sororities: {sororities}")

        # Instagram stats
        chapters_with_ig = len([ch for ch in self.results['chapters'] if ch.get('instagram_followers')])
        logger.info(f"Chapters with Instagram data: {chapters_with_ig}")

        logger.info("="*60)


def main():
    """
    Run the master scraper

    Usage:
        python master_scraper.py
    """
    # Get API key from environment
    proxycurl_key = os.getenv('PROXYCURL_API_KEY')

    scraper = MasterScraper(proxycurl_api_key=proxycurl_key)

    # Run pipeline
    scraper.run_full_pipeline(
        scrape_colleges=True,
        scrape_instagram=True,
        scrape_linkedin=bool(proxycurl_key),  # Only if API key provided
        output_dir='../data/scraped'
    )


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
Scrape All NIC Fraternities
Scrapes chapter data for all 58 NIC member fraternities
"""

import csv
import json
import time
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'fraternity_scrape_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# Chapter directory URLs for each fraternity
# These are the official national organization websites with chapter directories
FRATERNITY_CHAPTER_URLS = {
    'Sigma Chi': 'https://sigmachi.org/chapters',
    'Alpha Tau Omega': 'https://www.ato.org/about/chapters',
    'Pi Kappa Alpha': 'https://pikes.org/chapters',
    'Sigma Alpha Epsilon': 'https://www.sae.net/chapters',
    'Sigma Nu': 'https://www.sigmanu.org/chapters',
    'Beta Theta Pi': 'https://www.betathetapi.org/chapters',
    'Delta Tau Delta': 'https://www.delts.org/find-a-chapter',
    'Lambda Chi Alpha': 'https://www.lambdachi.org/chapters',
    'Phi Delta Theta': 'https://www.phideltatheta.org/chapters',
    'Kappa Sigma': 'https://www.kappasigma.org/chapters',
    'Sigma Phi Epsilon': 'https://www.sigep.org/chapters',
    'Phi Gamma Delta': 'https://www.phigam.org/chapters',
    'Phi Kappa Psi': 'https://www.phikappapsi.com/chapters',
    'Delta Chi': 'https://www.deltachi.org/chapters',
    'Tau Kappa Epsilon': 'https://www.tke.org/chapters',
    'Pi Kappa Phi': 'https://www.pikapp.org/chapters',
    'Alpha Epsilon Pi': 'https://www.aepi.org/chapters',
    'Theta Chi': 'https://www.thetachi.org/chapters',
    'Zeta Beta Tau': 'https://www.zbt.org/chapters',
    # Add more as you find their chapter directory URLs
}


class FraternityChapterScraper:
    """Scrapes chapter information from fraternity national websites"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.all_chapters = []

    def scrape_fraternity(self, fraternity_name: str, chapter_url: str) -> List[Dict]:
        """
        Scrapes chapter list for a specific fraternity

        Returns:
            List of chapter dictionaries
        """
        logger.info(f"\n{'='*80}")
        logger.info(f"Scraping: {fraternity_name}")
        logger.info(f"URL: {chapter_url}")
        logger.info(f"{'='*80}")

        try:
            response = self.session.get(chapter_url, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Each fraternity website has a different structure
            # This is a generic parser - you'll need to customize per fraternity
            chapters = self._parse_chapter_directory(soup, fraternity_name)

            logger.info(f"✓ Found {len(chapters)} chapters for {fraternity_name}")
            return chapters

        except Exception as e:
            logger.error(f"✗ Error scraping {fraternity_name}: {str(e)}")
            return []

    def _parse_chapter_directory(self, soup: BeautifulSoup, fraternity_name: str) -> List[Dict]:
        """
        Generic parser for chapter directories

        This will need customization for each fraternity's website structure
        """
        chapters = []

        # Look for common patterns
        # Pattern 1: List items with college names
        for item in soup.find_all(['li', 'div'], class_=lambda x: x and 'chapter' in x.lower()):
            text = item.get_text(strip=True)
            if 'university' in text.lower() or 'college' in text.lower():
                chapters.append({
                    'fraternity': fraternity_name,
                    'university': text,
                    'status': 'active'
                })

        # Pattern 2: Tables with chapter information
        for table in soup.find_all('table'):
            rows = table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    chapters.append({
                        'fraternity': fraternity_name,
                        'university': cells[0].get_text(strip=True),
                        'chapter_name': cells[1].get_text(strip=True) if len(cells) > 1 else None,
                        'status': 'active'
                    })

        return chapters

    def scrape_all_fraternities(self) -> Dict:
        """
        Scrapes all fraternities in FRATERNITY_CHAPTER_URLS

        Returns:
            Dictionary with results
        """
        results = {
            'scraped_at': datetime.now().isoformat(),
            'total_fraternities': len(FRATERNITY_CHAPTER_URLS),
            'fraternities': {}
        }

        for fraternity_name, url in FRATERNITY_CHAPTER_URLS.items():
            chapters = self.scrape_fraternity(fraternity_name, url)
            results['fraternities'][fraternity_name] = {
                'chapter_count': len(chapters),
                'chapters': chapters
            }
            self.all_chapters.extend(chapters)
            time.sleep(2)  # Rate limiting

        results['total_chapters'] = len(self.all_chapters)
        return results

    def export_results(self, output_json: str, output_csv: str):
        """Export scraped data to JSON and CSV"""
        # Export JSON
        with open(output_json, 'w') as f:
            json.dump({
                'total_chapters': len(self.all_chapters),
                'chapters': self.all_chapters
            }, f, indent=2)

        logger.info(f"✓ Exported JSON: {output_json}")

        # Export CSV
        if self.all_chapters:
            with open(output_csv, 'w', newline='') as f:
                fieldnames = ['fraternity', 'chapter_name', 'university', 'status']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for chapter in self.all_chapters:
                    writer.writerow({
                        'fraternity': chapter.get('fraternity', ''),
                        'chapter_name': chapter.get('chapter_name', ''),
                        'university': chapter.get('university', ''),
                        'status': chapter.get('status', 'active')
                    })

            logger.info(f"✓ Exported CSV: {output_csv}")


def scrape_via_wikipedia():
    """
    Alternative: Scrape chapter counts from Wikipedia

    Many fraternities have Wikipedia pages listing chapter counts
    """
    fraternities_data = []

    # Load NIC fraternities
    with open('../data/nic_fraternities.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            fraternity_name = row['name']
            wiki_url = f"https://en.wikipedia.org/wiki/{fraternity_name.replace(' ', '_')}"

            logger.info(f"Checking Wikipedia: {fraternity_name}")

            try:
                response = requests.get(wiki_url, timeout=10)
                soup = BeautifulSoup(response.content, 'html.parser')

                # Look for infobox with chapter count
                infobox = soup.find('table', class_='infobox')
                if infobox:
                    # Look for rows mentioning "chapters" or "members"
                    for row in infobox.find_all('tr'):
                        header = row.find('th')
                        if header and 'chapter' in header.get_text().lower():
                            value = row.find('td')
                            if value:
                                chapter_count = value.get_text(strip=True)
                                logger.info(f"  ✓ Found: {chapter_count} chapters")
                                fraternities_data.append({
                                    'name': fraternity_name,
                                    'chapter_count': chapter_count,
                                    'source': 'wikipedia'
                                })
                                break

                time.sleep(1)  # Rate limiting

            except Exception as e:
                logger.error(f"  ✗ Error: {str(e)}")

    return fraternities_data


def main():
    """
    Main execution

    Strategy:
    1. Start with Wikipedia to get chapter counts
    2. Then scrape individual fraternity websites
    3. Combine and export results
    """
    logger.info("\n" + "="*80)
    logger.info("NIC FRATERNITY CHAPTER SCRAPER")
    logger.info("="*80 + "\n")

    # Option 1: Scrape from fraternity websites
    logger.info("Option 1: Scraping fraternity websites...")
    scraper = FraternityChapterScraper()
    results = scraper.scrape_all_fraternities()

    # Export
    scraper.export_results(
        '../data/all_fraternities_chapters.json',
        '../data/all_fraternities_chapters.csv'
    )

    # Option 2: Get counts from Wikipedia
    logger.info("\n\nOption 2: Getting chapter counts from Wikipedia...")
    wiki_data = scrape_via_wikipedia()

    with open('../data/fraternity_chapter_counts.json', 'w') as f:
        json.dump(wiki_data, f, indent=2)

    logger.info(f"\n{'='*80}")
    logger.info("COMPLETE!")
    logger.info(f"Total fraternities processed: {len(FRATERNITY_CHAPTER_URLS)}")
    logger.info(f"Total chapters found: {len(scraper.all_chapters)}")
    logger.info(f"{'='*80}\n")


if __name__ == '__main__':
    main()
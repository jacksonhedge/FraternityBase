#!/usr/bin/env python3
"""
College Greek Life Scraper
Scrapes college websites for fraternity/sorority information
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class Chapter:
    """Represents a fraternity or sorority chapter"""
    name: str
    college: str
    chapter_type: str  # 'fraternity' or 'sorority'
    address: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    founded_year: Optional[int] = None
    member_count: Optional[int] = None
    greek_letters: Optional[str] = None

@dataclass
class College:
    """Represents a college/university"""
    name: str
    state: str
    city: str
    division: str  # NCAA Division
    greek_life_url: Optional[str] = None
    total_students: Optional[int] = None
    greek_population: Optional[int] = None
    fraternities: List[Chapter] = None
    sororities: List[Chapter] = None

    def __post_init__(self):
        if self.fraternities is None:
            self.fraternities = []
        if self.sororities is None:
            self.sororities = []


class CollegeScraper:
    """Scrapes college Greek life information"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def scrape_college_greek_life(self, college_name: str, greek_life_url: str) -> College:
        """
        Scrapes Greek life information for a specific college

        Args:
            college_name: Name of the college
            greek_life_url: URL to the college's Greek life page

        Returns:
            College object with Greek life data
        """
        logger.info(f"Scraping {college_name} - {greek_life_url}")

        try:
            response = self.session.get(greek_life_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # Extract chapters (this will vary by website structure)
            chapters = self._extract_chapters(soup, college_name)

            fraternities = [c for c in chapters if c.chapter_type == 'fraternity']
            sororities = [c for c in chapters if c.chapter_type == 'sorority']

            college = College(
                name=college_name,
                state='',  # Will be filled in later
                city='',
                division='D1',
                greek_life_url=greek_life_url,
                fraternities=fraternities,
                sororities=sororities
            )

            logger.info(f"Found {len(fraternities)} fraternities and {len(sororities)} sororities")
            return college

        except Exception as e:
            logger.error(f"Error scraping {college_name}: {str(e)}")
            return None

    def _extract_chapters(self, soup: BeautifulSoup, college_name: str) -> List[Chapter]:
        """Extract chapter information from parsed HTML"""
        chapters = []

        # Common patterns for Greek life pages
        # Pattern 1: List of links with Greek letters
        links = soup.find_all('a', href=True)
        greek_pattern = re.compile(r'(Alpha|Beta|Gamma|Delta|Epsilon|Zeta|Eta|Theta|Iota|Kappa|Lambda|Mu|Nu|Xi|Omicron|Pi|Rho|Sigma|Tau|Upsilon|Phi|Chi|Psi|Omega)')

        for link in links:
            text = link.get_text(strip=True)
            if greek_pattern.search(text):
                chapter_type = self._determine_chapter_type(text)
                if chapter_type:
                    chapter = Chapter(
                        name=text,
                        college=college_name,
                        chapter_type=chapter_type,
                        website=link.get('href')
                    )
                    chapters.append(chapter)

        # Pattern 2: Tables with chapter information
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 1:
                    text = cells[0].get_text(strip=True)
                    if greek_pattern.search(text):
                        chapter_type = self._determine_chapter_type(text)
                        if chapter_type:
                            chapter = Chapter(
                                name=text,
                                college=college_name,
                                chapter_type=chapter_type
                            )
                            chapters.append(chapter)

        # Remove duplicates
        unique_chapters = []
        seen_names = set()
        for chapter in chapters:
            if chapter.name not in seen_names:
                unique_chapters.append(chapter)
                seen_names.add(chapter.name)

        return unique_chapters

    def _determine_chapter_type(self, name: str) -> Optional[str]:
        """Determine if a chapter is a fraternity or sorority"""
        name_lower = name.lower()

        # Known fraternities
        frat_keywords = ['sigma chi', 'alpha tau omega', 'pi kappa alpha', 'kappa alpha',
                         'sigma alpha epsilon', 'phi delta theta', 'delta tau delta',
                         'kappa sigma', 'phi kappa psi', 'beta theta pi', 'lambda chi alpha']

        # Known sororities
        sorority_keywords = ['alpha chi omega', 'kappa kappa gamma', 'chi omega',
                            'delta delta delta', 'pi beta phi', 'kappa alpha theta',
                            'alpha delta pi', 'gamma phi beta', 'alpha phi', 'zeta tau alpha']

        for keyword in frat_keywords:
            if keyword in name_lower:
                return 'fraternity'

        for keyword in sorority_keywords:
            if keyword in name_lower:
                return 'sorority'

        # Default heuristics (not always accurate)
        if 'sorority' in name_lower:
            return 'sorority'
        if 'fraternity' in name_lower or 'frat' in name_lower:
            return 'fraternity'

        return None

    def get_d1_schools(self) -> List[Dict]:
        """
        Gets list of Division 1 schools with Greek life
        Returns list of dictionaries with name and greek_life_url
        """
        # This is a starter list - you'll want to expand this
        d1_schools = [
            {
                'name': 'University of Alabama',
                'state': 'AL',
                'city': 'Tuscaloosa',
                'greek_life_url': 'https://greeklife.ua.edu/sororities-fraternities/'
            },
            {
                'name': 'Penn State University',
                'state': 'PA',
                'city': 'University Park',
                'greek_life_url': 'https://studentaffairs.psu.edu/involvement-student-orgs/greek-life'
            },
            {
                'name': 'University of Georgia',
                'state': 'GA',
                'city': 'Athens',
                'greek_life_url': 'https://greeklife.uga.edu/chapters'
            },
            {
                'name': 'University of Mississippi',
                'state': 'MS',
                'city': 'Oxford',
                'greek_life_url': 'https://greeklife.olemiss.edu/chapters/'
            },
            {
                'name': 'Florida State University',
                'state': 'FL',
                'city': 'Tallahassee',
                'greek_life_url': 'https://greeklife.fsu.edu/chapters'
            },
            {
                'name': 'University of Virginia',
                'state': 'VA',
                'city': 'Charlottesville',
                'greek_life_url': 'https://fraternity.virginia.edu/chapters'
            },
            {
                'name': 'University of Michigan',
                'state': 'MI',
                'city': 'Ann Arbor',
                'greek_life_url': 'https://greeklife.umich.edu/chapters'
            },
            {
                'name': 'Ohio State University',
                'state': 'OH',
                'city': 'Columbus',
                'greek_life_url': 'https://ohiounion.osu.edu/get_involved/sorority_and_fraternity_life'
            },
            {
                'name': 'USC - University of Southern California',
                'state': 'CA',
                'city': 'Los Angeles',
                'greek_life_url': 'https://greeklife.usc.edu/chapters/'
            },
            {
                'name': 'University of Texas at Austin',
                'state': 'TX',
                'city': 'Austin',
                'greek_life_url': 'https://deanofstudents.utexas.edu/fraternityandsororitylife/chapters.php'
            }
        ]

        return d1_schools

    def scrape_all_d1_schools(self, output_file: str = 'greek_life_data.json'):
        """
        Scrapes all D1 schools and saves to JSON file
        """
        schools = self.get_d1_schools()
        results = []

        for school_info in schools:
            logger.info(f"\n{'='*60}")
            logger.info(f"Processing: {school_info['name']}")
            logger.info(f"{'='*60}")

            college = self.scrape_college_greek_life(
                school_info['name'],
                school_info['greek_life_url']
            )

            if college:
                college.state = school_info['state']
                college.city = school_info['city']
                results.append(asdict(college))

            # Be respectful - delay between requests
            time.sleep(2)

        # Save results
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"\n{'='*60}")
        logger.info(f"Scraping complete! Saved to {output_file}")
        logger.info(f"Total colleges: {len(results)}")
        logger.info(f"{'='*60}")

        return results


def main():
    scraper = CollegeScraper()

    # Test with one school first
    logger.info("Testing scraper with Penn State...")
    result = scraper.scrape_college_greek_life(
        'Penn State University',
        'https://studentaffairs.psu.edu/involvement-student-orgs/greek-life'
    )

    if result:
        logger.info(f"\nTest Results:")
        logger.info(f"College: {result.name}")
        logger.info(f"Fraternities: {len(result.fraternities)}")
        logger.info(f"Sororities: {len(result.sororities)}")

        # Show first 5 chapters
        logger.info("\nSample Chapters:")
        for chapter in (result.fraternities + result.sororities)[:5]:
            logger.info(f"  - {chapter.name} ({chapter.chapter_type})")

    # Uncomment to scrape all schools
    # logger.info("\n\nStarting full scrape of all D1 schools...")
    # scraper.scrape_all_d1_schools('greek_life_data.json')


if __name__ == '__main__':
    main()
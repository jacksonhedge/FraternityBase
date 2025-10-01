#!/usr/bin/env python3
"""
LinkedIn Scraper
Scrapes LinkedIn for member profiles and company pages
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from typing import Optional, Dict, List
from dataclasses import dataclass, asdict
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class LinkedInProfile:
    """LinkedIn profile data"""
    name: str
    headline: Optional[str] = None
    location: Optional[str] = None
    profile_url: Optional[str] = None
    connections: Optional[int] = None
    company: Optional[str] = None
    school: Optional[str] = None
    fraternity: Optional[str] = None


@dataclass
class LinkedInCompanyPage:
    """LinkedIn company/organization page"""
    name: str
    url: str
    followers: Optional[int] = None
    employees: Optional[int] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None


class LinkedInScraper:
    """
    Scrapes LinkedIn profile information

    IMPORTANT NOTES:
    1. LinkedIn has STRONG anti-scraping measures
    2. Scraping LinkedIn violates their Terms of Service
    3. For production, you MUST use:
       - LinkedIn Sales Navigator API (paid)
       - LinkedIn Marketing API
       - Proxycurl API (third-party LinkedIn data)
       - PhantomBuster (automation tool)

    This scraper is for educational purposes only.
    """

    def __init__(self, use_api: bool = False, api_key: Optional[str] = None):
        self.use_api = use_api
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'en-US,en;q=0.9',
        })

    def search_profiles_by_fraternity(
        self,
        fraternity_name: str,
        college_name: str,
        limit: int = 50
    ) -> List[LinkedInProfile]:
        """
        Searches for LinkedIn profiles of fraternity members

        Args:
            fraternity_name: e.g., "Sigma Chi"
            college_name: e.g., "University of Southern California"
            limit: Max number of profiles to return

        Returns:
            List of LinkedInProfile objects
        """
        if self.use_api and self.api_key:
            return self._search_via_api(fraternity_name, college_name, limit)
        else:
            logger.warning("LinkedIn scraping without API is not recommended")
            logger.info("Consider using Proxycurl API: https://nubela.co/proxycurl/")
            return []

    def _search_via_api(
        self,
        fraternity_name: str,
        college_name: str,
        limit: int
    ) -> List[LinkedInProfile]:
        """
        Search LinkedIn profiles via Proxycurl API

        Example using Proxycurl (https://nubela.co/proxycurl/):
        - People Search API: Find profiles by fraternity + school
        - Profile Lookup: Get detailed profile data
        - Cost: ~$0.01 per profile
        """
        if not self.api_key:
            logger.error("API key required for LinkedIn data")
            return []

        # Proxycurl People Search API endpoint
        url = "https://nubela.co/proxycurl/api/v2/search/person"

        headers = {
            'Authorization': f'Bearer {self.api_key}'
        }

        params = {
            'country': 'US',
            'education_school_name': college_name,
            'keyword': fraternity_name,
            'page_size': limit
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            profiles = []
            for result in data.get('results', []):
                profile = LinkedInProfile(
                    name=result.get('full_name', ''),
                    headline=result.get('headline'),
                    location=result.get('location'),
                    profile_url=result.get('linkedin_profile_url'),
                    connections=result.get('connections'),
                    company=result.get('current_company_name'),
                    school=college_name,
                    fraternity=fraternity_name
                )
                profiles.append(profile)

            logger.info(f"Found {len(profiles)} profiles for {fraternity_name} at {college_name}")
            return profiles

        except requests.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            return []

    def get_company_page(self, company_linkedin_url: str) -> Optional[LinkedInCompanyPage]:
        """
        Gets company page information

        Args:
            company_linkedin_url: e.g., "https://www.linkedin.com/company/sigma-chi-fraternity"

        Returns:
            LinkedInCompanyPage object or None
        """
        if self.use_api and self.api_key:
            return self._get_company_page_via_api(company_linkedin_url)
        else:
            logger.warning("Company page scraping requires API access")
            return None

    def _get_company_page_via_api(self, company_url: str) -> Optional[LinkedInCompanyPage]:
        """Gets company page data via Proxycurl API"""
        if not self.api_key:
            return None

        url = "https://nubela.co/proxycurl/api/linkedin/company"
        headers = {'Authorization': f'Bearer {self.api_key}'}
        params = {'url': company_url}

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            company = LinkedInCompanyPage(
                name=data.get('name', ''),
                url=company_url,
                followers=data.get('follower_count'),
                employees=data.get('company_size'),
                description=data.get('description'),
                website=data.get('website'),
                industry=data.get('industry')
            )

            logger.info(f"Fetched company page: {company.name} ({company.followers} followers)")
            return company

        except requests.RequestException as e:
            logger.error(f"Failed to fetch company page: {str(e)}")
            return None

    def find_chapter_officers(
        self,
        fraternity_name: str,
        college_name: str
    ) -> List[LinkedInProfile]:
        """
        Finds current/recent officers of a fraternity chapter

        Searches for profiles with titles like:
        - President, Sigma Chi
        - Vice President, Sigma Chi at USC
        - Treasurer, Sigma Chi Fraternity
        """
        search_queries = [
            f"President {fraternity_name} {college_name}",
            f"Vice President {fraternity_name} {college_name}",
            f"Treasurer {fraternity_name} {college_name}",
            f"Social Chair {fraternity_name} {college_name}",
        ]

        all_officers = []

        for query in search_queries:
            profiles = self._search_via_api(fraternity_name, college_name, limit=10)
            # Filter for officer titles
            officers = [p for p in profiles if p.headline and any(
                title in p.headline for title in ['President', 'VP', 'Vice President', 'Treasurer', 'Chair']
            )]
            all_officers.extend(officers)

        return all_officers

    def batch_scrape_chapters(
        self,
        chapters: List[Dict],
        find_officers: bool = True
    ) -> Dict[str, List[LinkedInProfile]]:
        """
        Scrapes LinkedIn data for multiple chapters

        Args:
            chapters: List of chapter dicts with 'name' and 'college' keys
            find_officers: Whether to search for chapter officers

        Returns:
            Dictionary mapping chapter key to list of profiles
        """
        results = {}

        for chapter in chapters:
            chapter_name = chapter.get('name', '')
            college_name = chapter.get('college', '')
            key = f"{chapter_name}_{college_name}"

            logger.info(f"\n{'='*60}")
            logger.info(f"Scraping LinkedIn for: {chapter_name} at {college_name}")
            logger.info(f"{'='*60}")

            if find_officers:
                profiles = self.find_chapter_officers(chapter_name, college_name)
            else:
                profiles = self.search_profiles_by_fraternity(chapter_name, college_name, limit=50)

            results[key] = profiles
            logger.info(f"Found {len(profiles)} profiles")

            time.sleep(2)  # Rate limiting

        return results


class ProxycurlLinkedInScraper(LinkedInScraper):
    """
    Production-ready LinkedIn scraper using Proxycurl API

    Sign up: https://nubela.co/proxycurl/
    Pricing: ~$0.01 per profile lookup
    Features:
    - No rate limits
    - Real-time data
    - No risk of account suspension
    - Includes email finder API
    """

    def __init__(self, api_key: str):
        super().__init__(use_api=True, api_key=api_key)


def main():
    """
    Test LinkedIn scraper

    To use in production:
    1. Sign up for Proxycurl: https://nubela.co/proxycurl/
    2. Get API key
    3. Set environment variable: PROXYCURL_API_KEY=your_key
    4. Use ProxycurlLinkedInScraper class
    """
    import os

    api_key = os.getenv('PROXYCURL_API_KEY')

    if not api_key:
        logger.warning("\n" + "="*60)
        logger.warning("No Proxycurl API key found")
        logger.warning("To use LinkedIn scraper:")
        logger.warning("1. Sign up at https://nubela.co/proxycurl/")
        logger.warning("2. Get your API key")
        logger.warning("3. Export PROXYCURL_API_KEY=your_key")
        logger.warning("="*60 + "\n")
        return

    scraper = ProxycurlLinkedInScraper(api_key)

    # Test: Search for Sigma Chi officers at USC
    logger.info("Testing LinkedIn scraper with Sigma Chi at USC...")
    profiles = scraper.find_chapter_officers(
        fraternity_name="Sigma Chi",
        college_name="University of Southern California"
    )

    logger.info(f"\n{'='*60}")
    logger.info(f"Found {len(profiles)} officer profiles:")
    logger.info(f"{'='*60}")

    for profile in profiles[:5]:  # Show first 5
        logger.info(f"\nName: {profile.name}")
        logger.info(f"Headline: {profile.headline}")
        logger.info(f"Location: {profile.location}")
        logger.info(f"Profile: {profile.profile_url}")


if __name__ == '__main__':
    main()
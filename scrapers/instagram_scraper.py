#!/usr/bin/env python3
"""
Instagram Scraper
Scrapes Instagram for follower counts and profile information
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from typing import Optional, Dict
from dataclasses import dataclass, asdict
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class InstagramProfile:
    """Instagram profile data"""
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    followers: Optional[int] = None
    following: Optional[int] = None
    posts: Optional[int] = None
    profile_pic_url: Optional[str] = None
    is_verified: bool = False
    is_private: bool = False
    external_url: Optional[str] = None


class InstagramScraper:
    """
    Scrapes Instagram profile information

    Note: Instagram has anti-scraping measures. For production use:
    1. Use Instagram Graph API (requires business account)
    2. Use Apify or similar scraping service
    3. Use Selenium with rotating proxies
    """

    def __init__(self, use_api: bool = False, api_token: Optional[str] = None):
        self.use_api = use_api
        self.api_token = api_token
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })

    def get_profile_info(self, username: str) -> Optional[InstagramProfile]:
        """
        Gets profile information for an Instagram username

        Args:
            username: Instagram username (without @)

        Returns:
            InstagramProfile object or None if failed
        """
        username = username.lstrip('@')
        logger.info(f"Fetching Instagram profile: @{username}")

        try:
            if self.use_api and self.api_token:
                return self._get_profile_via_api(username)
            else:
                return self._get_profile_via_scraping(username)

        except Exception as e:
            logger.error(f"Error fetching Instagram profile @{username}: {str(e)}")
            return None

    def _get_profile_via_scraping(self, username: str) -> Optional[InstagramProfile]:
        """
        Scrapes Instagram profile via public HTML

        WARNING: This method may break frequently as Instagram changes their HTML structure
        and implements anti-bot measures. For production, use the API method.
        """
        url = f"https://www.instagram.com/{username}/"

        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()

            # Instagram embeds data in <script> tags as JSON
            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for JSON data in script tags
            scripts = soup.find_all('script', type='application/ld+json')

            for script in scripts:
                try:
                    data = json.loads(script.string)

                    if '@type' in data and data['@type'] == 'Person':
                        profile = InstagramProfile(
                            username=username,
                            full_name=data.get('name'),
                            bio=data.get('description'),
                            followers=self._parse_count(data.get('interactionStatistic', {}).get('userInteractionCount', '0')),
                        )

                        logger.info(f"Successfully scraped @{username}: {profile.followers} followers")
                        return profile

                except json.JSONDecodeError:
                    continue

            # Fallback: try to extract from meta tags
            meta_desc = soup.find('meta', property='og:description')
            if meta_desc:
                content = meta_desc.get('content', '')
                # Format: "X Followers, Y Following, Z Posts"
                followers_match = re.search(r'([\d,\.]+[KMB]?)\s+Followers', content, re.IGNORECASE)
                following_match = re.search(r'([\d,\.]+[KMB]?)\s+Following', content, re.IGNORECASE)
                posts_match = re.search(r'([\d,\.]+[KMB]?)\s+Posts', content, re.IGNORECASE)

                profile = InstagramProfile(
                    username=username,
                    followers=self._parse_count(followers_match.group(1)) if followers_match else None,
                    following=self._parse_count(following_match.group(1)) if following_match else None,
                    posts=self._parse_count(posts_match.group(1)) if posts_match else None,
                )

                logger.info(f"Successfully scraped @{username}: {profile.followers} followers")
                return profile

            logger.warning(f"Could not extract data for @{username}")
            return None

        except requests.RequestException as e:
            logger.error(f"Request failed for @{username}: {str(e)}")
            return None

    def _get_profile_via_api(self, username: str) -> Optional[InstagramProfile]:
        """
        Gets profile info via Instagram Graph API

        Requires:
        - Business/Creator Instagram account
        - Facebook Developer App
        - User Access Token with instagram_basic permission
        """
        # This is a placeholder - you'll need to implement based on your API setup
        logger.warning("Instagram Graph API not yet implemented")
        return None

    def _parse_count(self, count_str: str) -> Optional[int]:
        """
        Parses follower/following/post counts
        Examples: "1.5M" -> 1500000, "234K" -> 234000, "1,234" -> 1234
        """
        if not count_str:
            return None

        count_str = str(count_str).strip().replace(',', '')

        # Handle K, M, B suffixes
        multipliers = {'K': 1000, 'M': 1000000, 'B': 1000000000}

        for suffix, multiplier in multipliers.items():
            if suffix in count_str.upper():
                num = float(count_str.upper().replace(suffix, ''))
                return int(num * multiplier)

        try:
            return int(float(count_str))
        except ValueError:
            return None

    def search_instagram_handles(self, chapter_name: str, college_name: str) -> list[str]:
        """
        Attempts to find Instagram handles for a chapter

        Args:
            chapter_name: e.g., "Sigma Chi"
            college_name: e.g., "Penn State University"

        Returns:
            List of potential Instagram usernames
        """
        # Common patterns for Greek life Instagram handles
        chapter_clean = chapter_name.lower().replace(' ', '')
        college_clean = college_name.lower().replace(' ', '').replace('university', '').replace('of', '')

        potential_handles = [
            f"{chapter_clean}{college_clean}",
            f"{chapter_clean}_{college_clean}",
            f"{college_clean}{chapter_clean}",
            f"{chapter_clean}.{college_clean}",
            # Examples: "sigmachiusc", "sigmachi_pennstate", "sigmachiuga"
        ]

        # Add abbreviated versions
        # Example: "USC Sigma Chi" -> "uscsigmachi", "usc_sigmachi"
        if len(college_name.split()) > 1:
            college_abbr = ''.join(word[0] for word in college_name.split()).lower()
            potential_handles.extend([
                f"{chapter_clean}{college_abbr}",
                f"{chapter_clean}_{college_abbr}",
                f"{college_abbr}{chapter_clean}",
            ])

        return potential_handles

    def batch_scrape_chapters(self, chapters: list[Dict]) -> Dict[str, InstagramProfile]:
        """
        Scrapes Instagram data for multiple chapters

        Args:
            chapters: List of chapter dicts with 'name', 'college', 'instagram' keys

        Returns:
            Dictionary mapping username to InstagramProfile
        """
        results = {}

        for chapter in chapters:
            instagram = chapter.get('instagram')

            # If no Instagram handle provided, try to search
            if not instagram:
                chapter_name = chapter.get('name', '')
                college_name = chapter.get('college', '')
                potential_handles = self.search_instagram_handles(chapter_name, college_name)

                # Try each potential handle
                for handle in potential_handles[:3]:  # Try first 3
                    profile = self.get_profile_info(handle)
                    if profile and profile.followers:
                        results[handle] = profile
                        logger.info(f"✓ Found: @{handle} ({profile.followers} followers)")
                        break
                    time.sleep(2)  # Rate limiting
            else:
                profile = self.get_profile_info(instagram)
                if profile:
                    results[instagram] = profile
                    logger.info(f"✓ Scraped: @{instagram} ({profile.followers} followers)")
                time.sleep(2)  # Rate limiting

        return results


def main():
    """Test the Instagram scraper"""
    scraper = InstagramScraper()

    # Test with known Greek life accounts
    test_accounts = [
        'sigmachiusc',      # USC Sigma Chi
        'sigmachiuga',      # UGA Sigma Chi
        'pennstatesigmachi' # Penn State Sigma Chi (example)
    ]

    logger.info("Testing Instagram scraper...\n")

    for username in test_accounts:
        profile = scraper.get_profile_info(username)

        if profile:
            logger.info(f"\n{'='*60}")
            logger.info(f"Username: @{profile.username}")
            logger.info(f"Full Name: {profile.full_name}")
            logger.info(f"Followers: {profile.followers:,}" if profile.followers else "Followers: N/A")
            logger.info(f"Posts: {profile.posts}" if profile.posts else "Posts: N/A")
            logger.info(f"{'='*60}\n")
        else:
            logger.warning(f"Failed to fetch profile for @{username}")

        time.sleep(3)  # Be respectful with rate limiting


if __name__ == '__main__':
    main()
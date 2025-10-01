#!/usr/bin/env python3
"""
Instagram Scraper using Selenium (Browser Automation)
This actually works because it uses a real browser
"""

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

import time
import re
from typing import Optional
from dataclasses import dataclass
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
    is_verified: bool = False
    is_private: bool = False


class InstagramSeleniumScraper:
    """Instagram scraper using Selenium for browser automation"""

    def __init__(self, headless: bool = True):
        if not SELENIUM_AVAILABLE:
            raise ImportError(
                "Selenium not installed. Run: pip install selenium\n"
                "Also install ChromeDriver: brew install chromedriver"
            )

        self.headless = headless
        self.driver = None

    def _init_driver(self):
        """Initialize Chrome driver"""
        chrome_options = Options()

        if self.headless:
            chrome_options.add_argument("--headless")

        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)

        # Random user agent
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

        self.driver = webdriver.Chrome(options=chrome_options)

    def get_profile_info(self, username: str) -> Optional[InstagramProfile]:
        """
        Gets Instagram profile information

        Args:
            username: Instagram username without @

        Returns:
            InstagramProfile object or None
        """
        username = username.lstrip('@')
        url = f"https://www.instagram.com/{username}/"

        logger.info(f"Fetching Instagram profile: @{username}")

        try:
            if not self.driver:
                self._init_driver()

            self.driver.get(url)
            time.sleep(3)  # Wait for page load

            # Check if profile exists
            if "Sorry, this page isn't available" in self.driver.page_source:
                logger.error(f"Profile @{username} not found")
                return None

            # Extract data from page
            profile = InstagramProfile(username=username)

            # Get stats from meta tags or header
            try:
                # Method 1: Try to get from header section
                stats_section = self.driver.find_elements(By.CSS_SELECTOR, "header section ul li")

                if len(stats_section) >= 3:
                    # Parse stats
                    posts_text = stats_section[0].find_element(By.CSS_SELECTOR, "span").text
                    followers_text = stats_section[1].find_element(By.CSS_SELECTOR, "span").get_attribute("title") or \
                                   stats_section[1].find_element(By.CSS_SELECTOR, "span").text
                    following_text = stats_section[2].find_element(By.CSS_SELECTOR, "span").text

                    profile.posts = self._parse_count(posts_text)
                    profile.followers = self._parse_count(followers_text)
                    profile.following = self._parse_count(following_text)

                # Get name and bio
                try:
                    name_element = self.driver.find_element(By.CSS_SELECTOR, "header section h2")
                    profile.full_name = name_element.text
                except:
                    pass

                try:
                    bio_element = self.driver.find_element(By.CSS_SELECTOR, "header section h1 + div")
                    profile.bio = bio_element.text
                except:
                    pass

            except Exception as e:
                logger.warning(f"Could not extract stats with Selenium: {str(e)}")

                # Fallback: Parse from page source
                page_source = self.driver.page_source

                # Look for follower count in various formats
                follower_patterns = [
                    r'"edge_followed_by":\{"count":(\d+)\}',
                    r'"follower_count":(\d+)',
                    r'(\d+(?:,\d+)*)\s+followers'
                ]

                for pattern in follower_patterns:
                    match = re.search(pattern, page_source, re.IGNORECASE)
                    if match:
                        profile.followers = self._parse_count(match.group(1))
                        break

            if profile.followers:
                logger.info(f"✓ Successfully scraped @{username}: {profile.followers:,} followers")
            else:
                logger.warning(f"⚠ Scraped @{username} but couldn't get follower count")

            return profile

        except Exception as e:
            logger.error(f"Error scraping @{username}: {str(e)}")
            return None

    def _parse_count(self, count_str: str) -> Optional[int]:
        """Parse follower/following/post counts"""
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

    def batch_scrape(self, usernames: list) -> dict:
        """Scrape multiple Instagram profiles"""
        results = {}

        for username in usernames:
            profile = self.get_profile_info(username)
            if profile:
                results[username] = profile
            time.sleep(2)  # Rate limiting

        return results

    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            self.driver = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def main():
    """Test the Selenium Instagram scraper"""

    if not SELENIUM_AVAILABLE:
        logger.error("\n" + "="*60)
        logger.error("Selenium not installed!")
        logger.error("="*60)
        logger.error("\nInstall with:")
        logger.error("  pip install selenium")
        logger.error("  brew install chromedriver  # macOS")
        logger.error("\nOr use Apify: https://apify.com/zuzka/instagram-scraper")
        logger.error("="*60 + "\n")
        return

    # Test accounts
    test_accounts = [
        'sigmachisc',       # Penn State Sigma Chi (your test)
        'sigmachiusc',      # USC Sigma Chi
        'sigmachiuga',      # UGA Sigma Chi
    ]

    logger.info("\n" + "="*60)
    logger.info("Testing Instagram Selenium Scraper")
    logger.info("="*60 + "\n")

    with InstagramSeleniumScraper(headless=True) as scraper:
        for username in test_accounts:
            profile = scraper.get_profile_info(username)

            if profile:
                logger.info(f"\n{'='*60}")
                logger.info(f"Username: @{profile.username}")
                logger.info(f"Full Name: {profile.full_name}")
                logger.info(f"Followers: {profile.followers:,}" if profile.followers else "Followers: N/A")
                logger.info(f"Following: {profile.following:,}" if profile.following else "Following: N/A")
                logger.info(f"Posts: {profile.posts}" if profile.posts else "Posts: N/A")
                logger.info(f"Bio: {profile.bio[:100]}..." if profile.bio else "Bio: N/A")
                logger.info(f"{'='*60}")

            time.sleep(3)


if __name__ == '__main__':
    main()
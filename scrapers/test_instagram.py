#!/usr/bin/env python3
"""Quick test of Instagram scraper with Penn State Sigma Chi"""

from instagram_scraper import InstagramScraper
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scraper = InstagramScraper()

# Test with the actual Penn State Sigma Chi handle
username = "sigmachisc"

logger.info(f"\n{'='*60}")
logger.info(f"Testing with Penn State Sigma Chi: @{username}")
logger.info(f"URL: https://www.instagram.com/{username}/")
logger.info(f"{'='*60}\n")

profile = scraper.get_profile_info(username)

if profile:
    logger.info(f"\n✅ SUCCESS!")
    logger.info(f"{'='*60}")
    logger.info(f"Username: @{profile.username}")
    logger.info(f"Full Name: {profile.full_name}")
    logger.info(f"Bio: {profile.bio}")
    logger.info(f"Followers: {profile.followers:,}" if profile.followers else "Followers: N/A")
    logger.info(f"Following: {profile.following:,}" if profile.following else "Following: N/A")
    logger.info(f"Posts: {profile.posts:,}" if profile.posts else "Posts: N/A")
    logger.info(f"{'='*60}\n")
else:
    logger.error(f"\n❌ FAILED to fetch @{username}")
    logger.error("Instagram scraping is difficult due to anti-bot measures")
    logger.error("\nRecommended solutions:")
    logger.error("1. Use Instagram Graph API (requires business account)")
    logger.error("2. Use Apify Instagram Scraper: https://apify.com/zuzka/instagram-scraper")
    logger.error("3. Use Selenium with browser automation")
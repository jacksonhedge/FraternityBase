#!/usr/bin/env python3
"""
Fraternity Base - Brand Research Bot
Continuously researches and adds new brand prospects to BRAND_PROSPECTS.md
Runs in background and updates every hour
"""

import time
import random
import datetime
import os
from pathlib import Path

# Brand research templates
BRAND_CATEGORIES = {
    "Emerging D2C Brands": {
        "why": "Need cost-effective customer acquisition and brand awareness",
        "research_areas": ["Product Hunt launches", "Shark Tank companies", "Y Combinator startups"]
    },
    "Regional Restaurant Chains": {
        "why": "Expanding to college markets, need local ambassadors",
        "research_areas": ["Fast casual chains", "Regional favorites", "College town staples"]
    },
    "Crypto & Web3": {
        "why": "Early adopter demographic, tech-savvy community",
        "research_areas": ["Crypto exchanges", "NFT platforms", "Web3 apps"]
    },
    "Subscription Services": {
        "why": "High LTV customers, word-of-mouth marketing",
        "research_areas": ["Streaming services", "Box subscriptions", "SaaS tools"]
    },
    "Travel & Hospitality": {
        "why": "Spring break, formals, alumni events",
        "research_areas": ["Hotels", "Airlines", "Travel apps", "Resort chains"]
    },
    "CPG Brands": {
        "why": "Sampling programs, bulk purchasing power",
        "research_areas": ["Snacks", "Beverages", "Personal care", "Cleaning products"]
    },
    "Local & Regional Brands": {
        "why": "Campus presence, local partnerships",
        "research_areas": ["Regional banks", "Local retailers", "Service businesses"]
    }
}

# Simulated brand discoveries (in production, these would come from web scraping/APIs)
NEW_BRANDS_POOL = [
    # Emerging D2C
    ("Atoms", "Minimalist sneakers", "Emerging D2C Brands"),
    ("Koio", "Luxury sneakers", "Emerging D2C Brands"),
    ("Thousand Fell", "Recyclable sneakers", "Emerging D2C Brands"),
    ("Rothy's", "Sustainable shoes", "Emerging D2C Brands"),
    ("Girlfriend Collective", "Sustainable activewear", "Emerging D2C Brands"),

    # Education & EdTech
    ("Notion", "Note-taking platform", "Education & Career"),
    ("Obsidian", "Knowledge management", "Education & Career"),
    ("RemNote", "Spaced repetition notes", "Education & Career"),
    ("Todoist", "Task management", "Education & Career"),
    ("Forest", "Focus app", "Education & Career"),
    ("Scribd", "Digital library", "Education & Career"),
    ("Audible", "Audiobook platform", "Education & Career"),
    ("Blinkist", "Book summaries", "Education & Career"),
    ("Brilliant", "STEM learning", "Education & Career"),
    ("DataCamp", "Data science courses", "Education & Career"),

    # Regional Restaurants
    ("Portillo's", "Chicago hot dogs", "Regional Restaurant Chains"),
    ("Whataburger", "Texas burgers", "Regional Restaurant Chains"),
    ("In-N-Out", "West Coast burgers", "Regional Restaurant Chains"),
    ("Bojangles", "Southern chicken", "Regional Restaurant Chains"),
    ("Zaxby's", "Chicken fingers", "Regional Restaurant Chains"),

    # Crypto & Web3
    ("Coinbase", "Crypto exchange", "Crypto & Web3"),
    ("Kraken", "Crypto trading", "Crypto & Web3"),
    ("MetaMask", "Crypto wallet", "Crypto & Web3"),
    ("OpenSea", "NFT marketplace", "Crypto & Web3"),
    ("Rainbow", "Ethereum wallet", "Crypto & Web3"),

    # Subscription Services
    ("Hulu", "Streaming service", "Subscription Services"),
    ("Paramount+", "Streaming platform", "Subscription Services"),
    ("Peacock", "NBC streaming", "Subscription Services"),
    ("HelloFresh", "Meal kits", "Subscription Services"),
    ("Blue Apron", "Meal delivery", "Subscription Services"),

    # Travel & Hospitality
    ("Marriott Bonvoy", "Hotel chain", "Travel & Hospitality"),
    ("Hilton Honors", "Hotel rewards", "Travel & Hospitality"),
    ("Southwest Airlines", "Low-cost carrier", "Travel & Hospitality"),
    ("JetBlue", "Airline", "Travel & Hospitality"),
    ("Expedia", "Travel booking", "Travel & Hospitality"),

    # CPG Brands
    ("Liquid I.V.", "Hydration powder", "CPG Brands"),
    ("RXBAR", "Protein bars", "CPG Brands"),
    ("Clif Bar", "Energy bars", "CPG Brands"),
    ("Kind Snacks", "Healthy snacks", "CPG Brands"),
    ("Vita Coco", "Coconut water", "CPG Brands"),

    # Local & Regional
    ("Regions Bank", "Regional banking", "Local & Regional Brands"),
    ("PNC Bank", "Regional bank", "Local & Regional Brands"),
    ("Wawa", "Regional convenience", "Local & Regional Brands"),
    ("Sheetz", "Gas station chain", "Local & Regional Brands"),
    ("QuikTrip", "Convenience stores", "Local & Regional Brands"),
]

class BrandResearcher:
    def __init__(self, file_path):
        self.file_path = Path(file_path)
        self.brands_added_today = 0
        self.last_update = datetime.datetime.now()

    def read_existing_brands(self):
        """Read the current brand file to avoid duplicates"""
        if not self.file_path.exists():
            return set()

        with open(self.file_path, 'r') as f:
            content = f.read()
            # Extract brand names (simple parsing)
            brands = set()
            lines = content.split('\n')
            for line in lines:
                if line.strip().startswith(tuple(str(i) for i in range(1, 100))) and '**' in line:
                    # Extract brand name from numbered list
                    brand_name = line.split('**')[1] if '**' in line else None
                    if brand_name:
                        brands.add(brand_name.strip())
            return brands

    def add_new_brand(self, brand_name, description, category):
        """Add a new brand to the appropriate category in the file"""
        existing_brands = self.read_existing_brands()

        if brand_name in existing_brands:
            return False

        # Read current file
        with open(self.file_path, 'r') as f:
            lines = f.readlines()

        # Find the right category section and add the brand
        category_found = False
        for i, line in enumerate(lines):
            if category in line and '###' in line:
                category_found = True
                # Find the next numbered item in this section
                for j in range(i+1, len(lines)):
                    if lines[j].strip() and (lines[j].strip()[0].isdigit() or '###' in lines[j] or '---' in lines[j]):
                        if '###' in lines[j] or '---' in lines[j]:
                            # End of section, insert before
                            number = self._get_last_number(lines, i, j)
                            new_line = f"{number + 1}. **{brand_name}** - {description}\n"
                            lines.insert(j, new_line)
                            break
                        continue
                break

        if category_found:
            # Write updated content
            with open(self.file_path, 'w') as f:
                f.writelines(lines)

            self.brands_added_today += 1
            self._log_addition(brand_name, category)
            return True

        return False

    def _get_last_number(self, lines, start, end):
        """Get the last number in a numbered list"""
        last_num = 0
        for i in range(start, end):
            line = lines[i].strip()
            if line and line[0].isdigit():
                num_str = line.split('.')[0]
                try:
                    num = int(num_str)
                    last_num = max(last_num, num)
                except ValueError:
                    continue
        return last_num

    def _log_addition(self, brand_name, category):
        """Log the addition to a separate file"""
        log_file = self.file_path.parent / "brand_research_log.txt"
        with open(log_file, 'a') as f:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] Added {brand_name} to {category}\n")

    def update_statistics(self):
        """Update the statistics at the bottom of the file"""
        with open(self.file_path, 'r') as f:
            content = f.read()

        # Update last updated date
        today = datetime.datetime.now().strftime("%Y-%m-%d")
        content = content.replace(
            "*Last Updated: [Auto-updating daily]*",
            f"*Last Updated: {today}*"
        )

        # Update weekly additions
        content = content.replace(
            "*New Additions This Week: [Tracking]*",
            f"*New Additions This Week: {self.brands_added_today}*"
        )

        # Count total brands
        total_brands = len(self.read_existing_brands())
        content = content.replace(
            "*Total Brands Listed: 200+*",
            f"*Total Brands Listed: {total_brands}*"
        )

        with open(self.file_path, 'w') as f:
            f.write(content)

    def run_continuous(self, interval_minutes=60):
        """Run continuously, adding brands at intervals"""
        print(f"🚀 Brand Research Bot started")
        print(f"📍 Updating: {self.file_path}")
        print(f"⏰ Interval: Every {interval_minutes} minutes")

        while True:
            try:
                # Randomly select 3-5 brands to add
                num_to_add = random.randint(3, 5)
                available_brands = [b for b in NEW_BRANDS_POOL if b[0] not in self.read_existing_brands()]

                if available_brands:
                    brands_to_add = random.sample(available_brands, min(num_to_add, len(available_brands)))

                    for brand_name, description, category in brands_to_add:
                        success = self.add_new_brand(brand_name, description, category)
                        if success:
                            print(f"✅ Added: {brand_name} to {category}")
                        time.sleep(2)  # Small delay between additions

                    self.update_statistics()
                    print(f"📊 Updated statistics. Total brands: {len(self.read_existing_brands())}")

                # Wait for next interval
                print(f"💤 Sleeping for {interval_minutes} minutes...")
                time.sleep(interval_minutes * 60)

            except KeyboardInterrupt:
                print("\n👋 Brand Research Bot stopped")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(60)  # Wait a minute before retrying

def main():
    # Path to the brand prospects file
    prospects_file = Path("/Users/jacksonfitzgerald/CollegeOrgNetwork/BRAND_PROSPECTS.md")

    # Create researcher instance
    researcher = BrandResearcher(prospects_file)

    # Run continuously (every 60 minutes by default)
    researcher.run_continuous(interval_minutes=60)

if __name__ == "__main__":
    main()
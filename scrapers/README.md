# Greek Life Data Scraper System

Comprehensive scraping system for collecting Division 1 fraternity and sorority data.

## 🎯 What It Does

1. **College Scraper** - Scrapes university Greek life pages for chapter lists
2. **Instagram Scraper** - Gets follower counts and profile info
3. **LinkedIn Scraper** - Finds member profiles and officer information
4. **Master Scraper** - Orchestrates all scrapers and exports data

## 📦 Installation

```bash
cd scrapers
pip3 install -r requirements.txt
```

## 🚀 Quick Start

### Test Individual Scrapers

```bash
# Test college scraper
python3 college_scraper.py

# Test Instagram scraper
python3 instagram_scraper.py

# Test LinkedIn scraper (requires API key)
export PROXYCURL_API_KEY=your_key
python3 linkedin_scraper.py
```

### Run Full Pipeline

```bash
# Basic: College + Instagram data only
python3 master_scraper.py

# With LinkedIn (requires Proxycurl API key)
export PROXYCURL_API_KEY=your_key
python3 master_scraper.py
```

## 📊 Output

The scraper generates:

1. **JSON File** - Complete data dump
   - `../data/scraped/greek_life_data_TIMESTAMP.json`

2. **SQL File** - Ready to import to database
   - `../data/scraped/greek_life_import_TIMESTAMP.sql`

3. **CSV File** - Summary spreadsheet
   - `../data/scraped/chapters_summary_TIMESTAMP.csv`

4. **Log File** - Detailed scraping log
   - `scraper_log_TIMESTAMP.log`

## 🏗️ Architecture

### college_scraper.py
- Scrapes university Greek life office websites
- Extracts chapter names, types (fraternity/sorority)
- Finds chapter websites, addresses
- Currently supports 10 major D1 schools (expandable)

### instagram_scraper.py
- Searches for Instagram handles using common patterns
- Gets follower counts, post counts
- Handles K/M/B notation (1.5M followers → 1,500,000)
- Rate limited to avoid blocking

### linkedin_scraper.py
- **Requires Proxycurl API** (https://nubela.co/proxycurl/)
- Finds member profiles by school + fraternity
- Identifies chapter officers (President, VP, Treasurer)
- Cost: ~$0.01 per profile lookup

### master_scraper.py
- Runs all scrapers in sequence
- Combines data from all sources
- Exports to multiple formats
- Generates summary statistics

## 🔑 API Keys

### Instagram
- **Option 1**: Use built-in HTML scraping (free, fragile)
- **Option 2**: Instagram Graph API (requires business account)
- **Recommended**: Apify Instagram Scraper ($49/month)

### LinkedIn
- **Required**: Proxycurl API key
- Sign up: https://nubela.co/proxycurl/
- Pricing: ~$0.01 per profile, $100/month minimum
- Alternative: PhantomBuster ($30/month)

## 📝 Configuration

### Add More Schools

Edit `college_scraper.py` and add to `get_d1_schools()`:

```python
{
    'name': 'University of XYZ',
    'state': 'XX',
    'city': 'City Name',
    'greek_life_url': 'https://xyz.edu/greek-life'
}
```

### Customize Instagram Search

Edit `instagram_scraper.py` → `search_instagram_handles()` to add patterns:

```python
potential_handles = [
    f"{chapter_clean}{college_clean}",
    f"{chapter_clean}_official",
    # Add your patterns here
]
```

## 🎯 Target Data

For each chapter, we collect:

- **Basic Info**
  - Name (e.g., "Sigma Chi")
  - College/University
  - Chapter type (fraternity/sorority)
  - Founded year
  - Member count

- **Contact**
  - Address
  - Email
  - Phone
  - Website

- **Social Media**
  - Instagram handle
  - Instagram followers
  - Instagram post count

- **LinkedIn**
  - Officer names
  - Officer LinkedIn profiles
  - Member connections

## 🚧 Limitations

1. **Website Structure Varies**
   - Each university's Greek life page is different
   - Scraper may need manual adjustments per school
   - Some schools don't publicly list chapters

2. **Instagram Anti-Scraping**
   - Instagram blocks aggressive scraping
   - Rate limits required (2-3 seconds between requests)
   - May need rotating proxies for large scale

3. **LinkedIn Restrictions**
   - Scraping LinkedIn directly violates TOS
   - Must use Proxycurl API (costs money)
   - Some profiles are private

4. **Data Accuracy**
   - Follower counts change daily
   - Chapter status may be outdated
   - Member lists require manual verification

## 📈 Scaling Up

### To scrape all 363 D1 schools:

1. **Get full list of D1 schools**
   ```bash
   # NCAA provides this data
   wget https://www.ncaa.org/schools/division-i
   ```

2. **Find Greek life URLs**
   - Google search: "[school name] greek life"
   - Common patterns: `/greek-life`, `/fraternity-sorority-life`, `/fsl`

3. **Run in batches**
   ```python
   # Process 50 schools at a time
   for i in range(0, len(schools), 50):
       batch = schools[i:i+50]
       scraper.scrape_batch(batch)
       time.sleep(300)  # 5 minute break between batches
   ```

4. **Use proxies**
   - Residential proxies: Bright Data, Oxylabs
   - Cost: ~$500/month for unlimited
   - Prevents IP blocking

## 🔍 Data Quality

After scraping, you should:

1. **Manual Review** - Spot check 10% of data
2. **Deduplicate** - Remove duplicate chapters
3. **Verify Socials** - Confirm Instagram handles are correct
4. **Enrich** - Add missing data manually for top schools
5. **Update** - Re-scrape quarterly to keep current

## 💡 Pro Tips

1. **Start Small** - Test with 5-10 schools first
2. **Rate Limit** - 2-3 second delays between requests
3. **Use APIs** - Pay for Proxycurl/Apify for reliability
4. **Backup** - Save raw HTML before parsing
5. **Log Everything** - Track successes and failures

## 🤝 Contributing

To add new scrapers:

1. Create `new_scraper.py`
2. Follow existing structure (dataclasses, logging)
3. Add to `master_scraper.py` pipeline
4. Update this README

## 📞 Support

- Proxycurl docs: https://nubela.co/proxycurl/docs
- Apify Instagram: https://apify.com/zuzka/instagram-scraper
- BeautifulSoup docs: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
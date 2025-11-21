# Sigma Chi Chapter Scraper Guide

This guide explains how to use the automated Sigma Chi chapter scraper to pull fresh data from the Sigma Chi members portal into your FraternityBase database.

## Overview

The scraper uses **Playwright** (browser automation) to:
1. Log into the Sigma Chi members portal
2. Navigate to the chapter directory
3. Extract all chapter data (names, locations, Greek letters, contact info, etc.)
4. Import the data into your Supabase database

## Prerequisites

- Node.js and npm installed
- Access to Sigma Chi members portal (login credentials)
- Supabase credentials configured in `.env` file

## Environment Variables

Add these to your `.env` file (optional but recommended):

```bash
# Sigma Chi Portal Credentials (optional - can enter manually)
SIGMA_CHI_USERNAME=your_username_here
SIGMA_CHI_PASSWORD=your_password_here

# Supabase (required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Installation

The scraper dependencies are already installed, but if you need to reinstall:

```bash
cd backend
npm install
npx playwright install chromium
```

## Usage

### 1. First Time Setup - View the Portal

Run the scraper in **visible mode** (browser window opens) to see what's happening:

```bash
npm run scrape:sigmachi
```

This will:
- Prompt you for username/password (if not in .env)
- Open a Chrome browser window
- Log into the portal
- Navigate to the chapter directory
- Take a screenshot: `sigma-chi-chapters-page.png`
- Save page source: `sigma-chi-page-source.html`

**IMPORTANT**: The first time you run this, the scraper will NOT extract data automatically. It will save the page source so you can inspect the HTML structure and customize the selectors.

### 2. Customize the Scraper

After the first run:

1. Open `sigma-chi-page-source.html` in your browser
2. Inspect the HTML structure to find chapter data
3. Edit `scripts/scrape-sigma-chi.ts` and update the `scrapeChapterData()` function with the correct selectors

Example customization:

```typescript
// Find the chapter elements (inspect HTML to find correct selector)
const chapterElements = await page.$$('.chapter-row, .chapter-item, tr.chapter');

for (const element of chapterElements) {
  const chapterData: ChapterData = {
    chapterName: await element.$eval('.chapter-name', el => el.textContent?.trim() || ''),
    greekLetters: await element.$eval('.greek-letters', el => el.textContent?.trim()),
    university: await element.$eval('.university', el => el.textContent?.trim() || ''),
    city: await element.$eval('.city', el => el.textContent?.trim()),
    state: await element.$eval('.state', el => el.textContent?.trim()),
    // ... add more fields based on available data
  };
  chapters.push(chapterData);
}
```

### 3. Test Data Extraction

After customizing, run again to test data extraction:

```bash
npm run scrape:sigmachi -- --export=chapters.json
```

This will save the extracted data to `chapters.json` for review before importing to the database.

### 4. Import to Database

Once you've verified the data looks good:

```bash
npm run scrape:sigmachi:import
```

Or with all options:

```bash
npm run scrape:sigmachi -- --import --export=chapters.json
```

### 5. Headless Mode (Production)

For automated runs (no browser window):

```bash
npm run scrape:sigmachi:headless -- --import
```

## Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--headless` | Run without opening browser window | `--headless` |
| `--import` | Import scraped data to database | `--import` |
| `--export=FILE` | Export scraped data to JSON file | `--export=data.json` |
| `--username=USER` | Provide username via CLI | `--username=myuser` |
| `--password=PASS` | Provide password via CLI | `--password=mypass` |

## Common Commands

```bash
# Interactive mode - see browser, enter credentials
npm run scrape:sigmachi

# Export data to JSON only (no database import)
npm run scrape:sigmachi -- --export=chapters.json

# Scrape and import to database
npm run scrape:sigmachi -- --import

# Headless mode with import (for automation)
npm run scrape:sigmachi -- --headless --import

# Full automation with credentials from .env
npm run scrape:sigmachi -- --headless --import --export=backup.json
```

## Scheduling Automated Runs

### Option 1: Cron Job (Mac/Linux)

Add to your crontab (`crontab -e`):

```bash
# Run every semester on the 15th of January and August at 2 AM
0 2 15 1,8 * cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend && npm run scrape:sigmachi:headless -- --import
```

### Option 2: GitHub Actions (if repo is on GitHub)

Create `.github/workflows/scrape-sigmachi.yml`:

```yaml
name: Scrape Sigma Chi Data

on:
  schedule:
    - cron: '0 2 15 1,8 *'  # January 15 and August 15 at 2 AM
  workflow_dispatch:  # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm install
          npx playwright install chromium
      - name: Run scraper
        env:
          SIGMA_CHI_USERNAME: ${{ secrets.SIGMA_CHI_USERNAME }}
          SIGMA_CHI_PASSWORD: ${{ secrets.SIGMA_CHI_PASSWORD }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          cd backend
          npm run scrape:sigmachi -- --headless --import
```

## Troubleshooting

### Login Issues

If login fails:
1. Check credentials are correct
2. Check if portal requires 2FA (may need to disable or use app password)
3. Run in visible mode (`npm run scrape:sigmachi`) to see what's happening
4. Check if portal has CAPTCHA (may need manual intervention)

### Selector Issues

If data isn't extracting correctly:
1. Inspect `sigma-chi-page-source.html`
2. Update selectors in `scrapeChapterData()` function
3. Test with `--export` flag to verify data before importing

### Database Issues

If import fails:
1. Verify Supabase credentials in `.env`
2. Check database has `greek_organizations`, `universities`, and `chapters` tables
3. Check for unique constraint violations (duplicate chapters)

## Data Mapping

The scraper maps Sigma Chi data to your database schema:

| Sigma Chi Field | Database Field | Table |
|-----------------|----------------|-------|
| Chapter Name | `chapter_name` | `chapters` |
| Greek Letters | `greek_letters` | `chapters` |
| University | `name` | `universities` |
| City | `city` | `chapters` |
| State | `state_province` | `chapters` |
| Charter Date | `charter_date` | `chapters` |
| Website | `website_url` | `chapters` |
| Email | `contact_email` | `chapters` |
| Phone | `phone` | `chapters` |
| Address | `house_address` | `chapters` |
| Instagram | `instagram_handle` | `chapters` |
| Facebook | `facebook_page` | `chapters` |
| Twitter | `twitter_handle` | `chapters` |

## Best Practices

1. **Run manually first** - Always run in visible mode the first time to verify everything works
2. **Export before import** - Use `--export` to save a backup of scraped data
3. **Test on subset** - Modify script to limit to 10 chapters for initial testing
4. **Schedule wisely** - Run during low-traffic hours (early morning)
5. **Monitor results** - Check import statistics after each run
6. **Keep credentials secure** - Never commit `.env` file to git

## Next Steps

After successful scraping:
- Check database for imported chapters
- Verify data accuracy
- Set up automated scheduling
- Document any custom portal-specific quirks
- Consider adding email notifications for scrape results

## Support

For issues or questions:
1. Check this guide
2. Inspect the page source and screenshots
3. Review the script code in `scripts/scrape-sigma-chi.ts`
4. Test incrementally with visible browser mode

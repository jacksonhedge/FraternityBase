# Sigma Chi Scraper - Quick Start

## Ready to Run!

Everything is set up! Here's how to get started:

## Step 1: First Run (Testing)

Open a browser window and test the scraper:

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run scrape:sigmachi
```

You'll be prompted for your Sigma Chi portal credentials. The browser will open and you'll see it:
- Log into the portal
- Navigate to the chapter directory
- Take a screenshot
- Save the page source

## Step 2: Customize Data Extraction

After the first run, you need to customize the scraper to match the portal's HTML structure:

1. Open the generated files:
   - `sigma-chi-chapters-page.png` - Visual screenshot
   - `sigma-chi-page-source.html` - Full HTML source

2. Identify the HTML structure for chapter data

3. Edit `scripts/scrape-sigma-chi.ts` around line 172 in the `scrapeChapterData()` function

4. Update the selectors to match the portal's structure

## Step 3: Test Data Export

After customizing, test that data is extracting correctly:

```bash
npm run scrape:sigmachi -- --export=test-chapters.json
```

Review `test-chapters.json` to verify the data looks good.

## Step 4: Import to Database

Once verified, import to your database:

```bash
npm run scrape:sigmachi -- --import
```

## Automated Semester Runs

For hands-free operation every semester:

```bash
# Add to your .env file:
SIGMA_CHI_USERNAME=your_username
SIGMA_CHI_PASSWORD=your_password

# Then run in headless mode:
npm run scrape:sigmachi -- --headless --import
```

## Full Documentation

See `SIGMA_CHI_SCRAPER_GUIDE.md` for complete documentation including:
- Detailed customization instructions
- Scheduling automated runs
- Troubleshooting
- Command line options
- Best practices

## What Gets Imported?

The scraper will:
1. Create/update the Sigma Chi organization in `greek_organizations`
2. Create any missing universities in `universities`
3. Create new chapters or update existing ones in `chapters`
4. Map all available data fields (name, location, Greek letters, contact info, social media, etc.)

## Need Help?

1. Read `SIGMA_CHI_SCRAPER_GUIDE.md` for detailed instructions
2. Check the screenshots and HTML source from your test run
3. The scraper is designed to be customized - the portal structure may change over time
4. Run in visible mode (not headless) to debug issues

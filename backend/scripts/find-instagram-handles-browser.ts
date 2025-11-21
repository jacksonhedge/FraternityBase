/**
 * Instagram Handle Finder - Browser Automation Version
 *
 * Uses Playwright to search Google for Instagram handles
 */

import { chromium } from 'playwright-extra';
import type { Page } from 'playwright';
import stealth from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import 'dotenv/config';

// Add stealth plugin
chromium.use(stealth());

interface ChapterRow {
  College: string;
  Fraternity: string;
  'Instagram Handle': string;
  State: string;
  'Instagram URL': string;
  Followers: string;
}

const DELAY_BETWEEN_SEARCHES = 3000; // 3 seconds between searches
const BATCH_SAVE_SIZE = 25; // Save every 25 searches

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchGoogleForInstagram(page: Page, college: string, fraternity: string): Promise<{ handle: string; url: string } | null> {
  try {
    const searchQuery = `${college} ${fraternity} Instagram`;
    const googleURL = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

    // Navigate to Google search
    await page.goto(googleURL, { waitUntil: 'networkidle', timeout: 15000 });

    // Wait a bit for results to load
    await delay(2000);

    // Extract Instagram links from search results
    const instagramLinks = await page.$$eval('a[href*="instagram.com"]', (links) => {
      return links
        .map(link => link.getAttribute('href'))
        .filter(href => href && href.includes('instagram.com'))
        .filter(href => !href.includes('/explore/') && !href.includes('/reel/') && !href.includes('/p/'))
        .map(href => {
          // Clean up Google redirect URLs
          if (href?.startsWith('/url?q=')) {
            const match = href.match(/\/url\?q=([^&]+)/);
            return match ? decodeURIComponent(match[1]) : href;
          }
          return href;
        });
    });

    // Find first valid Instagram profile URL
    for (const link of instagramLinks) {
      if (!link) continue;

      const match = link.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      if (match && match[1]) {
        const username = match[1].replace(/\/$/, '');
        // Filter out invalid usernames
        if (!username.includes('?') && !username.includes('&') && username.length > 0) {
          return {
            handle: `@${username}`,
            url: `https://www.instagram.com/${username}/`
          };
        }
      }
    }

    return null;
  } catch (error: any) {
    console.error(`  ❌ Search error: ${error.message}`);
    return null;
  }
}

async function main() {
  const inputPath = '/Users/jacksonfitzgerald/Downloads/Instagram FRATS - Instagram_FRATS_Master_GoogleSheets (1).csv';
  const outputPath = '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/instagram-handles-updated.csv';
  const progressPath = '/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/instagram-progress.json';

  console.log(`\n📊 Instagram Handle Finder (Browser Automation)\n`);

  // Read CSV
  console.log(`📂 Reading CSV: ${inputPath}`);
  const fileContent = fs.readFileSync(inputPath, 'utf-8');
  const rows: ChapterRow[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`✅ Loaded ${rows.length} chapters\n`);

  // Count missing
  const missingCount = rows.filter(r => !r['Instagram Handle'] || r['Instagram Handle'].trim() === '').length;
  console.log(`📋 Already have Instagram: ${rows.length - missingCount}`);
  console.log(`🔍 Missing Instagram: ${missingCount}\n`);

  if (missingCount === 0) {
    console.log(`✅ All chapters already have Instagram data!`);
    return;
  }

  // Load progress if exists
  let processedIndices = new Set<number>();
  if (fs.existsSync(progressPath)) {
    const progress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
    processedIndices = new Set(progress.processed || []);
    console.log(`♻️  Resuming from previous run - ${processedIndices.size} already processed\n`);
  }

  // Launch browser with stealth settings
  console.log(`🚀 Launching browser with stealth mode...`);
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ]
  });

  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  // Set additional headers to look more human
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });

  let processed = 0;
  let found = 0;
  let notFound = 0;

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Skip if already processed
      if (processedIndices.has(i)) {
        continue;
      }

      // Skip if already has Instagram
      if (row['Instagram Handle'] && row['Instagram Handle'].trim() !== '') {
        processedIndices.add(i);
        continue;
      }

      console.log(`\n[${i + 1}/${rows.length}] ${row.College} - ${row.Fraternity}`);
      console.log('='.repeat(80));

      const result = await searchGoogleForInstagram(page, row.College, row.Fraternity);

      if (result) {
        row['Instagram Handle'] = result.handle;
        row['Instagram URL'] = result.url;
        found++;
        console.log(`  ✅ Found: ${result.handle}`);
      } else {
        notFound++;
        console.log(`  ⚠️  Not found`);
      }

      processed++;
      processedIndices.add(i);

      // Save progress periodically
      if (processed % BATCH_SAVE_SIZE === 0) {
        console.log(`\n💾 Saving progress... (${processed} new searches)`);

        // Save CSV
        const output = stringify(rows, { header: true });
        fs.writeFileSync(outputPath, output);

        // Save progress
        fs.writeFileSync(progressPath, JSON.stringify({
          processed: Array.from(processedIndices),
          timestamp: new Date().toISOString()
        }));
      }

      // Delay between searches
      await delay(DELAY_BETWEEN_SEARCHES);
    }

    // Final save
    console.log(`\n💾 Saving final results...`);
    const output = stringify(rows, { header: true });
    fs.writeFileSync(outputPath, output);

    // Clean up progress file
    if (fs.existsSync(progressPath)) {
      fs.unlinkSync(progressPath);
    }

  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Final Summary');
  console.log('='.repeat(80));
  console.log(`Total chapters: ${rows.length}`);
  console.log(`Already had Instagram: ${rows.length - missingCount}`);
  console.log(`Searched: ${processed}`);
  console.log(`✅ Found: ${found}`);
  console.log(`⚠️  Not found: ${notFound}`);
  console.log(`\n📁 Updated CSV saved to: ${outputPath}\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

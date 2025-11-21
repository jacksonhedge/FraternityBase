/**
 * Test Instagram Search - Debug Version
 * Tests a single search to see what Google returns
 */

import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

async function testSearch() {
  console.log('🔍 Testing Instagram Search\n');

  const browser = await chromium.launch({
    headless: false, // Show browser so we can see what's happening
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

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  });

  // Test with a well-known chapter
  const college = "University of Michigan";
  const fraternity = "Sigma Chi";

  const searchQuery = `${college} ${fraternity} Instagram`;
  const bingURL = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`;

  console.log(`🔎 Searching: ${searchQuery}`);
  console.log(`🔗 URL: ${bingURL}\n`);

  try {
    await page.goto(bingURL, { waitUntil: 'networkidle', timeout: 15000 });

    console.log('✅ Page loaded\n');

    // Wait for search results to fully render
    await page.waitForSelector('#b_results', { timeout: 10000 });

    // Scroll down to trigger lazy-loaded content
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);

    // Wait a bit more for results
    await page.waitForTimeout(2000);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'bing-search-debug.png', fullPage: true });
    console.log('📸 Screenshot saved to: bing-search-debug.png\n');

    // Try to find all links
    const allLinks = await page.$$eval('a', (links) => {
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent?.substring(0, 100)
      }));
    });

    console.log(`📊 Found ${allLinks.length} total links\n`);

    // Filter for Instagram links
    const instagramLinks = allLinks.filter(link =>
      link.href && link.href.includes('instagram.com')
    );

    console.log(`🎯 Instagram links found: ${instagramLinks.length}\n`);

    if (instagramLinks.length > 0) {
      console.log('Instagram links:');
      instagramLinks.forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.href}`);
        console.log(`     Text: ${link.text?.substring(0, 50)}...\n`);
      });
    } else {
      console.log('⚠️  No Instagram links found');
      console.log('\nFirst 10 links found:');
      allLinks.slice(0, 10).forEach((link, i) => {
        console.log(`  ${i + 1}. ${link.href}`);
      });
    }

    // Get page HTML to see structure
    const html = await page.content();
    const hasInstagram = html.includes('instagram.com');
    console.log(`\n📄 Page HTML includes "instagram.com": ${hasInstagram}`);

    // Keep browser open for 30 seconds so we can inspect
    console.log('\n⏸️  Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testSearch().catch(console.error);

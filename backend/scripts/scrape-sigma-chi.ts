/**
 * Sigma Chi Chapter Scraper
 *
 * This script uses Playwright to scrape chapter data from the Sigma Chi members portal.
 * It logs in with credentials, navigates to the chapter directory, and extracts all
 * chapter information.
 *
 * Usage:
 *   npm run scrape:sigmachi -- --headless        # Run in headless mode
 *   npm run scrape:sigmachi -- --import          # Scrape and import to database
 *   npm run scrape:sigmachi -- --export=data.json # Export to JSON file
 */

import { chromium, Browser, Page } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Member detail interface
interface MemberDetail {
  firstName: string;
  lastName: string;
  fullName: string;
  chapterGreekLetters: string;
  memberType: string; // Undergrad or Alumni
  status: string; // Active or Chapter Eternal
  email: string;
  phone: string;
  // Detail page fields
  initiationDate?: string;
  initiatingChapter?: string;
  graduationYear?: string;
  birthday?: string;
  cellPhone?: string;
  mailingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  schoolWorkAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

// Chapter data interface
interface ChapterData {
  chapterName: string;
  greekLetters?: string;
  university: string;
  city?: string;
  state?: string;
  country?: string;
  province?: string;
  charterDate?: string;
  status?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  officers?: Array<{
    name: string;
    position: string;
    email?: string;
  }>;
  members?: MemberDetail[]; // Array of member details
}

interface ImportStats {
  totalChapters: number;
  chaptersCreated: number;
  chaptersUpdated: number;
  chaptersSkipped: number;
  universitiesCreated: number;
  errors: number;
}

const stats: ImportStats = {
  totalChapters: 0,
  chaptersCreated: 0,
  chaptersUpdated: 0,
  chaptersSkipped: 0,
  universitiesCreated: 0,
  errors: 0
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    headless: args.includes('--headless'),
    import: args.includes('--import'),
    export: args.find(arg => arg.startsWith('--export='))?.split('=')[1] || null,
    chapter: args.find(arg => arg.startsWith('--chapter='))?.split('=')[1] || 'Alpha Chi',
    university: args.find(arg => arg.startsWith('--university='))?.split('=')[1] || 'Penn State University',
    username: args.find(arg => arg.startsWith('--username='))?.split('=')[1] || process.env.SIGMA_CHI_USERNAME,
    password: args.find(arg => arg.startsWith('--password='))?.split('=')[1] || process.env.SIGMA_CHI_PASSWORD,
  };
}

// Prompt for credentials
async function promptCredentials(): Promise<{ username: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Sigma Chi Portal Username: ', (username) => {
      rl.question('Sigma Chi Portal Password: ', (password) => {
        rl.close();
        resolve({ username, password });
      });
    });
  });
}

// Login to Sigma Chi portal
async function login(page: Page, username: string, password: string): Promise<boolean> {
  try {
    console.log('🔐 Navigating to Sigma Chi portal...');
    await page.goto('https://portal.sigmachi.org/', { waitUntil: 'networkidle' });

    // Save screenshot of login page
    await page.screenshot({ path: 'sigma-chi-login-page.png', fullPage: true });
    console.log('📸 Login page screenshot saved to sigma-chi-login-page.png');

    // Save login page HTML
    const loginPageContent = await page.content();
    fs.writeFileSync('sigma-chi-login-page.html', loginPageContent);
    console.log('📄 Login page HTML saved to sigma-chi-login-page.html');

    console.log('🔐 Waiting for login form to load...');

    // Wait for Salesforce login form to load
    await page.waitForSelector('input[placeholder="Username"]', { timeout: 15000 });
    await page.waitForTimeout(1000); // Give time for JavaScript to fully initialize

    console.log('🔐 Entering username...');
    // Use placeholder selector for Salesforce login
    await page.fill('input[placeholder="Username"]', username);

    console.log('🔐 Entering password...');
    await page.fill('input[placeholder="Password"]', password);

    console.log('🔐 Clicking login button...');
    // Click the "Log in" button (Salesforce specific)
    await page.click('button:has-text("Log in")');

    console.log('⏳ Waiting for login to complete...');
    // Wait for navigation after login
    await page.waitForTimeout(5000); // Give Salesforce time to process login

    // Wait for navigation after login
    await page.waitForLoadState('networkidle');

    // Check if login was successful
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('signin')) {
      console.error('❌ Login failed - still on login page');
      return false;
    }

    console.log('✅ Successfully logged in!');
    return true;

  } catch (error) {
    console.error('❌ Login error:', error);
    return false;
  }
}

// Scrape detail page for an individual member
async function scrapeMemberDetail(page: Page, memberName: string): Promise<Partial<MemberDetail>> {
  const details: Partial<MemberDetail> = {};

  try {
    console.log(`   📄 Scraping details for ${memberName}...`);

    // Wait for detail page to load
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});

    // Save screenshot of detail page
    await page.screenshot({ path: `member-detail-${Date.now()}.png`, fullPage: true });

    // Extract detail page fields
    // These are typically in a Salesforce Lightning record detail layout
    const fieldSelectors = {
      initiationDate: ['Initiation Date', 'Date of Initiation'],
      initiatingChapter: ['Initiating Chapter', 'Chapter Initiated'],
      graduationYear: ['Graduation Year', 'Expected Graduation'],
      birthday: ['Birthday', 'Date of Birth', 'Birth Date'],
      cellPhone: ['Cell Phone', 'Mobile Phone', 'Phone'],
      mailingAddress: ['Mailing Address', 'Home Address', 'Address'],
      schoolWorkAddress: ['Other/School/Work Address', 'School Address', 'Work Address']
    };

    // Use JavaScript to extract all visible field labels and values
    const fieldData = await page.evaluate(() => {
      const fields: Record<string, string> = {};

      // Look for Salesforce Lightning record detail fields
      // These are usually in divs with specific SLDS classes
      const fieldElements = document.querySelectorAll('.slds-form-element, .slds-form__row, [data-field-label]');

      fieldElements.forEach(element => {
        // Try to find label and value
        const label = element.querySelector('.slds-form-element__label, .slds-text-title, label');
        const value = element.querySelector('.slds-form-element__control, .slds-form-element__static, output, lightning-formatted-text');

        if (label && value) {
          const labelText = label.textContent?.trim() || '';
          const valueText = value.textContent?.trim() || '';
          if (labelText && valueText) {
            fields[labelText] = valueText;
          }
        }
      });

      // Also try to get fields from dl/dt/dd structure (common in Salesforce)
      const dlElements = document.querySelectorAll('dl');
      dlElements.forEach(dl => {
        const dts = dl.querySelectorAll('dt');
        const dds = dl.querySelectorAll('dd');
        dts.forEach((dt, index) => {
          if (dds[index]) {
            const labelText = dt.textContent?.trim() || '';
            const valueText = dds[index].textContent?.trim() || '';
            if (labelText && valueText) {
              fields[labelText] = valueText;
            }
          }
        });
      });

      return fields;
    });

    console.log(`   📋 Found ${Object.keys(fieldData).length} fields on detail page`);

    // Map the extracted fields to our interface
    for (const [label, value] of Object.entries(fieldData)) {
      const lowerLabel = label.toLowerCase();

      if (lowerLabel.includes('initiation') && lowerLabel.includes('date')) {
        details.initiationDate = value;
      } else if (lowerLabel.includes('initiat') && lowerLabel.includes('chapter')) {
        details.initiatingChapter = value;
      } else if (lowerLabel.includes('graduation') || lowerLabel.includes('grad year')) {
        details.graduationYear = value;
      } else if (lowerLabel.includes('birthday') || lowerLabel.includes('birth date') || lowerLabel.includes('date of birth')) {
        details.birthday = value;
      } else if (lowerLabel.includes('cell') || (lowerLabel.includes('mobile') && lowerLabel.includes('phone'))) {
        details.cellPhone = value;
      } else if (lowerLabel.includes('mailing') && lowerLabel.includes('address')) {
        // Parse address into components
        details.mailingAddress = parseAddress(value);
      } else if ((lowerLabel.includes('school') || lowerLabel.includes('work')) && lowerLabel.includes('address')) {
        details.schoolWorkAddress = parseAddress(value);
      }
    }

    console.log(`   ✅ Extracted ${Object.keys(details).filter(k => details[k as keyof MemberDetail]).length} detail fields`);

  } catch (error) {
    console.error(`   ❌ Error scraping member details:`, error);
  }

  return details;
}

// Parse address string into components
function parseAddress(addressString: string): { street?: string; city?: string; state?: string; zip?: string } {
  if (!addressString) return {};

  // Simple address parsing - can be enhanced
  const parts = addressString.split(',').map(p => p.trim());

  if (parts.length >= 3) {
    const street = parts[0];
    const city = parts[1];
    const stateZip = parts[2].split(/\s+/);
    const state = stateZip[0];
    const zip = stateZip[1];

    return { street, city, state, zip };
  } else if (parts.length === 2) {
    return { street: parts[0], city: parts[1] };
  } else {
    return { street: addressString };
  }
}

// Navigate to chapter directory
async function navigateToChapterDirectory(page: Page): Promise<boolean> {
  try {
    console.log('📍 Navigating to roster directory...');

    // Navigate directly to the roster search directory
    const rosterUrl = 'https://portal.sigmachi.org/s/searchdirectory?id=a2bVH0000006Pbd';
    await page.goto(rosterUrl, { waitUntil: 'networkidle' });

    // Wait for Salesforce Lightning components to load
    console.log('⏳ Waiting for Salesforce Lightning components to load...');
    await page.waitForTimeout(3000); // Give time for JavaScript to initialize

    // Try to wait for common Salesforce Lightning data table selectors
    const waitSelectors = [
      'table.slds-table',
      '[data-aura-rendered-by]',
      '.slds-table',
      'lightning-datatable',
      '[role="grid"]',
      '.slds-grid'
    ];

    for (const selector of waitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`✅ Found element with selector: ${selector}`);
        break;
      } catch (e) {
        // Continue to next selector
      }
    }

    console.log('✅ Navigated to roster directory');
    return true;

  } catch (error) {
    console.error('❌ Navigation error:', error);
    return false;
  }
}

// Scrape chapter data from the page
async function scrapeChapterData(page: Page, chapterName: string = 'Alpha Chi', universityName: string = 'Penn State University'): Promise<ChapterData[]> {
  console.log(`🔍 Scraping roster data for ${chapterName} chapter...`);

  const chapters: ChapterData[] = [];

  try {
    // Wait for page to fully load - give extra time for Salesforce
    console.log('⏳ Waiting for page to fully load...');
    await page.waitForTimeout(5000);

    // Wait for the filter sidebar to be visible
    await page.waitForSelector('text=Filter By', { timeout: 10000 });
    console.log('✅ Filter sidebar loaded');

    // Take initial screenshot
    await page.screenshot({ path: 'sigma-chi-before-filters.png', fullPage: true });
    console.log('📸 Initial screenshot saved');

    // Step 1: Click "More" under Member Type to reveal Undergrad option
    console.log('🔘 Clicking "More" to expand Member Type options...');

    try {
      // Use JavaScript to click the first More link (more reliable than Playwright click)
      await page.evaluate(() => {
        const moreLinks = Array.from(document.querySelectorAll('a'));
        const memberTypeMore = moreLinks.find(link => link.textContent?.trim() === 'More');
        if (memberTypeMore) {
          (memberTypeMore as HTMLElement).click();
          return true;
        }
        return false;
      });

      console.log('✅ Clicked "More" link');
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('⚠️  Could not click More link:', e);
    }

    // Step 2: Check "Undergrad" checkbox
    console.log('☑️  Checking "Undergrad" filter...');

    try {
      // Use JavaScript to click the Undergrad label/checkbox
      const undergradClicked = await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('label'));
        const undergradLabel = labels.find(label => label.textContent?.trim() === 'Undergrad');
        if (undergradLabel) {
          (undergradLabel as HTMLElement).click();
          return true;
        }
        return false;
      });

      if (undergradClicked) {
        console.log('✅ Checked "Undergrad" filter');
        await page.waitForTimeout(2000); // Wait for filter to apply
      } else {
        console.log('⚠️  Could not find Undergrad checkbox');
      }
    } catch (e) {
      console.log('⚠️  Error checking Undergrad:', e);
    }

    // Step 3: Enter chapter name in search box (top right of page)
    console.log(`🔍 Searching for "${chapterName}"...`);

    let searchEntered = false;
    try {
      // Search box has placeholder starting with "Search by City, State, Contact and Chapter Name..."
      const searchBox = await page.$('input[placeholder*="Search by City"]');

      if (searchBox && await searchBox.isVisible()) {
        console.log('✅ Found search box');
        await searchBox.click(); // Focus the search box
        await searchBox.fill(''); // Clear any existing text
        await searchBox.type(chapterName, { delay: 100 }); // Type slowly
        await page.waitForTimeout(500);

        // Click the Search button
        const searchButton = await page.$('button:has-text("Search")');
        if (searchButton) {
          console.log('✅ Found Search button, clicking it');
          await searchButton.click();

          // Wait for the table to reload with filtered results
          console.log('⏳ Waiting for search results to load...');
          await page.waitForTimeout(2000); // Initial wait

          // Wait for loading indicators to disappear
          await page.waitForSelector('.loadingBall', { state: 'hidden', timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(3000); // Additional wait for table to stabilize

          console.log('✅ Search results should be loaded');
          searchEntered = true;
        } else {
          // Try pressing Enter instead
          console.log('⚠️  Search button not found, pressing Enter');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(6000);
          searchEntered = true;
        }
      } else {
        console.log('⚠️  Could not find search box');
      }
    } catch (e) {
      console.log('⚠️  Error entering search:', e);
    }

    if (!searchEntered) {
      console.log('⚠️  Could not enter search term');
    }

    // Take screenshot after filters
    await page.screenshot({ path: 'sigma-chi-after-filters.png', fullPage: true });
    console.log('📸 Screenshot after filters saved');

    // Dismiss any location permission popups
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const blockButton = buttons.find(b => b.textContent?.includes('Block') || b.textContent?.includes('Deny'));
        if (blockButton) {
          (blockButton as HTMLElement).click();
        }
      });
      console.log('✅ Dismissed location popup (if present)');
    } catch (e) {
      // Ignore if no popup
    }

    // Save page HTML after filters
    const pageContent = await page.content();
    fs.writeFileSync('sigma-chi-page-source.html', pageContent);
    console.log('📄 Page source saved to sigma-chi-page-source.html');

    // Try different table/row selectors for Salesforce Lightning
    const tableSelectors = [
      'table.slds-table tbody tr',
      'lightning-datatable table tbody tr',
      '[role="grid"] [role="row"]',
      'table tbody tr',
      '.slds-table tr[data-row-key-value]',
      '[data-aura-rendered-by] table tr'
    ];

    let rowElements: any[] = [];
    for (const selector of tableSelectors) {
      rowElements = await page.$$(selector);
      if (rowElements.length > 0) {
        console.log(`✅ Found ${rowElements.length} rows using selector: ${selector}`);
        break;
      }
    }

    console.log(`\n📊 Found ${rowElements.length} rows on first page`);

    const members: MemberDetail[] = [];
    let pageNumber = 1;
    let hasMorePages = true;

    console.log(`\n👤 Extracting Level 1 data (table only, no detail pages)...`);
    console.log(`📊 Processing all ${chapterName} members across all pages (skipping Contact test rows)\n`);

    // Pagination loop - continue until no more pages
    while (hasMorePages) {
      console.log(`\n📄 === PAGE ${pageNumber} ===`);

      // Get current page rows
      const currentPageRows = await page.$$('table.slds-table tbody tr');
      console.log(`   Found ${currentPageRows.length} rows on page ${pageNumber}`);

      // Process each row on current page
      for (let rowIndex = 0; rowIndex < currentPageRows.length; rowIndex++) {
      try {
        // Re-query the table each time (it may have been re-rendered)
        let currentRows = await page.$$('table.slds-table tbody tr');

        // Retry if table temporarily disappears during Salesforce re-rendering
        if (currentRows.length === 0) {
          console.log(`   ⏳ Table empty, waiting for Salesforce to re-render...`);
          await page.waitForTimeout(2000);
          currentRows = await page.$$('table.slds-table tbody tr');
          if (currentRows.length === 0) {
            console.log(`   ⚠️  Table still empty after retry, breaking loop`);
            break;
          }
          console.log(`   ✅ Table reappeared with ${currentRows.length} rows`);
        }

        if (rowIndex >= currentRows.length) break;

        const row = currentRows[rowIndex];
        const cells = await row.$$('td, th');
        if (cells.length === 0) continue;

        // Extract cell texts
        const cellTexts: string[] = [];
        for (const cell of cells) {
          const text = await cell.evaluate((el: Element) => el.textContent?.trim() || '');
          cellTexts.push(text);
        }

        // Skip empty rows
        if (cellTexts.length < 3 || !cellTexts[2]) continue;

        // Skip Contact test rows
        if (cellTexts[2].includes('Contact')) {
          console.log(`Row ${rowIndex + 1}: ${cellTexts.join(' | ')} [SKIPPING - test data]`);
          continue;
        }

        console.log(`Row ${rowIndex + 1}: ${cellTexts.join(' | ')}`);

        // Create member from table data
        const member: MemberDetail = {
          firstName: cellTexts[0] || '',
          lastName: cellTexts[1] || '',
          fullName: cellTexts[2] || '',
          chapterGreekLetters: cellTexts[3] || chapterName,
          memberType: cellTexts[4] || '',
          status: cellTexts[5] || '',
          email: cellTexts[6] || '',
          phone: cellTexts[7] || ''
        };

        // Level 1 only: Skip detail page scraping for now
        // (Detail page navigation will be added after fixing the blank page issue)

        members.push(member);

      } catch (error) {
        console.error(`   ❌ Error processing row ${rowIndex}:`, error);
      }
    }

      console.log(`   ✅ Processed ${members.length} total members so far`);

      // Check for "Next" button to continue to next page
      console.log(`\n🔍 Checking for next page...`);

      const nextButton = await page.evaluate(() => {
        // Look for Next button in Salesforce Lightning pagination
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const nextBtn = buttons.find(btn => {
          const text = btn.textContent?.trim().toLowerCase();
          return text === 'next' ||
                 text?.includes('next') ||
                 btn.getAttribute('title')?.toLowerCase().includes('next');
        });

        if (nextBtn && !(nextBtn as HTMLButtonElement).disabled) {
          (nextBtn as HTMLElement).click();
          return true;
        }
        return false;
      });

      if (nextButton) {
        console.log(`   ⏭️  Clicking Next to page ${pageNumber + 1}...`);
        await page.waitForTimeout(3000); // Wait for page to load
        await page.waitForSelector('table.slds-table', { timeout: 10000 });
        pageNumber++;
      } else {
        console.log(`   ✅ No more pages - scraping complete!`);
        hasMorePages = false;
      }
    }

    console.log(`\n✅ Finished! Processed ${members.length} members across ${pageNumber} page(s)`);

    // Convert to chapter data format
    const chapterData: ChapterData = {
      chapterName: chapterName,
      university: universityName,
      members: members
    };

    chapters.push(chapterData);

    console.log('\n⚠️  IMPORTANT: Customize the field mapping in scrapeChapterData()');
    console.log('⚠️  Check sigma-chi-page-source.html and the console output above');
    console.log('⚠️  Update the cellTexts[] index mapping to match actual column order\n');

  } catch (error) {
    console.error('❌ Scraping error:', error);
  }

  return chapters;
}

// Import chapters to database
async function importToDatabase(chapters: ChapterData[]): Promise<void> {
  console.log(`\n📥 Importing ${chapters.length} chapters to database...`);

  // Get or create Sigma Chi organization
  let { data: sigmaChiOrg } = await supabase
    .from('greek_organizations')
    .select('id')
    .eq('name', 'Sigma Chi')
    .single();

  if (!sigmaChiOrg) {
    console.log('Creating Sigma Chi organization...');
    const { data: newOrg } = await supabase
      .from('greek_organizations')
      .insert({
        name: 'Sigma Chi',
        greek_letters: 'ΣΧ',
        organization_type: 'fraternity',
        founded_year: 1855,
        national_website: 'https://sigmachi.org'
      })
      .select()
      .single();
    sigmaChiOrg = newOrg;
  }

  const sigmaChiId = sigmaChiOrg!.id;

  // Process each chapter
  for (const chapter of chapters) {
    try {
      // Find or create university
      let { data: university } = await supabase
        .from('universities')
        .select('id')
        .eq('name', chapter.university)
        .single();

      if (!university) {
        const { data: newUni } = await supabase
          .from('universities')
          .insert({
            name: chapter.university,
            location: `${chapter.city || ''}, ${chapter.state || ''}`.trim(),
            state: chapter.state || '',
          })
          .select()
          .single();
        university = newUni;
        stats.universitiesCreated++;
      }

      const universityId = university!.id;

      // Check if chapter exists
      const { data: existingChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('greek_organization_id', sigmaChiId)
        .eq('university_id', universityId)
        .single();

      if (existingChapter) {
        // Update existing chapter
        await supabase
          .from('chapters')
          .update({
            chapter_name: chapter.chapterName,
            greek_letters: chapter.greekLetters,
            charter_date: chapter.charterDate,
            city: chapter.city,
            state_province: chapter.state,
            country: chapter.country || 'United States',
            website_url: chapter.website,
            contact_email: chapter.email,
            phone: chapter.phone,
            house_address: chapter.address,
            instagram_handle: chapter.socialMedia?.instagram,
            facebook_page: chapter.socialMedia?.facebook,
            twitter_handle: chapter.socialMedia?.twitter,
            linkedin_url: chapter.socialMedia?.linkedin,
            status: chapter.status || 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingChapter.id);
        stats.chaptersUpdated++;
        console.log(`✅ Updated: ${chapter.chapterName} at ${chapter.university}`);
      } else {
        // Create new chapter
        await supabase
          .from('chapters')
          .insert({
            greek_organization_id: sigmaChiId,
            university_id: universityId,
            chapter_name: chapter.chapterName,
            greek_letters: chapter.greekLetters,
            charter_date: chapter.charterDate,
            city: chapter.city,
            state_province: chapter.state,
            country: chapter.country || 'United States',
            website_url: chapter.website,
            contact_email: chapter.email,
            phone: chapter.phone,
            house_address: chapter.address,
            instagram_handle: chapter.socialMedia?.instagram,
            facebook_page: chapter.socialMedia?.facebook,
            twitter_handle: chapter.socialMedia?.twitter,
            linkedin_url: chapter.socialMedia?.linkedin,
            status: chapter.status || 'active'
          });
        stats.chaptersCreated++;
        console.log(`✅ Created: ${chapter.chapterName} at ${chapter.university}`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${chapter.chapterName}:`, error);
      stats.errors++;
    }
  }

  // Print stats
  console.log('\n📊 Import Statistics:');
  console.log(`   Total chapters: ${stats.totalChapters}`);
  console.log(`   Created: ${stats.chaptersCreated}`);
  console.log(`   Updated: ${stats.chaptersUpdated}`);
  console.log(`   Skipped: ${stats.chaptersSkipped}`);
  console.log(`   Universities created: ${stats.universitiesCreated}`);
  console.log(`   Errors: ${stats.errors}`);
}

// Main function
async function main() {
  const args = parseArgs();

  console.log('🎯 Sigma Chi Chapter Scraper\n');

  // Get credentials
  let username = args.username;
  let password = args.password;

  if (!username || !password) {
    const credentials = await promptCredentials();
    username = credentials.username;
    password = credentials.password;
  }

  // Launch browser
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({
    headless: args.headless,
    slowMo: args.headless ? 0 : 50  // Slow down in headed mode for easier debugging
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    // Block location permission popup
    permissions: [],
    geolocation: undefined
  });

  const page = await context.newPage();

  try {
    // Login
    const loginSuccess = await login(page, username, password);
    if (!loginSuccess) {
      console.error('❌ Failed to login. Please check your credentials.');
      await browser.close();
      return;
    }

    // Navigate to chapter directory
    const navSuccess = await navigateToChapterDirectory(page);
    if (!navSuccess) {
      console.error('❌ Failed to navigate to chapter directory.');
      await browser.close();
      return;
    }

    // Scrape data
    const chapters = await scrapeChapterData(page, args.chapter, args.university);
    stats.totalChapters = chapters.length;

    console.log(`\n✅ Scraped ${chapters.length} chapters`);

    // Export to JSON if requested
    if (args.export) {
      const exportPath = path.resolve(args.export);
      fs.writeFileSync(exportPath, JSON.stringify(chapters, null, 2));
      console.log(`📝 Exported data to ${exportPath}`);
    }

    // Import to database if requested
    if (args.import && chapters.length > 0) {
      await importToDatabase(chapters);
    }

    console.log('\n✨ Scraping complete!');
    console.log('⏸️  Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000); // Keep browser open for 30 seconds

  } catch (error) {
    console.error('❌ Fatal error:', error);
    console.log('⏸️  Browser will stay open for 30 seconds for inspection...');
    await page.waitForTimeout(30000); // Keep browser open even on error
  } finally {
    await browser.close();
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

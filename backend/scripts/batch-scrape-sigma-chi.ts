/**
 * Batch Scraper for All Sigma Chi Chapters
 *
 * This script processes a list of Sigma Chi chapters, scraping roster data
 * and importing it to the database for each one.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const execAsync = promisify(exec);

interface Chapter {
  chapter: string;
  university: string;
}

interface ProcessResult {
  chapter: string;
  university: string;
  success: boolean;
  memberCount?: number;
  error?: string;
  skipped?: boolean;
}

const DELAY_BETWEEN_CHAPTERS = 5000; // 5 seconds between chapters
const PROGRESS_FILE = 'batch-progress.json';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function saveProgress(results: ProcessResult[]) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(results, null, 2));
}

function loadProgress(): ProcessResult[] {
  if (fs.existsSync(PROGRESS_FILE)) {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

async function scrapeChapter(chapterName: string, universityName: string): Promise<number> {
  const outputFile = `data/${chapterName.replace(/\s+/g, '-').toLowerCase()}.json`;

  console.log(`  📥 Scraping ${chapterName} roster...`);

  try {
    // Run the scraper
    const { stdout, stderr } = await execAsync(
      `npm run scrape:sigmachi -- --chapter="${chapterName}" --university="${universityName}" --export="${outputFile}" --headless`,
      { timeout: 300000 } // 5 minute timeout per chapter
    );

    // Check if file was created
    if (fs.existsSync(outputFile)) {
      const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      const memberCount = data[0]?.members?.length || 0;
      console.log(`  ✅ Scraped ${memberCount} members`);
      return memberCount;
    } else {
      console.log(`  ⚠️  No data file created - chapter may have no members`);
      return 0;
    }
  } catch (error: any) {
    console.error(`  ❌ Scraping failed: ${error.message}`);
    throw error;
  }
}

async function importChapter(chapterName: string, outputFile: string): Promise<void> {
  console.log(`  📤 Importing to database...`);

  try {
    const { stdout, stderr } = await execAsync(
      `npm run import:sigmachi -- --file="${outputFile}"`,
      { timeout: 120000 } // 2 minute timeout for import
    );

    console.log(`  ✅ Import complete`);
  } catch (error: any) {
    console.error(`  ❌ Import failed: ${error.message}`);
    throw error;
  }
}

async function processChapter(
  chapter: Chapter,
  index: number,
  total: number
): Promise<ProcessResult> {
  const result: ProcessResult = {
    chapter: chapter.chapter,
    university: chapter.university,
    success: false
  };

  console.log(`\n[${index + 1}/${total}] Processing ${chapter.chapter} - ${chapter.university}`);
  console.log('='.repeat(80));

  try {
    // Scrape
    const memberCount = await scrapeChapter(chapter.chapter, chapter.university);

    if (memberCount === 0) {
      console.log(`  ⏭️  Skipping import - no members found`);
      result.skipped = true;
      result.memberCount = 0;
      return result;
    }

    result.memberCount = memberCount;

    // Import
    const outputFile = `data/${chapter.chapter.replace(/\s+/g, '-').toLowerCase()}.json`;
    await importChapter(chapter.chapter, outputFile);

    result.success = true;
    console.log(`  🎉 Successfully processed ${chapter.chapter}!`);

  } catch (error: any) {
    result.error = error.message;
    console.error(`  💥 Failed to process ${chapter.chapter}: ${error.message}`);
  }

  return result;
}

async function main() {
  console.log(`\n🎯 Sigma Chi Batch Scraper & Importer\n`);

  // Load chapter list
  const chaptersFile = path.resolve(process.cwd(), 'sigma-chi-chapters.json');
  if (!fs.existsSync(chaptersFile)) {
    console.error(`❌ Chapter list not found: ${chaptersFile}`);
    process.exit(1);
  }

  const chapters: Chapter[] = JSON.parse(fs.readFileSync(chaptersFile, 'utf-8'));
  console.log(`📋 Loaded ${chapters.length} chapters to process`);

  // Create data directory
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }

  // Load existing progress
  const progress = loadProgress();
  const processedChapters = new Set(progress.map(p => p.chapter));

  if (progress.length > 0) {
    console.log(`\n♻️  Resuming from previous run - ${progress.length} chapters already processed`);
  }

  // Filter out already processed chapters
  const remainingChapters = chapters.filter(c => !processedChapters.has(c.chapter));
  console.log(`\n🔄 ${remainingChapters.length} chapters remaining\n`);

  const results: ProcessResult[] = [...progress];
  let successCount = progress.filter(p => p.success).length;
  let errorCount = progress.filter(p => !p.success && !p.skipped).length;
  let skippedCount = progress.filter(p => p.skipped).length;

  // Process each chapter
  for (let i = 0; i < remainingChapters.length; i++) {
    const chapter = remainingChapters[i];

    const result = await processChapter(chapter, i, remainingChapters.length);
    results.push(result);

    if (result.success) successCount++;
    else if (result.skipped) skippedCount++;
    else errorCount++;

    // Save progress after each chapter
    saveProgress(results);

    // Delay between chapters (except for last one)
    if (i < remainingChapters.length - 1) {
      console.log(`\n⏸️  Waiting ${DELAY_BETWEEN_CHAPTERS / 1000}s before next chapter...`);
      await delay(DELAY_BETWEEN_CHAPTERS);
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(80));
  console.log('🏁 Batch Processing Complete!');
  console.log('='.repeat(80));
  console.log(`\n📊 Final Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⏭️  Skipped (no members): ${skippedCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📋 Total: ${results.length}/${chapters.length}`);

  // Show errors if any
  const errors = results.filter(r => !r.success && !r.skipped);
  if (errors.length > 0) {
    console.log(`\n❌ Failed Chapters:`);
    errors.forEach(e => {
      console.log(`   - ${e.chapter} (${e.university}): ${e.error}`);
    });
  }

  console.log(`\n📝 Full report saved to: ${PROGRESS_FILE}\n`);
}

if (require.main === module) {
  main().catch(console.error);
}

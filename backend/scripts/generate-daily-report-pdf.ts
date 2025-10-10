#!/usr/bin/env tsx
/**
 * Generate Daily Report PDFs
 *
 * Generates PDF versions of daily reports for manual email distribution.
 * This is an alternative to automated email sending when domain verification is an issue.
 *
 * Usage:
 *   npm run daily-report-pdf
 *   or
 *   npx tsx scripts/generate-daily-report-pdf.ts
 *
 * Requires: npm install puppeteer (not installed yet)
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DailyReportService } from '../src/services/DailyReportService';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const resendApiKey = process.env.RESEND_API_KEY!;

async function generatePDF(html: string, outputPath: string): Promise<void> {
  // NOTE: Requires puppeteer to be installed
  // Install with: npm install puppeteer

  try {
    const puppeteer = await import('puppeteer');

    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set content with wait for network idle
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    console.log(`✓ PDF saved to: ${outputPath}`);
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Puppeteer not installed. Install with:');
      console.error('   npm install puppeteer');
      throw new Error('Puppeteer not installed');
    }
    throw error;
  }
}

async function saveHTML(html: string, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, html, 'utf-8');
  console.log(`✓ HTML saved to: ${outputPath}`);
}

async function main() {
  console.log('📊 FraternityBase Daily Report PDF Generator\n');
  console.log('='.repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60) + '\n');

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    if (!supabaseUrl) console.error('  - SUPABASE_URL');
    if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  // Initialize service
  const reportService = new DailyReportService(
    supabaseUrl,
    supabaseServiceKey,
    resendApiKey || '', // Not needed for PDF generation
    'updates@fraternitybase.com'
  );

  try {
    // Get approved companies
    console.log('Fetching approved companies...');
    const companies = await reportService.getApprovedCompanies();

    if (companies.length === 0) {
      console.log('⚠️  No approved companies found. No reports to generate.');
      return;
    }

    console.log(`Found ${companies.length} approved companies\n`);

    // Fetch report data once (shared across all companies)
    console.log('Fetching report data...');
    const [newChapters, newOfficers, highGradeChapters] = await Promise.all([
      reportService.getNewChapters(),
      reportService.getNewOfficers(),
      reportService.getHighGradeChapters()
    ]);

    console.log(`✓ New chapters: ${newChapters.length}`);
    console.log(`✓ New officers: ${newOfficers.length}`);
    console.log(`✓ High-grade chapters: ${highGradeChapters.length}\n`);

    // Create output directory
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const outputDir = path.join(__dirname, '../../reports', today);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Check if puppeteer is available
    let usePDF = false;
    try {
      await import('puppeteer');
      usePDF = true;
      console.log('📄 Puppeteer detected - Generating PDFs\n');
    } catch {
      console.log('📄 Puppeteer not available - Generating HTML files only\n');
      console.log('   Install puppeteer to generate PDFs: npm install puppeteer\n');
    }

    // Generate report for each company
    let successCount = 0;
    let failCount = 0;

    for (const company of companies) {
      try {
        console.log(`Generating report for ${company.name}...`);

        // Generate HTML content
        const html = reportService.generateReportHtml(
          company.name,
          newChapters,
          newOfficers,
          highGradeChapters
        );

        // Create safe filename
        const safeName = company.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        const baseFilename = `daily-report-${today}-${safeName}`;

        // Save HTML
        const htmlPath = path.join(outputDir, `${baseFilename}.html`);
        await saveHTML(html, htmlPath);

        // Generate PDF if puppeteer available
        if (usePDF) {
          const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
          await generatePDF(html, pdfPath);
        }

        successCount++;
      } catch (error: any) {
        console.error(`✗ Failed to generate report for ${company.name}:`, error.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Report Generation Summary');
    console.log('='.repeat(60));
    console.log(`✓ Successful: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`Total: ${successCount + failCount}`);
    console.log(`Output Directory: ${outputDir}`);
    console.log(`Completed at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60));

    if (usePDF) {
      console.log('\n📧 Next Steps:');
      console.log('   1. Review the generated PDF files');
      console.log('   2. Manually email them to clients');
      console.log(`   3. Find files in: ${outputDir}\n`);
    } else {
      console.log('\n📧 Next Steps:');
      console.log('   1. Review the generated HTML files (open in browser)');
      console.log('   2. Install puppeteer for PDF generation: npm install puppeteer');
      console.log('   3. Or manually convert HTML to PDF');
      console.log(`   4. Find files in: ${outputDir}\n`);
    }

    if (failCount > 0) {
      process.exit(1);
    }
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

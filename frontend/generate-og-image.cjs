// Generate OG image from HTML using Puppeteer
const puppeteer = require('puppeteer');
const path = require('path');

async function generateOGImage() {
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  const page = await browser.newPage();

  // Set viewport to exact OG image dimensions
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // High DPI for better quality
  });

  const htmlPath = path.join(__dirname, 'public', 'og-gradient.html');
  console.log('📄 Loading HTML from:', htmlPath);

  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });

  // Wait a moment for fonts to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  const outputPath = path.join(__dirname, 'public', 'fraternitybase-og-logo.png');
  console.log('📸 Taking screenshot...');

  await page.screenshot({
    path: outputPath,
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 630
    }
  });

  await browser.close();

  console.log('✅ OG image generated successfully!');
  console.log('📁 Saved to:', outputPath);
}

generateOGImage().catch(console.error);

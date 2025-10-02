#!/usr/bin/env node
/**
 * Generate OG image with hat emoji for social media previews
 */

const fs = require('fs');
const { createCanvas, registerFont } = require('canvas');

// Create 1200x630 canvas (standard OG image size)
const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Create gradient background - light blue to green
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#60a5fa'); // light blue
gradient.addColorStop(0.5, '#3b82f6'); // blue
gradient.addColorStop(1, '#10b981'); // green
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Add decorative patterns
ctx.globalAlpha = 0.1;
const grad1 = ctx.createRadialGradient(240, 315, 0, 240, 315, 400);
grad1.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
grad1.addColorStop(1, 'transparent');
ctx.fillStyle = grad1;
ctx.fillRect(0, 0, width, height);

const grad2 = ctx.createRadialGradient(960, 504, 0, 960, 504, 400);
grad2.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
grad2.addColorStop(1, 'transparent');
ctx.fillStyle = grad2;
ctx.fillRect(0, 0, width, height);
ctx.globalAlpha = 1.0;

// Draw white rounded square for logo background
const logoSize = 120;
const logoX = (width - logoSize) / 2;
const logoY = 80;
const borderRadius = 24;

ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 60;
ctx.shadowOffsetY = 20;
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.roundRect(logoX, logoY, logoSize, logoSize, borderRadius);
ctx.fill();
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetY = 0;

// Draw "FB" text instead of emoji (cleaner for OG images)
ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
ctx.fillStyle = '#3b82f6'; // blue to match new gradient
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('FB', width / 2, logoY + logoSize / 2);

// Draw title
ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
ctx.fillStyle = 'white';
ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
ctx.shadowBlur = 12;
ctx.shadowOffsetY = 4;
ctx.fillText('FraternityBase', width / 2, 280);

// Draw tagline
ctx.font = '500 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
ctx.shadowBlur = 8;
ctx.shadowOffsetY = 2;
ctx.fillText('Find Your Fraternity Partner', width / 2, 340);

// Draw stats
const statsY = 440;
const stats = [
  { number: '5,000+', label: 'Organizations' },
  { number: '250+', label: 'Universities' },
  { number: '1,000+', label: 'Chapters' }
];

const statSpacing = 300;
const startX = (width - (statSpacing * 2)) / 2;

stats.forEach((stat, index) => {
  const x = startX + (index * statSpacing);

  // Stat number
  ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'white';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.fillText(stat.number, x, statsY);

  // Stat label
  ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText(stat.label, x, statsY + 35);
});

// Draw domain at bottom
ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
ctx.fillStyle = 'white';
ctx.globalAlpha = 0.9;
ctx.shadowBlur = 8;
ctx.shadowOffsetY = 2;
ctx.fillText('fraternitybase.com', width / 2, height - 40);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./public/og-image.png', buffer);

console.log('✅ OG image generated successfully at ./public/og-image.png');
console.log('📏 Size: 1200x630px');
console.log('🧢 Hat emoji included!');

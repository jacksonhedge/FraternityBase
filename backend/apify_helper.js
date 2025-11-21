/**
 * APIFY HELPER TOOLKIT
 * Automates Instagram scraping, data parsing, and opportunity detection
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// 1. GENERATE APIFY INPUT JSON
// ============================================================================

/**
 * Generate Apify input JSON for a specific fraternity
 */
export async function generateApifyInput(fraternityName, postsPerAccount = 4) {
  console.log(`📋 Generating Apify input for ${fraternityName}...`);

  // Get all Instagram handles for this fraternity
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select(`
      instagram_handle,
      universities(name)
    `)
    .eq('greek_organizations.name', fraternityName)
    .not('instagram_handle', 'is', null)
    .eq('status', 'active');

  if (error) throw error;

  // Format as Instagram URLs
  const directUrls = chapters
    .map(c => c.instagram_handle)
    .filter(handle => handle && handle.trim())
    .map(handle => {
      const clean = handle.replace('@', '').replace(/\/$/, '').split('?')[0].split('/')[0];
      return `https://instagram.com/${clean}`;
    });

  // Build optimized config
  const config = {
    directUrls,
    resultsLimit: postsPerAccount,
    resultsType: "posts",
    searchType: "user",
    searchLimit: 1,
    addParentData: true,
    scrapePostComments: true,
    scrapePostCommentsCount: 20,
    scrapeRelatedProfiles: false,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ["RESIDENTIAL"]
    }
  };

  console.log(`✅ Generated config for ${directUrls.length} accounts`);
  console.log(`📊 Will scrape ${directUrls.length * postsPerAccount} posts total`);

  return config;
}

// ============================================================================
// 2. PARSE APIFY OUTPUT
// ============================================================================

/**
 * Parse Apify JSON output and structure for database import
 */
export function parseApifyOutput(apifyData) {
  console.log(`📥 Parsing ${apifyData.length} posts from Apify...`);

  const parsed = apifyData.map(post => {
    // Extract hashtags
    const hashtags = post.hashtags || [];

    // Extract mentions from caption
    const mentions = (post.caption || '').match(/@[\w.]+/g) || [];

    // Calculate engagement rate
    const engagementRate = post.ownerFollowers > 0
      ? ((post.likesCount + post.commentsCount) / post.ownerFollowers) * 100
      : 0;

    return {
      // Post identification
      instagram_post_id: post.id || post.shortCode,
      post_url: post.url,

      // Content
      caption: post.caption || '',
      media_urls: post.imageUrls || [post.displayUrl],

      // Engagement
      like_count: post.likesCount || 0,
      comment_count: post.commentsCount || 0,
      engagement_rate: engagementRate.toFixed(2),

      // Classification
      post_type: post.type || 'Photo',
      hashtags,
      mentions,

      // Timing
      posted_at: post.timestamp,

      // Profile data
      owner_username: post.ownerUsername,
      owner_followers: post.ownerFollowers || 0,

      // Location
      location_name: post.locationName,

      // Comments
      comments: (post.comments || []).map(c => ({
        text: c.text,
        username: c.ownerUsername,
        timestamp: c.timestamp
      })),

      // Raw data for reference
      raw_data: post
    };
  });

  console.log(`✅ Parsed ${parsed.length} posts successfully`);
  return parsed;
}

// ============================================================================
// 3. OPPORTUNITY DETECTION
// ============================================================================

/**
 * Detect engagement opportunities from post data
 */
export function detectOpportunities(posts) {
  console.log(`🔍 Analyzing ${posts.length} posts for opportunities...`);

  const keywordWeights = {
    // Partnership signals
    'sponsor': 15,
    'partnership': 15,
    'looking for': 10,
    'seeking': 8,
    'need': 5,

    // Event types
    'philanthropy': 8,
    'fundraiser': 10,
    'charity': 8,
    'recruitment': 10,
    'rush': 10,

    // Vendor needs
    'vendor': 12,
    'photographer': 12,
    'dj': 12,
    'catering': 10,
    'merch': 10,
    'merchandise': 10,
    'apparel': 8
  };

  const results = posts.map(post => {
    let score = 0;
    const reasons = [];
    const keywords = [];

    const searchText = `${post.caption} ${post.comments.map(c => c.text).join(' ')}`.toLowerCase();

    // Check keywords
    for (const [keyword, weight] of Object.entries(keywordWeights)) {
      if (searchText.includes(keyword)) {
        score += weight;
        keywords.push(keyword);
        reasons.push(`Mentioned "${keyword}"`);
      }
    }

    // Check for vendor questions in comments
    const vendorComments = post.comments.filter(c =>
      c.text.toLowerCase().match(/who.*?(dj|photographer|vendor|catering|merch)/)
    );

    if (vendorComments.length > 0) {
      score += 10;
      reasons.push(`${vendorComments.length} vendor question(s) in comments`);
    }

    // High engagement boost
    if (post.engagement_rate > 5) {
      score += 5;
      reasons.push('High engagement rate (>5%)');
    }

    // Recent post boost
    const daysAgo = (Date.now() - new Date(post.posted_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo < 7) {
      score += 3;
      reasons.push('Posted within last 7 days');
    }

    // Classify event type
    let eventType = 'other';
    if (hashtags.some(h => ['rush', 'recruitment'].includes(h.toLowerCase()))) {
      eventType = 'recruitment';
    } else if (hashtags.some(h => ['philanthropy', 'charity', 'fundraiser'].includes(h.toLowerCase()))) {
      eventType = 'philanthropy';
    } else if (hashtags.some(h => ['formal', 'dateparty', 'mixer'].includes(h.toLowerCase()))) {
      eventType = 'social';
    }

    return {
      ...post,
      is_opportunity: score >= 10,
      opportunity_score: score,
      opportunity_reason: reasons.join(', '),
      opportunity_keywords: keywords,
      detected_event_type: eventType
    };
  });

  const opportunities = results.filter(r => r.is_opportunity);
  console.log(`✅ Found ${opportunities.length} opportunities out of ${posts.length} posts`);

  return results;
}

// ============================================================================
// 4. IMPORT TO DATABASE
// ============================================================================

/**
 * Import posts to Supabase chapter_posts table
 */
export async function importToDatabase(posts) {
  console.log(`💾 Importing ${posts.length} posts to database...`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    try {
      // Find chapter by Instagram handle
      const { data: chapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('instagram_handle', `@${post.owner_username}`)
        .single();

      if (!chapter) {
        console.log(`⚠️  Chapter not found for @${post.owner_username}`);
        skipped++;
        continue;
      }

      // Check if post already exists
      const { data: existing } = await supabase
        .from('chapter_posts')
        .select('id')
        .eq('instagram_post_id', post.instagram_post_id)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert post
      const { error: insertError } = await supabase
        .from('chapter_posts')
        .insert({
          chapter_id: chapter.id,
          instagram_post_id: post.instagram_post_id,
          post_url: post.post_url,
          caption: post.caption,
          media_urls: post.media_urls,
          like_count: post.like_count,
          comment_count: post.comment_count,
          engagement_rate: parseFloat(post.engagement_rate),
          post_type: post.post_type,
          detected_event_type: post.detected_event_type,
          hashtags: post.hashtags,
          is_opportunity: post.is_opportunity,
          opportunity_reason: post.opportunity_reason,
          opportunity_score: post.opportunity_score,
          posted_at: post.posted_at,
          scraped_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      imported++;
      console.log(`✅ Imported: ${post.owner_username} - ${post.caption.substring(0, 50)}...`);
    } catch (error) {
      console.error(`❌ Error importing post:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  return { imported, skipped, errors };
}

// ============================================================================
// 5. FULL PIPELINE
// ============================================================================

/**
 * Complete pipeline: Parse Apify data, detect opportunities, import to DB
 */
export async function processApifyData(apifyJsonPath) {
  console.log(`\n🚀 Starting Apify data processing pipeline...\n`);

  try {
    // 1. Load Apify output
    const fs = await import('fs');
    const apifyData = JSON.parse(fs.readFileSync(apifyJsonPath, 'utf-8'));

    // 2. Parse output
    const parsed = parseApifyOutput(apifyData);

    // 3. Detect opportunities
    const analyzed = detectOpportunities(parsed);

    // 4. Import to database
    const stats = await importToDatabase(analyzed);

    console.log(`\n✅ Pipeline complete!`);
    return stats;
  } catch (error) {
    console.error(`\n❌ Pipeline failed:`, error.message);
    throw error;
  }
}

// ============================================================================
// 6. CLI COMMANDS
// ============================================================================

// Generate input for Sigma Chi
if (process.argv[2] === 'generate') {
  const fraternity = process.argv[3] || 'Sigma Chi';
  const postsPerAccount = parseInt(process.argv[4]) || 4;

  generateApifyInput(fraternity, postsPerAccount).then(config => {
    const fs = require('fs');
    const filename = `apify_input_${fraternity.toLowerCase().replace(/\s+/g, '_')}.json`;
    fs.writeFileSync(filename, JSON.stringify(config, null, 2));
    console.log(`\n💾 Saved to: ${filename}`);
  });
}

// Process Apify output
if (process.argv[2] === 'process') {
  const jsonPath = process.argv[3];
  if (!jsonPath) {
    console.error('❌ Please provide path to Apify JSON output');
    process.exit(1);
  }

  processApifyData(jsonPath).then(stats => {
    console.log(`\n✅ Processing complete!`, stats);
  });
}

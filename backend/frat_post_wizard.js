#!/usr/bin/env node

/**
 * Fraternity Instagram Post Categorizer & Formatter Agent
 *
 * Purpose: Process fraternity Instagram posts from Aplify JSON responses
 * and automatically categorize, format, and extract actionable data for dashboard display.
 *
 * Features:
 * - 7-category classification system with confidence scoring
 * - Contact extraction (phone, email, Instagram handles)
 * - Event date/time parsing
 * - Engagement scoring algorithm
 * - Actionable insights generation
 * - Interactive CLI with 3 modes
 *
 * Usage: node frat_post_wizard.js
 */

const fs = require('fs');
const readline = require('readline');

// ============================================================================
// CATEGORIZATION SYSTEM
// ============================================================================

const CATEGORIES = {
  RECRUITMENT: {
    keywords: [
      'rush', 'recruitment', 'join us', 'sign up', 'info session', 'meet the brothers',
      'rush chair', 'rushing', 'new members', 'potential new members', 'pnm', 'rush week',
      'open house', 'rush event', 'interested', 'join our chapter', 'become a brother'
    ],
    description: 'Recruitment events, rush activities, information sessions'
  },
  PHILANTHROPY: {
    keywords: [
      'philanthropy', 'fundraiser', 'charity', 'donate', 'donation', 'fundraising',
      'cancer', 'foundation', 'cause', 'raise money', 'giving back', 'community service',
      'volunteer', 'non-profit', 'nonprofit', 'benefit', 'awareness', 'support'
    ],
    description: 'Charitable events, fundraisers, community service'
  },
  MEMBER_MILESTONES: {
    keywords: [
      'new member', 'pledge', 'initiation', 'initiated', 'graduation', 'graduate',
      'congrats', 'congratulations', 'sweetheart', 'elected', 'election', 'new pledge',
      'welcomed', 'brothers', 'newest member', 'achievement', 'milestone'
    ],
    description: 'New pledges, initiations, graduations, member achievements'
  },
  SOCIAL_EVENTS: {
    keywords: [
      'party', 'mixer', 'social', 'event', 'homecoming', 'trip', 'travel', 'weekend',
      'hangout', 'brotherhood', 'formal', 'semi-formal', 'date party', 'tailgate',
      'game day', 'throwback', 'memories', 'fun', 'celebrated', 'good times'
    ],
    description: 'Social gatherings, parties, mixers, trips'
  },
  LEADERSHIP: {
    keywords: [
      'president', 'vice president', 'vp', 'executive board', 'eboard', 'e-board',
      'officer', 'treasurer', 'secretary', 'elected', 'leadership', 'chair', 'chairman',
      'committee', 'exec', 'board member', 'leading', 'elected position'
    ],
    description: 'Leadership positions, executive board, officers'
  },
  ACADEMICS: {
    keywords: [
      'internship', 'career', 'professional', 'job', 'alumni', 'academic', 'scholarship',
      'dean\'s list', 'honors', 'gpa', 'study', 'professional development', 'interview',
      'networking', 'mentor', 'industry', 'business', 'engineering', 'success story'
    ],
    description: 'Academic achievements, career development, alumni stories'
  },
  HOMECOMING: {
    keywords: [
      'homecoming', 'anniversary', 'founder', 'founded', 'founding', 'alumni',
      'reunion', 'celebrating', 'years', 'legacy', 'tradition', 'history', 'heritage'
    ],
    description: 'Homecoming, anniversaries, founder celebrations'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Categorize a post based on caption keywords
 * Returns category name and confidence score (0-100)
 */
function categorizePost(caption) {
  if (!caption) {
    return { category: 'UNCATEGORIZED', confidence: 0 };
  }

  const lowerCaption = caption.toLowerCase();
  const categoryScores = {};

  // Calculate match score for each category
  for (const [categoryName, categoryData] of Object.entries(CATEGORIES)) {
    let matches = 0;
    let totalKeywords = categoryData.keywords.length;

    for (const keyword of categoryData.keywords) {
      if (lowerCaption.includes(keyword.toLowerCase())) {
        matches++;
      }
    }

    // Calculate confidence as percentage of keywords matched
    const confidence = Math.round((matches / totalKeywords) * 100);
    categoryScores[categoryName] = { confidence, matches };
  }

  // Find category with highest confidence
  let bestCategory = 'UNCATEGORIZED';
  let bestConfidence = 0;
  let bestMatches = 0;

  for (const [category, score] of Object.entries(categoryScores)) {
    if (score.matches > bestMatches ||
        (score.matches === bestMatches && score.confidence > bestConfidence)) {
      bestCategory = category;
      bestConfidence = score.confidence;
      bestMatches = score.matches;
    }
  }

  // Only return a category if we have at least 1 match
  if (bestMatches === 0) {
    return { category: 'UNCATEGORIZED', confidence: 0 };
  }

  return { category: bestCategory, confidence: bestConfidence };
}

/**
 * Extract contact information from caption
 * Returns array of contact objects with type and value
 */
function extractContacts(caption) {
  if (!caption) return [];

  const contacts = [];

  // Phone number patterns
  const phonePatterns = [
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // (555) 123-4567 or 555-123-4567
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g        // 5551234567
  ];

  for (const pattern of phonePatterns) {
    const matches = caption.match(pattern);
    if (matches) {
      matches.forEach(phone => {
        if (!contacts.find(c => c.value === phone)) {
          contacts.push({ type: 'phone', value: phone.trim() });
        }
      });
    }
  }

  // Email pattern
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = caption.match(emailPattern);
  if (emails) {
    emails.forEach(email => {
      contacts.push({ type: 'email', value: email.trim() });
    });
  }

  // Instagram handle pattern
  const instagramPattern = /@([A-Za-z0-9._]+)/g;
  const handles = caption.match(instagramPattern);
  if (handles) {
    handles.forEach(handle => {
      contacts.push({ type: 'instagram', value: handle.trim() });
    });
  }

  return contacts;
}

/**
 * Extract event dates and times from caption
 * Returns array of date strings
 */
function extractEventDates(caption) {
  if (!caption) return [];

  const dates = [];

  // Pattern 1: "October 17th from 4-7PM"
  const dateTimePattern1 = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?\s+(?:from\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?(?:\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)?/gi;

  // Pattern 2: "10/17" or "10/17/2025"
  const datePattern2 = /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g;

  // Pattern 3: "Saturday, October 17th"
  const datePattern3 = /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi;

  // Pattern 4: Just time ranges "4-7PM" or "4:00-7:00 PM"
  const timePattern = /\b\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?\s*-\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b/gi;

  const matches1 = caption.match(dateTimePattern1);
  if (matches1) dates.push(...matches1.map(d => d.trim()));

  const matches2 = caption.match(datePattern2);
  if (matches2) dates.push(...matches2.map(d => d.trim()));

  const matches3 = caption.match(datePattern3);
  if (matches3) dates.push(...matches3.map(d => d.trim()));

  const matches4 = caption.match(timePattern);
  if (matches4) dates.push(...matches4.map(d => d.trim()));

  // Remove duplicates
  return [...new Set(dates)];
}

/**
 * Calculate engagement score (0-100) based on likes, comments, and recency
 */
function calculateEngagementScore(post) {
  const { likesCount = 0, commentsCount = 0, timestamp } = post;

  // Base score from engagement
  let score = 0;

  // Likes contribution (max 50 points)
  // Normalize: 0 likes = 0 points, 500+ likes = 50 points
  const likesScore = Math.min(50, (likesCount / 500) * 50);
  score += likesScore;

  // Comments contribution (max 30 points)
  // Normalize: 0 comments = 0 points, 50+ comments = 30 points
  const commentsScore = Math.min(30, (commentsCount / 50) * 30);
  score += commentsScore;

  // Recency contribution (max 20 points)
  if (timestamp) {
    const postDate = new Date(timestamp);
    const now = new Date();
    const daysOld = (now - postDate) / (1000 * 60 * 60 * 24);

    // Posts within last 7 days get full 20 points
    // After 7 days, score decreases linearly to 0 at 30 days
    if (daysOld <= 7) {
      score += 20;
    } else if (daysOld <= 30) {
      score += 20 * (1 - ((daysOld - 7) / 23));
    }
    // Posts older than 30 days get 0 recency points
  }

  return Math.round(score);
}

/**
 * Generate actionable insights for a post
 */
function generateInsights(post, category, contacts, eventDates) {
  const insights = [];

  // Recruitment insights
  if (category === 'RECRUITMENT') {
    if (contacts.length > 0) {
      insights.push('✓ Recruitment contact info available');
    } else {
      insights.push('⚠️ Consider adding contact info for recruitment');
    }
  }

  // Event date insights
  if (eventDates.length > 0) {
    insights.push(`✓ Event dates mentioned (${eventDates.length})`);
  }

  // Engagement insights
  if (post.likesCount > 200) {
    insights.push('⭐ High engagement post');
  }

  if (post.commentsCount > 10) {
    insights.push('💬 Strong community engagement');
  }

  // Sponsorship opportunity
  if (category === 'PHILANTHROPY') {
    insights.push('🎯 Sponsorship/partnership opportunity');
  }

  // Low engagement warning
  if (post.likesCount < 50 && post.commentsCount < 3) {
    insights.push('📊 Low engagement - consider boosting or reposting');
  }

  // Leadership visibility
  if (category === 'LEADERSHIP') {
    insights.push('👥 Leadership visibility - good for transparency');
  }

  // Academic success story
  if (category === 'ACADEMICS') {
    insights.push('🎓 Success story - great for recruitment marketing');
  }

  return insights;
}

/**
 * Format a single post into dashboard structure
 */
function formatPost(post, index) {
  const { category, confidence } = categorizePost(post.caption);
  const contacts = extractContacts(post.caption);
  const eventDates = extractEventDates(post.caption);
  const engagementScore = calculateEngagementScore(post);
  const insights = generateInsights(post, category, contacts, eventDates);

  // Format posted date
  const postedDate = post.timestamp ? new Date(post.timestamp) : new Date();
  const postedFormatted = postedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Truncate caption for preview
  const captionPreview = post.caption
    ? post.caption.substring(0, 200) + (post.caption.length > 200 ? '...' : '')
    : '';

  return {
    id: `post_${index}_${Date.now()}`,
    chapter: post.ownerFullName || 'Unknown Chapter',
    instagram: post.ownerUsername || '',
    url: post.url || '',
    category: category,
    categoryConfidence: confidence,
    caption: captionPreview,
    fullCaption: post.caption || '',
    engagement: {
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      firstComment: post.firstComment || null,
      score: engagementScore
    },
    posted: post.timestamp || new Date().toISOString(),
    postedFormatted: postedFormatted,
    contacts: contacts,
    eventDates: eventDates,
    insights: insights
  };
}

/**
 * Process an array of posts
 * Returns formatted posts sorted by engagement score
 */
function processPosts(postsArray) {
  if (!Array.isArray(postsArray)) {
    console.error('❌ Error: Input must be an array of posts');
    return [];
  }

  console.log(`\n📊 Processing ${postsArray.length} posts...`);

  const formattedPosts = postsArray.map((post, index) => {
    const formatted = formatPost(post, index);

    // Progress indicator
    if ((index + 1) % 10 === 0 || index === postsArray.length - 1) {
      process.stdout.write(`\r✓ Processed ${index + 1}/${postsArray.length} posts`);
    }

    return formatted;
  });

  console.log('\n');

  // Sort by engagement score (highest first)
  formattedPosts.sort((a, b) => b.engagement.score - a.engagement.score);

  return formattedPosts;
}

/**
 * Generate a comprehensive report from formatted posts
 */
function generateReport(formattedPosts) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FRATERNITY INSTAGRAM POST ANALYSIS REPORT');
  console.log('='.repeat(80));

  // Total posts
  console.log(`\n📈 OVERVIEW`);
  console.log(`   Total posts processed: ${formattedPosts.length}`);

  // Category breakdown
  console.log(`\n📁 CATEGORY BREAKDOWN`);
  const categoryCount = {};
  formattedPosts.forEach(post => {
    categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
  });

  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
      const percentage = ((count / formattedPosts.length) * 100).toFixed(1);
      console.log(`   ${category.padEnd(20)} ${count.toString().padStart(3)} posts (${percentage}%)`);
    });

  // Chapter breakdown
  console.log(`\n🏛️  CHAPTER BREAKDOWN`);
  const chapterCount = {};
  formattedPosts.forEach(post => {
    chapterCount[post.chapter] = (chapterCount[post.chapter] || 0) + 1;
  });

  Object.entries(chapterCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 chapters
    .forEach(([chapter, count]) => {
      console.log(`   ${chapter.substring(0, 40).padEnd(42)} ${count} posts`);
    });

  // Top posts by engagement
  console.log(`\n⭐ TOP 5 POSTS BY ENGAGEMENT`);
  formattedPosts.slice(0, 5).forEach((post, index) => {
    console.log(`\n   ${index + 1}. ${post.chapter} (@${post.instagram})`);
    console.log(`      Score: ${post.engagement.score}/100`);
    console.log(`      Likes: ${post.engagement.likes} | Comments: ${post.engagement.comments}`);
    console.log(`      Category: ${post.category} (${post.categoryConfidence}% confidence)`);
    console.log(`      Caption: ${post.caption.substring(0, 80)}...`);
    if (post.url) {
      console.log(`      URL: ${post.url}`);
    }
  });

  // Contacts found
  console.log(`\n📞 CONTACTS EXTRACTED`);
  let totalContacts = 0;
  const contactTypeCount = { phone: 0, email: 0, instagram: 0 };

  formattedPosts.forEach(post => {
    totalContacts += post.contacts.length;
    post.contacts.forEach(contact => {
      contactTypeCount[contact.type] = (contactTypeCount[contact.type] || 0) + 1;
    });
  });

  console.log(`   Total contacts found: ${totalContacts}`);
  console.log(`   Phone numbers: ${contactTypeCount.phone}`);
  console.log(`   Email addresses: ${contactTypeCount.email}`);
  console.log(`   Instagram handles: ${contactTypeCount.instagram}`);

  // Event dates
  console.log(`\n📅 EVENT DATES FOUND`);
  let totalEventDates = 0;
  formattedPosts.forEach(post => {
    totalEventDates += post.eventDates.length;
  });
  console.log(`   Total event dates mentioned: ${totalEventDates}`);

  // Insights summary
  console.log(`\n💡 KEY INSIGHTS`);
  const allInsights = {};
  formattedPosts.forEach(post => {
    post.insights.forEach(insight => {
      allInsights[insight] = (allInsights[insight] || 0) + 1;
    });
  });

  Object.entries(allInsights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([insight, count]) => {
      console.log(`   ${insight} (${count} posts)`);
    });

  // Report metadata
  console.log(`\n📝 REPORT METADATA`);
  console.log(`   Generated: ${new Date().toLocaleString()}`);
  console.log(`   Tool: Fraternity Instagram Post Categorizer & Formatter v1.0`);

  console.log('\n' + '='.repeat(80) + '\n');

  // Return summary object
  return {
    totalPosts: formattedPosts.length,
    categoryBreakdown: categoryCount,
    chapterBreakdown: chapterCount,
    topPosts: formattedPosts.slice(0, 5).map(p => ({
      chapter: p.chapter,
      instagram: p.instagram,
      score: p.engagement.score,
      category: p.category,
      url: p.url
    })),
    contactsFound: {
      total: totalContacts,
      byType: contactTypeCount
    },
    eventDatesFound: totalEventDates,
    generatedAt: new Date().toISOString()
  };
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function showMenu() {
  console.log('\n' + '='.repeat(80));
  console.log('🎓 FRATERNITY INSTAGRAM POST CATEGORIZER & FORMATTER');
  console.log('='.repeat(80));
  console.log('\nSelect an option:');
  console.log('  1. Load JSON file → Process all posts → Generate report');
  console.log('  2. Single post entry → Categorize & format one post');
  console.log('  3. Generate sample report → Use demo data');
  console.log('  4. Exit\n');

  const choice = await question('Enter your choice (1-4): ');
  return choice.trim();
}

async function option1() {
  console.log('\n📂 Option 1: Batch Process JSON File\n');

  const filePath = await question('Enter path to JSON file (e.g., aplify_response.json): ');

  try {
    // Read and parse JSON file
    const fileContent = fs.readFileSync(filePath.trim(), 'utf-8');
    const postsData = JSON.parse(fileContent);

    // Handle different JSON structures
    let postsArray;
    if (Array.isArray(postsData)) {
      postsArray = postsData;
    } else if (postsData.posts && Array.isArray(postsData.posts)) {
      postsArray = postsData.posts;
    } else if (postsData.data && Array.isArray(postsData.data)) {
      postsArray = postsData.data;
    } else {
      throw new Error('Could not find posts array in JSON file');
    }

    // Process posts
    const formattedPosts = processPosts(postsArray);

    // Generate report
    const reportSummary = generateReport(formattedPosts);

    // Save formatted posts to file
    const outputFile = 'frat_posts_formatted.json';
    fs.writeFileSync(
      outputFile,
      JSON.stringify({ posts: formattedPosts, summary: reportSummary }, null, 2)
    );

    console.log(`✅ Success! Formatted posts saved to: ${outputFile}`);
    console.log(`📊 Processed ${formattedPosts.length} posts`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function option2() {
  console.log('\n✏️  Option 2: Single Post Entry\n');

  const caption = await question('Enter post caption: ');
  const username = await question('Enter Instagram username: ');
  const likesCount = parseInt(await question('Enter likes count: ') || '0');
  const commentsCount = parseInt(await question('Enter comments count: ') || '0');

  const post = {
    caption: caption,
    ownerUsername: username,
    ownerFullName: username,
    likesCount: likesCount,
    commentsCount: commentsCount,
    timestamp: new Date().toISOString(),
    url: `https://instagram.com/p/example`
  };

  const formatted = formatPost(post, 0);

  console.log('\n' + '='.repeat(80));
  console.log('📋 FORMATTED POST RESULT');
  console.log('='.repeat(80));
  console.log(JSON.stringify(formatted, null, 2));
  console.log('='.repeat(80));
}

async function option3() {
  console.log('\n🎯 Option 3: Generate Sample Report with Demo Data\n');

  // Create demo posts
  const demoPosts = [
    {
      caption: 'Rush Week 2025! Join us for info sessions October 17th from 4-7PM. Contact our rush chair at (555) 123-4567 or DM @sigmachi_rush',
      ownerFullName: 'Sigma Chi - UCLA',
      ownerUsername: 'sigmachi_ucla',
      url: 'https://instagram.com/p/demo1',
      likesCount: 245,
      commentsCount: 12,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      caption: 'Proud to announce our annual philanthropy event raised $15,000 for the American Cancer Society! Thank you to everyone who donated. 🎗️',
      ownerFullName: 'Delta Delta Delta - USC',
      ownerUsername: 'tridelta_usc',
      url: 'https://instagram.com/p/demo2',
      likesCount: 389,
      commentsCount: 24,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      caption: 'Congratulations to our newly initiated brothers! Welcome to the brotherhood. 🤝',
      ownerFullName: 'Kappa Sigma - UC Berkeley',
      ownerUsername: 'kappasig_berkeley',
      url: 'https://instagram.com/p/demo3',
      likesCount: 156,
      commentsCount: 8,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      caption: 'Homecoming mixer with the sisters of Alpha Phi! What a night 🎉',
      ownerFullName: 'Phi Kappa Psi - Stanford',
      ownerUsername: 'phipsi_stanford',
      url: 'https://instagram.com/p/demo4',
      likesCount: 421,
      commentsCount: 31,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      caption: 'Congrats to our President @john_smith on his internship at Goldman Sachs! Making us proud 🎓',
      ownerFullName: 'Beta Theta Pi - NYU',
      ownerUsername: 'beta_nyu',
      url: 'https://instagram.com/p/demo5',
      likesCount: 203,
      commentsCount: 15,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Process demo posts
  const formattedPosts = processPosts(demoPosts);

  // Generate report
  const reportSummary = generateReport(formattedPosts);

  // Save to file
  const outputFile = 'frat_posts_demo.json';
  fs.writeFileSync(
    outputFile,
    JSON.stringify({ posts: formattedPosts, summary: reportSummary }, null, 2)
  );

  console.log(`✅ Demo report saved to: ${outputFile}`);
}

async function main() {
  console.log('\n🚀 Starting Fraternity Instagram Post Categorizer & Formatter...\n');

  let running = true;

  while (running) {
    const choice = await showMenu();

    switch (choice) {
      case '1':
        await option1();
        break;
      case '2':
        await option2();
        break;
      case '3':
        await option3();
        break;
      case '4':
        console.log('\n👋 Goodbye! Thanks for using the Fraternity Post Wizard.\n');
        running = false;
        break;
      default:
        console.log('\n❌ Invalid choice. Please enter 1, 2, 3, or 4.\n');
    }

    if (running) {
      const continueChoice = await question('\nPress Enter to continue...');
    }
  }

  rl.close();
}

// ============================================================================
// EXPORTS FOR MODULE USAGE
// ============================================================================

module.exports = {
  categorizePost,
  extractContacts,
  extractEventDates,
  calculateEngagementScore,
  formatPost,
  processPosts,
  generateReport,
  CATEGORIES
};

// ============================================================================
// RUN CLI IF EXECUTED DIRECTLY
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

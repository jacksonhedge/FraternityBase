# Frat Post Wizard - Usage Examples

## Quick Start

```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
node frat_post_wizard.js
```

---

## Example 1: Process Sample Data

**Scenario:** Test the tool with included sample data

```bash
$ node frat_post_wizard.js

================================================================================
🎓 FRATERNITY INSTAGRAM POST CATEGORIZER & FORMATTER
================================================================================

Select an option:
  1. Load JSON file → Process all posts → Generate report
  2. Single post entry → Categorize & format one post
  3. Generate sample report → Use demo data
  4. Exit

Enter your choice (1-4): 3

🎯 Option 3: Generate Sample Report with Demo Data

📊 Processing 5 posts...
✓ Processed 5/5 posts

================================================================================
📊 FRATERNITY INSTAGRAM POST ANALYSIS REPORT
================================================================================

📈 OVERVIEW
   Total posts processed: 5

📁 CATEGORY BREAKDOWN
   RECRUITMENT          1 posts (20.0%)
   PHILANTHROPY         1 posts (20.0%)
   MEMBER_MILESTONES    1 posts (20.0%)
   SOCIAL_EVENTS        1 posts (20.0%)
   ACADEMICS            1 posts (20.0%)

⭐ TOP 5 POSTS BY ENGAGEMENT

   1. Phi Kappa Psi - Stanford (@phipsi_stanford)
      Score: 84/100
      Likes: 421 | Comments: 31
      Category: SOCIAL_EVENTS (78% confidence)
      Caption: Homecoming mixer with the sisters of Alpha Phi! What a night 🎉...

...

✅ Demo report saved to: frat_posts_demo.json
```

---

## Example 2: Process Your Own JSON File

**Scenario:** You have Aplify API response saved as `my_instagram_data.json`

```bash
$ node frat_post_wizard.js

Enter your choice (1-4): 1

📂 Option 1: Batch Process JSON File

Enter path to JSON file: my_instagram_data.json

📊 Processing 127 posts...
✓ Processed 127/127 posts

================================================================================
📊 FRATERNITY INSTAGRAM POST ANALYSIS REPORT
================================================================================

📈 OVERVIEW
   Total posts processed: 127

📁 CATEGORY BREAKDOWN
   RECRUITMENT          32 posts (25.2%)
   SOCIAL_EVENTS        28 posts (22.0%)
   PHILANTHROPY         21 posts (16.5%)
   MEMBER_MILESTONES    18 posts (14.2%)
   ACADEMICS            12 posts (9.4%)
   LEADERSHIP           10 posts (7.9%)
   HOMECOMING            6 posts (4.7%)

📞 CONTACTS EXTRACTED
   Total contacts found: 47
   Phone numbers: 15
   Email addresses: 8
   Instagram handles: 24

✅ Success! Formatted posts saved to: frat_posts_formatted.json
📊 Processed 127 posts
```

**Output file structure:**
```json
{
  "posts": [
    {
      "id": "post_0_1730225600000",
      "chapter": "Sigma Chi - UCLA",
      "category": "RECRUITMENT",
      "categoryConfidence": 95,
      "contacts": [
        {"type": "phone", "value": "(555) 123-4567"}
      ],
      "eventDates": ["October 17th from 4-7PM"],
      "insights": [
        "✓ Recruitment contact info available",
        "✓ Event dates mentioned (1)"
      ],
      ...
    }
  ],
  "summary": {
    "totalPosts": 127,
    "categoryBreakdown": {...},
    "topPosts": [...],
    "contactsFound": {...}
  }
}
```

---

## Example 3: Single Post Categorization

**Scenario:** Quick test of a single post

```bash
$ node frat_post_wizard.js

Enter your choice (1-4): 2

✏️  Option 2: Single Post Entry

Enter post caption: Rush Week 2025! Sign up now. Contact (555) 987-6543 or email rush@sigmachi.com. Info session October 20th at 6PM.
Enter Instagram username: sigmachi_texas
Enter likes count: 234
Enter comments count: 18

================================================================================
📋 FORMATTED POST RESULT
================================================================================
{
  "id": "post_0_1730225600000",
  "chapter": "sigmachi_texas",
  "instagram": "sigmachi_texas",
  "url": "https://instagram.com/p/example",
  "category": "RECRUITMENT",
  "categoryConfidence": 87,
  "caption": "Rush Week 2025! Sign up now. Contact (555) 987-6543 or email rush@sigmachi.com. Info session October 20th at 6PM.",
  "fullCaption": "Rush Week 2025! Sign up now. Contact (555) 987-6543 or email rush@sigmachi.com. Info session October 20th at 6PM.",
  "engagement": {
    "likes": 234,
    "comments": 18,
    "firstComment": null,
    "score": 73
  },
  "posted": "2025-10-29T12:00:00.000Z",
  "postedFormatted": "Oct 29, 2025",
  "contacts": [
    {
      "type": "phone",
      "value": "(555) 987-6543"
    },
    {
      "type": "email",
      "value": "rush@sigmachi.com"
    }
  ],
  "eventDates": [
    "October 20th at 6PM"
  ],
  "insights": [
    "✓ Recruitment contact info available",
    "✓ Event dates mentioned (1)",
    "⭐ High engagement post",
    "💬 Strong community engagement"
  ]
}
================================================================================
```

---

## Example 4: Using as a Module

**Scenario:** Integrate into your own Node.js script

```javascript
// your_script.js
const {
  categorizePost,
  extractContacts,
  processPosts,
  generateReport
} = require('./frat_post_wizard.js');

// Load your data
const fs = require('fs');
const rawData = fs.readFileSync('instagram_posts.json', 'utf-8');
const posts = JSON.parse(rawData);

// Process all posts
console.log('Processing posts...');
const formatted = processPosts(posts);

// Filter for recruitment posts with contacts
const recruitmentLeads = formatted.filter(post =>
  post.category === 'RECRUITMENT' &&
  post.contacts.length > 0
);

console.log(`Found ${recruitmentLeads.length} recruitment leads with contact info`);

// Extract all phone numbers
const phoneNumbers = recruitmentLeads
  .flatMap(post => post.contacts)
  .filter(contact => contact.type === 'phone')
  .map(contact => contact.value);

console.log('Phone numbers:', phoneNumbers);

// Generate full report
const report = generateReport(formatted);

// Save results
fs.writeFileSync(
  'recruitment_leads.json',
  JSON.stringify(recruitmentLeads, null, 2)
);

console.log('✅ Results saved to recruitment_leads.json');
```

**Run it:**
```bash
node your_script.js
```

---

## Example 5: Finding Sponsorship Opportunities

**Scenario:** Find philanthropy posts for corporate partnerships

```javascript
const { processPosts } = require('./frat_post_wizard.js');
const fs = require('fs');

// Load and process posts
const posts = JSON.parse(fs.readFileSync('instagram_data.json', 'utf-8'));
const formatted = processPosts(posts);

// Filter for high-engagement philanthropy posts
const opportunities = formatted.filter(post =>
  post.category === 'PHILANTHROPY' &&
  post.engagement.score > 60
);

// Sort by engagement
opportunities.sort((a, b) => b.engagement.score - a.engagement.score);

// Create partnership report
console.log('🎯 TOP SPONSORSHIP OPPORTUNITIES\n');
opportunities.slice(0, 10).forEach((post, i) => {
  console.log(`${i + 1}. ${post.chapter} (@${post.instagram})`);
  console.log(`   Score: ${post.engagement.score}/100`);
  console.log(`   ${post.caption.substring(0, 80)}...`);

  if (post.contacts.length > 0) {
    console.log(`   Contacts: ${post.contacts.map(c => c.value).join(', ')}`);
  }

  console.log(`   URL: ${post.url}\n`);
});

// Save to file
fs.writeFileSync(
  'sponsorship_opportunities.json',
  JSON.stringify({
    opportunities: opportunities.slice(0, 10),
    generatedAt: new Date().toISOString()
  }, null, 2)
);
```

**Output:**
```
🎯 TOP SPONSORSHIP OPPORTUNITIES

1. Delta Delta Delta - USC (@tridelta_usc)
   Score: 89/100
   Our annual philanthropy event raised $18,500 for American Cancer Society...
   URL: https://instagram.com/p/CxYz456def

2. Lambda Chi Alpha - Florida (@lambdachi_florida)
   Score: 67/100
   Community service day with @habitatforhumanity! 15 brothers built homes...
   Contacts: community@lambdachi.org
   URL: https://instagram.com/p/CxYz890bcd
```

---

## Example 6: Building Event Calendar

**Scenario:** Extract all upcoming events with dates

```javascript
const { processPosts } = require('./frat_post_wizard.js');
const fs = require('fs');

// Process posts
const posts = JSON.parse(fs.readFileSync('instagram_data.json', 'utf-8'));
const formatted = processPosts(posts);

// Find posts with event dates
const events = formatted
  .filter(post => post.eventDates.length > 0)
  .map(post => ({
    chapter: post.chapter,
    instagram: post.instagram,
    category: post.category,
    eventDates: post.eventDates,
    caption: post.caption,
    url: post.url,
    contacts: post.contacts
  }));

console.log(`📅 Found ${events.length} events\n`);

events.forEach((event, i) => {
  console.log(`${i + 1}. ${event.chapter}`);
  console.log(`   Dates: ${event.eventDates.join(', ')}`);
  console.log(`   Type: ${event.category}`);
  if (event.contacts.length > 0) {
    console.log(`   Contact: ${event.contacts[0].value}`);
  }
  console.log();
});

// Save calendar
fs.writeFileSync(
  'event_calendar.json',
  JSON.stringify(events, null, 2)
);
```

---

## Example 7: Engagement Analysis

**Scenario:** Find top-performing chapters by engagement

```javascript
const { processPosts } = require('./frat_post_wizard.js');
const fs = require('fs');

// Process posts
const posts = JSON.parse(fs.readFileSync('instagram_data.json', 'utf-8'));
const formatted = processPosts(posts);

// Calculate average engagement by chapter
const chapterStats = {};

formatted.forEach(post => {
  if (!chapterStats[post.chapter]) {
    chapterStats[post.chapter] = {
      chapter: post.chapter,
      instagram: post.instagram,
      totalPosts: 0,
      totalScore: 0,
      avgScore: 0,
      bestPost: null
    };
  }

  const stats = chapterStats[post.chapter];
  stats.totalPosts++;
  stats.totalScore += post.engagement.score;

  if (!stats.bestPost || post.engagement.score > stats.bestPost.score) {
    stats.bestPost = {
      score: post.engagement.score,
      caption: post.caption.substring(0, 60) + '...',
      url: post.url
    };
  }
});

// Calculate averages
Object.values(chapterStats).forEach(stats => {
  stats.avgScore = Math.round(stats.totalScore / stats.totalPosts);
});

// Sort by average engagement
const topChapters = Object.values(chapterStats)
  .sort((a, b) => b.avgScore - a.avgScore)
  .slice(0, 10);

// Display results
console.log('📊 TOP CHAPTERS BY ENGAGEMENT\n');
topChapters.forEach((chapter, i) => {
  console.log(`${i + 1}. ${chapter.chapter} (@${chapter.instagram})`);
  console.log(`   Avg Score: ${chapter.avgScore}/100 (${chapter.totalPosts} posts)`);
  console.log(`   Best Post: ${chapter.bestPost.score}/100`);
  console.log(`   "${chapter.bestPost.caption}"`);
  console.log();
});

// Save report
fs.writeFileSync(
  'chapter_engagement_report.json',
  JSON.stringify(topChapters, null, 2)
);
```

---

## Example 8: Contact Database Export

**Scenario:** Build a CRM-ready contact database

```javascript
const { processPosts } = require('./frat_post_wizard.js');
const fs = require('fs');

// Process posts
const posts = JSON.parse(fs.readFileSync('instagram_data.json', 'utf-8'));
const formatted = processPosts(posts);

// Build contact database
const contactDatabase = [];

formatted.forEach(post => {
  if (post.contacts.length > 0) {
    post.contacts.forEach(contact => {
      contactDatabase.push({
        chapter: post.chapter,
        instagram: post.instagram,
        contactType: contact.type,
        contactValue: contact.value,
        postCategory: post.category,
        postEngagementScore: post.engagement.score,
        postUrl: post.url,
        extractedFrom: post.caption.substring(0, 100) + '...'
      });
    });
  }
});

// Group by contact type
const byType = {
  phone: contactDatabase.filter(c => c.contactType === 'phone'),
  email: contactDatabase.filter(c => c.contactType === 'email'),
  instagram: contactDatabase.filter(c => c.contactType === 'instagram')
};

// Display summary
console.log('📞 CONTACT DATABASE SUMMARY\n');
console.log(`Total Contacts: ${contactDatabase.length}`);
console.log(`Phone Numbers: ${byType.phone.length}`);
console.log(`Emails: ${byType.email.length}`);
console.log(`Instagram Handles: ${byType.instagram.length}\n`);

// Show recruitment contacts
const recruitmentContacts = contactDatabase.filter(c =>
  c.postCategory === 'RECRUITMENT'
);

console.log(`🎯 Recruitment Contacts: ${recruitmentContacts.length}\n`);
recruitmentContacts.slice(0, 5).forEach(contact => {
  console.log(`• ${contact.chapter}`);
  console.log(`  ${contact.contactType.toUpperCase()}: ${contact.contactValue}`);
  console.log(`  Engagement: ${contact.postEngagementScore}/100`);
  console.log();
});

// Export to CSV format
const csv = [
  'Chapter,Instagram,Contact Type,Contact Value,Post Category,Engagement Score,Post URL'
];

contactDatabase.forEach(contact => {
  csv.push([
    `"${contact.chapter}"`,
    contact.instagram,
    contact.contactType,
    contact.contactValue,
    contact.postCategory,
    contact.postEngagementScore,
    contact.postUrl
  ].join(','));
});

fs.writeFileSync('contact_database.csv', csv.join('\n'));
fs.writeFileSync('contact_database.json', JSON.stringify(contactDatabase, null, 2));

console.log('✅ Contact database exported:');
console.log('   - contact_database.json');
console.log('   - contact_database.csv');
```

---

## Tips & Tricks

### 1. Filter by Confidence Score

Only process posts with high confidence:
```javascript
const highConfidence = formatted.filter(post =>
  post.categoryConfidence > 70
);
```

### 2. Find Recent High-Engagement Posts

```javascript
const recentTopPosts = formatted.filter(post => {
  const daysOld = (Date.now() - new Date(post.posted)) / (1000 * 60 * 60 * 24);
  return daysOld <= 7 && post.engagement.score > 70;
});
```

### 3. Extract Specific Contact Types

```javascript
const phoneNumbers = formatted
  .flatMap(post => post.contacts)
  .filter(contact => contact.type === 'phone')
  .map(contact => contact.value);
```

### 4. Category-Specific Queries

```javascript
// All philanthropy posts
const philanthropy = formatted.filter(p => p.category === 'PHILANTHROPY');

// All leadership posts with Instagram handles
const leadership = formatted.filter(p =>
  p.category === 'LEADERSHIP' &&
  p.contacts.some(c => c.type === 'instagram')
);
```

---

**Ready to process your Instagram data? Start with the sample data and work your way up!**

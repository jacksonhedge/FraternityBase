# 🎓 Fraternity Instagram Post Categorizer & Formatter Agent

## Overview

The **Frat Post Wizard** is an intelligent CLI tool designed for FraternityBase that automatically processes, categorizes, and formats fraternity Instagram posts from Aplify API responses. It extracts actionable insights, contact information, event dates, and generates engagement scores to help identify sponsorship opportunities and recruitment leads.

---

## 🚀 Features

### Core Capabilities

✅ **7-Category Classification System** - Automatically categorizes posts with confidence scoring
✅ **Contact Extraction** - Pulls phone numbers, emails, and Instagram handles
✅ **Event Date Parsing** - Identifies dates and times mentioned in captions
✅ **Engagement Scoring** - Calculates 0-100 score based on likes, comments, and recency
✅ **Actionable Insights** - Generates business intelligence from each post
✅ **Batch Processing** - Handle hundreds of posts in seconds
✅ **Interactive CLI** - User-friendly menu with 3 operation modes
✅ **Comprehensive Reports** - Detailed analytics with category breakdowns and top posts

---

## 📦 Installation

### Prerequisites
- Node.js v14+ installed
- Access to Aplify Instagram API responses

### Setup

```bash
# Navigate to backend directory
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend

# Make the script executable (optional)
chmod +x frat_post_wizard.js

# Run the tool
node frat_post_wizard.js
```

---

## 📊 Categorization System

The tool uses a keyword-based classification system with 7 distinct categories:

### 1. **RECRUITMENT** 🎯
**Purpose:** Identify chapters actively recruiting new members
**Keywords:** rush, recruitment, join us, sign up, info session, meet the brothers, rush chair, new members, PNM
**Business Value:** Contact info extraction for recruitment outreach

**Example:**
```
"Rush Week 2025! Join us October 17th from 4-7PM.
Contact rush chair at (555) 123-4567"
→ Category: RECRUITMENT (95% confidence)
→ Insights: "✓ Recruitment contact info available"
```

### 2. **PHILANTHROPY** 🎗️
**Purpose:** Identify charitable events and sponsorship opportunities
**Keywords:** philanthropy, fundraiser, charity, donate, foundation, cause, volunteer, community service
**Business Value:** Partnership opportunities with brands aligned to causes

**Example:**
```
"Our annual philanthropy raised $18,500 for American Cancer Society!"
→ Category: PHILANTHROPY (87% confidence)
→ Insights: "🎯 Sponsorship/partnership opportunity"
```

### 3. **MEMBER_MILESTONES** 🎓
**Purpose:** Track member achievements and chapter growth
**Keywords:** new member, pledge, initiation, graduation, congrats, sweetheart, elected
**Business Value:** Engagement metrics, chapter health indicators

**Example:**
```
"Congratulations to our 14 newly initiated brothers!"
→ Category: MEMBER_MILESTONES (82% confidence)
```

### 4. **SOCIAL_EVENTS** 🎉
**Purpose:** Identify parties, mixers, and social gatherings
**Keywords:** party, mixer, social, homecoming, trip, tailgate, formal, date party
**Business Value:** Event sponsorship opportunities, brand activation

**Example:**
```
"Homecoming mixer with Alpha Phi! What a night 🎉"
→ Category: SOCIAL_EVENTS (78% confidence)
→ Insights: "⭐ High engagement post"
```

### 5. **LEADERSHIP** 👥
**Purpose:** Track leadership changes and executive boards
**Keywords:** president, vice president, executive board, officer, treasurer, elected position
**Business Value:** Leadership contact database, decision-maker identification

**Example:**
```
"New executive board announcement: President @tommy_anderson..."
→ Category: LEADERSHIP (91% confidence)
→ Insights: "👥 Leadership visibility - good for transparency"
```

### 6. **ACADEMICS** 📚
**Purpose:** Identify academic achievements and career success
**Keywords:** internship, career, professional, alumni, scholarship, dean's list, GPA, networking
**Business Value:** Recruitment marketing, alumni engagement, professional partnerships

**Example:**
```
"Congrats to @john_smith on his Goldman Sachs internship!"
→ Category: ACADEMICS (88% confidence)
→ Insights: "🎓 Success story - great for recruitment marketing"
```

### 7. **HOMECOMING** 🏛️
**Purpose:** Track anniversaries and founder celebrations
**Keywords:** homecoming, anniversary, founder, alumni reunion, legacy, tradition, heritage
**Business Value:** Alumni engagement opportunities, historical significance

**Example:**
```
"Celebrating our chapter's 150th anniversary with 200+ alumni!"
→ Category: HOMECOMING (94% confidence)
```

---

## 🎯 How It Works

### Input Format

The tool expects JSON data with the following structure:

```json
[
  {
    "caption": "Post caption text with hashtags",
    "ownerFullName": "Sigma Chi - UCLA",
    "ownerUsername": "sigmachi_ucla",
    "url": "https://instagram.com/p/CxYz123abc",
    "commentsCount": 15,
    "firstComment": "First comment text",
    "likesCount": 287,
    "timestamp": "2025-10-15T18:30:00.000Z"
  }
]
```

### Output Format

Each post is transformed into:

```json
{
  "id": "post_0_1730225600000",
  "chapter": "Sigma Chi - UCLA",
  "instagram": "sigmachi_ucla",
  "url": "https://instagram.com/p/CxYz123abc",
  "category": "RECRUITMENT",
  "categoryConfidence": 95,
  "caption": "Rush Week 2025! Join us October 17th from 4-7PM...",
  "fullCaption": "Full caption text...",
  "engagement": {
    "likes": 287,
    "comments": 15,
    "firstComment": "Can't wait! What should I bring?",
    "score": 78
  },
  "posted": "2025-10-15T18:30:00.000Z",
  "postedFormatted": "Oct 15, 2025",
  "contacts": [
    {"type": "phone", "value": "(555) 123-4567"},
    {"type": "instagram", "value": "@sigmachi_rush"}
  ],
  "eventDates": ["October 17th from 4-7PM"],
  "insights": [
    "✓ Recruitment contact info available",
    "✓ Event dates mentioned (1)",
    "⭐ High engagement post",
    "💬 Strong community engagement"
  ]
}
```

---

## 🔧 Key Functions

### 1. `categorizePost(caption)`
**Purpose:** Classify a post into one of 7 categories
**Returns:** `{ category: "RECRUITMENT", confidence: 95 }`

**Algorithm:**
1. Convert caption to lowercase
2. Count keyword matches for each category
3. Calculate confidence score (matches / total keywords * 100)
4. Return category with highest match count

### 2. `extractContacts(caption)`
**Purpose:** Extract contact information
**Returns:** Array of `{ type, value }` objects

**Patterns Detected:**
- **Phone:** `(555) 123-4567`, `555-123-4567`, `5551234567`
- **Email:** `user@domain.com`, `first.last@university.edu`
- **Instagram:** `@username`, `@first.last`

**Example:**
```javascript
extractContacts("Contact: (555) 123-4567 or @rush_chair")
// Returns: [
//   { type: "phone", value: "(555) 123-4567" },
//   { type: "instagram", value: "@rush_chair" }
// ]
```

### 3. `extractEventDates(caption)`
**Purpose:** Parse dates and times from text
**Returns:** Array of date strings

**Patterns Detected:**
- `October 17th from 4-7PM`
- `10/17/2025`
- `Saturday, October 17th`
- `4:00-7:00 PM`

**Example:**
```javascript
extractEventDates("Join us October 17th from 4-7PM!")
// Returns: ["October 17th from 4-7PM"]
```

### 4. `calculateEngagementScore(post)`
**Purpose:** Calculate engagement quality (0-100)
**Returns:** Integer score

**Algorithm:**
```
Score = Likes Score (max 50) + Comments Score (max 30) + Recency Score (max 20)

Likes Score:
  - 0 likes → 0 points
  - 500+ likes → 50 points
  - Linear scale between

Comments Score:
  - 0 comments → 0 points
  - 50+ comments → 30 points
  - Linear scale between

Recency Score:
  - 0-7 days old → 20 points (full)
  - 8-30 days old → Linear decay to 0
  - 30+ days old → 0 points
```

**Example:**
```javascript
// Post with 250 likes, 15 comments, posted 3 days ago
calculateEngagementScore(post)
// Returns: 78
// Breakdown: 25 (likes) + 9 (comments) + 20 (recency) = 54
```

### 5. `generateInsights(post, category, contacts, eventDates)`
**Purpose:** Generate actionable business insights
**Returns:** Array of insight strings

**Insight Rules:**
- Recruitment + contacts → "✓ Recruitment contact info available"
- Recruitment + no contacts → "⚠️ Consider adding contact info"
- Event dates found → "✓ Event dates mentioned (count)"
- Likes > 200 → "⭐ High engagement post"
- Comments > 10 → "💬 Strong community engagement"
- Philanthropy category → "🎯 Sponsorship/partnership opportunity"
- Low engagement → "📊 Low engagement - consider boosting"
- Leadership category → "👥 Leadership visibility - good for transparency"
- Academics category → "🎓 Success story - great for recruitment marketing"

### 6. `processPosts(postsArray)`
**Purpose:** Batch process multiple posts
**Returns:** Array of formatted posts sorted by engagement score

**Process:**
1. Iterate through each post
2. Apply categorization, extraction, and formatting
3. Show progress indicator
4. Sort results by engagement score (highest first)
5. Return formatted array

### 7. `generateReport(formattedPosts)`
**Purpose:** Create comprehensive analytics report
**Returns:** Report summary object

**Report Includes:**
- Total posts processed
- Category breakdown (counts + percentages)
- Chapter breakdown (top 10)
- Top 5 posts by engagement
- Total contacts found (by type)
- Event dates mentioned
- Key insights summary
- Generation timestamp

---

## 🖥️ Interactive CLI Modes

### Mode 1: Batch Process JSON File

**Use Case:** Process Aplify API response with 100+ posts

**Steps:**
1. Select option 1 from menu
2. Provide path to JSON file (e.g., `sample_aplify_response.json`)
3. Tool processes all posts
4. Generates comprehensive report
5. Saves output to `frat_posts_formatted.json`

**Example:**
```bash
$ node frat_post_wizard.js

Select an option:
  1. Load JSON file → Process all posts → Generate report
  2. Single post entry → Categorize & format one post
  3. Generate sample report → Use demo data
  4. Exit

Enter your choice (1-4): 1

Enter path to JSON file: sample_aplify_response.json

📊 Processing 12 posts...
✓ Processed 12/12 posts

================================================================================
📊 FRATERNITY INSTAGRAM POST ANALYSIS REPORT
================================================================================

📈 OVERVIEW
   Total posts processed: 12

📁 CATEGORY BREAKDOWN
   RECRUITMENT          3 posts (25.0%)
   PHILANTHROPY         2 posts (16.7%)
   MEMBER_MILESTONES    2 posts (16.7%)
   SOCIAL_EVENTS        2 posts (16.7%)
   LEADERSHIP           1 posts (8.3%)
   ACADEMICS            1 posts (8.3%)
   HOMECOMING           1 posts (8.3%)

...

✅ Success! Formatted posts saved to: frat_posts_formatted.json
📊 Processed 12 posts
```

### Mode 2: Single Post Entry

**Use Case:** Quick categorization of a single post

**Steps:**
1. Select option 2
2. Enter post caption
3. Enter Instagram username
4. Enter likes count
5. Enter comments count
6. View formatted result

**Example:**
```bash
Enter your choice (1-4): 2

Enter post caption: Rush Week 2025! Contact (555) 123-4567
Enter Instagram username: sigmachi_ucla
Enter likes count: 150
Enter comments count: 8

================================================================================
📋 FORMATTED POST RESULT
================================================================================
{
  "id": "post_0_1730225600000",
  "chapter": "sigmachi_ucla",
  "category": "RECRUITMENT",
  "categoryConfidence": 95,
  ...
}
```

### Mode 3: Demo Report

**Use Case:** Test tool functionality with sample data

**Steps:**
1. Select option 3
2. Tool loads 5 demo posts
3. Processes and generates report
4. Saves to `frat_posts_demo.json`

**Example:**
```bash
Enter your choice (1-4): 3

🎯 Option 3: Generate Sample Report with Demo Data

📊 Processing 5 posts...
✓ Processed 5/5 posts

[Full report displayed...]

✅ Demo report saved to: frat_posts_demo.json
```

---

## 📈 Engagement Scoring Deep Dive

### Score Distribution

**0-30:** Low engagement (consider boosting, post timing issues)
**31-60:** Moderate engagement (typical performance)
**61-80:** High engagement (performing well)
**81-100:** Viral/exceptional engagement (top-tier content)

### Example Calculations

**Post 1: Recent High Performer**
- 450 likes → 45/50 points
- 25 comments → 15/30 points
- Posted 2 days ago → 20/20 points
- **Total: 80/100** ⭐ High engagement

**Post 2: Older Moderate Performer**
- 200 likes → 20/50 points
- 10 comments → 6/30 points
- Posted 15 days ago → 8/20 points
- **Total: 34/100** Moderate engagement

**Post 3: Recent Low Performer**
- 50 likes → 5/50 points
- 3 comments → 2/30 points
- Posted 1 day ago → 20/20 points
- **Total: 27/100** ⚠️ Low engagement

---

## 🎯 Business Use Cases

### Use Case 1: Recruitment Lead Generation

**Scenario:** Brand wants to sponsor rush events

**Workflow:**
1. Run tool on Instagram data
2. Filter for `RECRUITMENT` category
3. Extract posts with contacts
4. Sort by engagement score
5. Identify top-performing chapters with contact info

**Result:** List of chapters actively recruiting with contact details

### Use Case 2: Philanthropy Partnerships

**Scenario:** Corporation looking for charitable partnerships

**Workflow:**
1. Process Instagram posts
2. Filter for `PHILANTHROPY` category
3. Identify causes mentioned (cancer, education, etc.)
4. Extract contact information
5. Prioritize high-engagement chapters

**Result:** Targeted list of chapters with alignment to corporate values

### Use Case 3: Alumni Engagement

**Scenario:** Alumni network building outreach list

**Workflow:**
1. Process posts
2. Filter for `HOMECOMING` and `ACADEMICS` categories
3. Extract alumni mentions (@handles)
4. Build contact database

**Result:** Alumni database with engagement history

### Use Case 4: Event Sponsorship Opportunities

**Scenario:** Beverage company seeking event sponsorships

**Workflow:**
1. Process Instagram data
2. Filter for `SOCIAL_EVENTS` category
3. Extract event dates
4. Prioritize high-engagement posts
5. Identify chapters with large events

**Result:** Calendar of sponsorship opportunities

---

## 📊 Sample Report Output

```
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

🏛️  CHAPTER BREAKDOWN
   Sigma Chi - UCLA                          12 posts
   Delta Delta Delta - USC                   11 posts
   Kappa Sigma - UC Berkeley                 10 posts
   Beta Theta Pi - NYU                        9 posts
   Phi Kappa Psi - Stanford                   8 posts
   [... 5 more chapters]

⭐ TOP 5 POSTS BY ENGAGEMENT

   1. Delta Delta Delta - USC (@tridelta_usc)
      Score: 89/100
      Likes: 512 | Comments: 42
      Category: PHILANTHROPY (87% confidence)
      Caption: INCREDIBLE NEWS! Our annual philanthropy event raised $18,500...
      URL: https://instagram.com/p/CxYz456def

   2. Phi Kappa Psi - Stanford (@phipsi_stanford)
      Score: 84/100
      Likes: 456 | Comments: 37
      Category: SOCIAL_EVENTS (78% confidence)
      Caption: Last night was LEGENDARY! Homecoming mixer with @alphaphi_stanfo...
      URL: https://instagram.com/p/CxYz012jkl

   [... 3 more posts]

📞 CONTACTS EXTRACTED
   Total contacts found: 47
   Phone numbers: 15
   Email addresses: 8
   Instagram handles: 24

📅 EVENT DATES FOUND
   Total event dates mentioned: 23

💡 KEY INSIGHTS
   ⭐ High engagement post (18 posts)
   ✓ Recruitment contact info available (12 posts)
   💬 Strong community engagement (16 posts)
   🎯 Sponsorship/partnership opportunity (21 posts)
   ✓ Event dates mentioned (23 posts)
   [... 5 more insights]

📝 REPORT METADATA
   Generated: October 29, 2025 at 10:45:32 AM
   Tool: Fraternity Instagram Post Categorizer & Formatter v1.0

================================================================================
```

---

## 🔌 Using as a Module

The tool can be imported into other Node.js scripts:

```javascript
const {
  categorizePost,
  extractContacts,
  extractEventDates,
  calculateEngagementScore,
  formatPost,
  processPosts,
  generateReport
} = require('./frat_post_wizard.js');

// Example: Process a single post
const post = {
  caption: "Rush Week 2025! Contact (555) 123-4567",
  ownerUsername: "sigmachi_ucla",
  likesCount: 150,
  commentsCount: 8,
  timestamp: new Date().toISOString()
};

const formatted = formatPost(post, 0);
console.log(formatted);

// Example: Batch process
const posts = [...]; // Array of posts
const processed = processPosts(posts);
const report = generateReport(processed);
```

---

## 🧪 Testing

### Test with Sample Data

```bash
# Use included sample file
node frat_post_wizard.js

# Select option 1
# Enter: sample_aplify_response.json
```

### Create Your Own Test Data

```json
[
  {
    "caption": "Your test caption here",
    "ownerFullName": "Test Chapter",
    "ownerUsername": "test_chapter",
    "url": "https://instagram.com/p/test",
    "commentsCount": 10,
    "likesCount": 100,
    "timestamp": "2025-10-29T12:00:00.000Z"
  }
]
```

Save as `test_data.json` and process with the tool.

---

## 📂 Output Files

### frat_posts_formatted.json

Contains full processed data:
```json
{
  "posts": [
    {
      "id": "post_0_...",
      "chapter": "Sigma Chi - UCLA",
      "category": "RECRUITMENT",
      ...
    }
  ],
  "summary": {
    "totalPosts": 127,
    "categoryBreakdown": {...},
    "topPosts": [...],
    "contactsFound": {...},
    "generatedAt": "2025-10-29T12:00:00.000Z"
  }
}
```

### frat_posts_demo.json

Sample output with demo data for testing.

---

## 🛠️ Troubleshooting

### Issue: "Cannot find module"

**Solution:** Ensure you're in the correct directory
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
```

### Issue: JSON parsing error

**Solution:** Validate your JSON file
```bash
# Test JSON validity
cat your_file.json | python -m json.tool
```

### Issue: No contacts extracted

**Solution:** Check caption format. Contacts must be in recognized patterns:
- Phone: `(555) 123-4567`
- Email: `user@domain.com`
- Instagram: `@username`

### Issue: Low confidence scores

**Solution:** This is normal if the caption doesn't contain category keywords. Posts with mixed content may score lower.

---

## 🚀 Advanced Features

### Custom Category Keywords

Edit the `CATEGORIES` object in the code to add custom keywords:

```javascript
const CATEGORIES = {
  RECRUITMENT: {
    keywords: [
      'rush', 'recruitment', 'join us',
      // Add your custom keywords here
      'open house', 'meet and greet'
    ]
  }
}
```

### Adjust Engagement Scoring

Modify the `calculateEngagementScore()` function to change weights:

```javascript
// Current: Likes (50) + Comments (30) + Recency (20)
// Custom: Prioritize comments over likes
const likesScore = Math.min(30, (likesCount / 500) * 30);
const commentsScore = Math.min(50, (commentsCount / 50) * 50);
```

---

## 📞 Support

**Issues or questions?**
- Email: admin@fraternitybase.com
- File location: `/CollegeOrgNetwork/backend/frat_post_wizard.js`
- Documentation: `/CollegeOrgNetwork/FRAT_POST_WIZARD_README.md`

---

## 📝 Version History

**v1.0.0** (October 29, 2025)
- Initial release
- 7-category classification system
- Contact extraction (phone, email, Instagram)
- Event date parsing
- Engagement scoring algorithm
- Interactive CLI with 3 modes
- Comprehensive reporting
- Module export support

---

**Built for FraternityBase** 🎓
**Last Updated:** October 29, 2025

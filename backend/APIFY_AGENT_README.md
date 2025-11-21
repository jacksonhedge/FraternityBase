# 🤖 Apify Agent Toolkit

> **Automated Instagram scraping, opportunity detection, and CRM integration**

## 🎯 What This Does

This toolkit acts as an intelligent agent for managing your Apify Instagram scraping workflow:

1. **Generate** optimized Apify input JSON for any fraternity
2. **Parse** Apify output data into structured format
3. **Detect** engagement opportunities using AI-like scoring
4. **Import** everything to your Supabase database automatically

---

## 🚀 Quick Start

### 1. Generate Apify Input

```bash
node apify_helper.js generate "Sigma Chi" 4
```

**Output:** `apify_input_sigma_chi.json`

This creates an optimized JSON file with:
- All Sigma Chi Instagram URLs from your database
- 4 posts per account
- Comment scraping enabled
- Residential proxies configured

### 2. Run in Apify

1. Go to [Apify Instagram Profile Scraper](https://apify.com/apify/instagram-profile-scraper)
2. Paste the generated JSON
3. Click "Start"
4. Download results as JSON

### 3. Process & Import

```bash
node apify_helper.js process ./downloaded_results.json
```

**This automatically:**
- ✅ Parses all post data
- ✅ Detects opportunities (scores each post)
- ✅ Imports to `chapter_posts` table
- ✅ Links to correct chapters
- ✅ Skips duplicates

---

## 📊 What Gets Detected

### Opportunity Scoring Algorithm

```javascript
High Value Keywords (15 points each):
├─ "sponsor", "partnership"
├─ "looking for", "seeking" (10 points)
└─ "vendor needs" (12 points)

Event Types (8-10 points):
├─ "philanthropy", "fundraiser", "charity"
├─ "recruitment", "rush"
└─ "formal", "date party"

Engagement Signals:
├─ Vendor questions in comments (+10)
├─ High engagement rate >5% (+5)
└─ Posted in last 7 days (+3)

Threshold: 10+ points = Opportunity
```

### Example Detection

**Post Caption:**
> "Looking for a DJ for our formal next month! Recommendations? 🎵 #SigmaChi #DateParty"

**Detection:**
- ✅ "looking for" = +10 points
- ✅ "dj" = +12 points
- ✅ #formal = event type classified
- ✅ Posted 2 days ago = +3 points
- **Total: 25 points = HIGH OPPORTUNITY**

**Result in CRM:**
```javascript
{
  is_opportunity: true,
  opportunity_score: 25,
  opportunity_reason: "Mentioned 'looking for', Mentioned 'dj', Posted within last 7 days",
  detected_event_type: "social"
}
```

---

## 🔧 Advanced Usage

### Generate for Different Fraternities

```bash
# Phi Delta Theta with 10 posts each
node apify_helper.js generate "Phi Delta Theta" 10

# Lambda Chi Alpha with 20 posts
node apify_helper.js generate "Lambda Chi Alpha" 20
```

### Use as JavaScript Module

```javascript
import {
  generateApifyInput,
  parseApifyOutput,
  detectOpportunities,
  importToDatabase,
  processApifyData
} from './apify_helper.js';

// Generate config programmatically
const config = await generateApifyInput('Sigma Chi', 50);

// Parse specific data
const parsed = parseApifyOutput(apifyJsonData);

// Just detect opportunities (no import)
const analyzed = detectOpportunities(parsedPosts);

// Full pipeline
await processApifyData('./results.json');
```

---

## 📁 Output Structure

### Parsed Post Object

```javascript
{
  // Identification
  instagram_post_id: "C7xYz123",
  post_url: "https://instagram.com/p/C7xYz123",
  owner_username: "michigansigmachi",

  // Content
  caption: "Rush week starts tonight! 🎉",
  media_urls: ["https://..."],
  hashtags: ["#rush2024", "#sigmachi"],
  mentions: ["@president_mike"],

  // Engagement
  like_count: 342,
  comment_count: 28,
  engagement_rate: 6.5,

  // Timing
  posted_at: "2024-11-15T19:30:00Z",

  // Location
  location_name: "Sigma Chi House",

  // Comments (captured!)
  comments: [
    {
      text: "Can't wait! Bringing 3 friends",
      username: "recruit_2024",
      timestamp: "2024-11-15T20:00:00Z"
    }
  ],

  // AI Detection
  is_opportunity: true,
  opportunity_score: 25,
  opportunity_reason: "Mentioned 'rush', High engagement",
  detected_event_type: "recruitment",
  opportunity_keywords: ["rush", "recruitment"]
}
```

---

## 🎓 Workflow Examples

### Weekly Scrape Workflow

```bash
#!/bin/bash
# weekly_scrape.sh

# Generate fresh config (20 recent posts)
node apify_helper.js generate "Sigma Chi" 20

# Open Apify in browser
open "https://apify.com/apify/instagram-profile-scraper"

# After scrape completes, download to ./downloads/
# Then process:
node apify_helper.js process ./downloads/latest_scrape.json

# View in CRM
open "http://localhost:3000/admin/crm"
```

### Multi-Fraternity Pipeline

```javascript
// scrape_all_fraternities.js

const fraternities = [
  'Sigma Chi',
  'Phi Delta Theta',
  'Lambda Chi Alpha',
  'Sigma Alpha Epsilon'
];

for (const frat of fraternities) {
  // Generate input
  const config = await generateApifyInput(frat, 10);

  // Save for manual Apify run
  fs.writeFileSync(`./configs/${frat}.json`, JSON.stringify(config, null, 2));

  console.log(`✅ Config ready for ${frat}`);
}

console.log('🚀 Upload each JSON to Apify and download results');
console.log('📥 Then run: node apify_helper.js process ./results.json');
```

---

## 🔍 Opportunity Detection Logic

### Keyword Categories

**Partnership Signals (High Value):**
- sponsor, partnership, looking for, seeking, need

**Event Types:**
- Philanthropy: philanthropy, fundraiser, charity, giving back
- Recruitment: rush, recruitment, meet the house
- Social: formal, date party, mixer, tailgate
- Brotherhood: brotherhood, chapter meeting

**Vendor Needs:**
- photographer, dj, catering, merch, merchandise, apparel
- venue, location, space rental

### Comment Analysis

Scans comments for:
- Vendor questions: "Who did your DJ?"
- Event RSVPs: "Can't wait!", "See you there"
- Planning mentions: "@social_chair this is amazing"

### Engagement Scoring

```javascript
// High engagement = Active chapter = Better opportunity
if (post.engagement_rate > 5%) score += 5;  // Very active
if (post.engagement_rate > 3%) score += 3;  // Active
if (post.engagement_rate > 1%) score += 1;  // Normal

// Recent = Timely outreach
const daysAgo = daysSince(post.posted_at);
if (daysAgo < 3)  score += 5;  // Very recent
if (daysAgo < 7)  score += 3;  // Recent
if (daysAgo < 14) score += 1;  // Semi-recent
```

---

## 💾 Database Schema

Posts get imported to `chapter_posts` table:

```sql
CREATE TABLE chapter_posts (
  id UUID PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id),

  -- Post Data
  instagram_post_id TEXT UNIQUE,
  post_url TEXT,
  caption TEXT,
  media_urls TEXT[],

  -- Engagement
  like_count INTEGER,
  comment_count INTEGER,
  engagement_rate DECIMAL(5,2),

  -- Classification
  post_type TEXT,
  detected_event_type TEXT,
  hashtags TEXT[],

  -- Opportunity Detection
  is_opportunity BOOLEAN,
  opportunity_reason TEXT,
  opportunity_score INTEGER,

  -- Timing
  posted_at TIMESTAMP,
  scraped_at TIMESTAMP
);
```

---

## 📈 Cost Estimates

### Apify Credits

| Scrape Size | Posts | Cost |
|------------|-------|------|
| Test (4 posts × 75) | 300 | $0.50 |
| Weekly (10 posts × 75) | 750 | $1.50 |
| Monthly (50 posts × 75) | 3,750 | $7.50 |
| Full (100 posts × 75) | 7,500 | $15 |

**With Comments:** Add ~30% to cost

---

## 🚨 Common Issues

### Issue: "Chapter not found for @username"

**Solution:** Instagram handle in database doesn't match Apify output

```bash
# Check database handles
SELECT instagram_handle FROM chapters WHERE fraternity_name = 'Sigma Chi';

# Update if needed
UPDATE chapters SET instagram_handle = '@michigansigmachi' WHERE ...;
```

### Issue: All posts marked as duplicates

**Solution:** Already imported - adjust date filter or clear old data

```sql
-- See existing posts
SELECT COUNT(*), MAX(scraped_at) FROM chapter_posts;

-- Delete old test data
DELETE FROM chapter_posts WHERE scraped_at < '2024-11-01';
```

### Issue: Low opportunity detection

**Solution:** Adjust keyword weights in `apify_helper.js`

```javascript
const keywordWeights = {
  'sponsor': 20,  // Increase from 15
  'looking for': 15,  // Increase from 10
  // ... customize for your needs
};
```

---

## 🎯 Integration with CRM

### View Opportunities in CRM

After import, opportunities appear in your CRM automatically:

```javascript
// API endpoint already returns opportunities
GET /api/admin/crm/opportunities

// Filters by:
- is_opportunity = true
- opportunity_score DESC
- posted_at recent first
```

### Trigger Outreach

```javascript
// In your CRM, when viewing a high-score opportunity:
if (post.opportunity_score > 20) {
  // Show "Reach Out Now" button
  // Pre-fill DM template with event context
  // Track in communications log
}
```

---

## 📚 Files Reference

```
backend/
├── apify_helper.js                    # Main toolkit
├── sigma_chi_instagram_scrape.json    # Basic config
├── sigma_chi_instagram_scrape_optimized.json  # Enhanced config
├── APIFY_CONFIG_EXPLAINED.md          # Full strategy guide
└── APIFY_AGENT_README.md              # This file
```

---

## 🔄 Recommended Schedule

**Initial Setup:**
1. Run with 50 posts to build historical data
2. Review opportunity detection accuracy
3. Adjust keyword weights if needed

**Ongoing:**
- **Weekly:** 10-20 posts per chapter (catch new content)
- **Monthly:** Full 50-post scrape for comprehensive data
- **Daily for VIPs:** 5 posts for partnership-level chapters

---

## 💡 Pro Tips

1. **Test First:** Always run with 4 posts first to verify config
2. **Check Handles:** Ensure Instagram handles in DB match reality
3. **Customize Keywords:** Adjust weights for your specific opportunities
4. **Monitor Costs:** Residential proxies cost more but prevent blocks
5. **Batch Process:** Run multiple fraternities, then bulk import

---

## 🚀 Next Steps

1. **Generate your first config:**
   ```bash
   node apify_helper.js generate "Sigma Chi" 4
   ```

2. **Run in Apify:**
   - Paste JSON into Apify actor
   - Start scrape
   - Download results

3. **Import to CRM:**
   ```bash
   node apify_helper.js process ./results.json
   ```

4. **View opportunities:**
   - Open CRM at `http://localhost:3000/admin/crm`
   - Filter by "Opportunities (30d)"
   - Start reaching out!

---

**Questions?** Check `APIFY_CONFIG_EXPLAINED.md` for deep technical details.

**Ready to scale?** This toolkit can handle unlimited fraternities and posts!

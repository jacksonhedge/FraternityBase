# Apify Instagram Scraper - Optimized for Event Extraction

## 🎯 Configuration Goal
Extract event data, leadership information, and engagement opportunities from 75 Sigma Chi Instagram accounts.

## 📋 Optimized JSON Settings

### Core Settings
```json
"resultsLimit": 4
```
**Why:** Testing mode - pulls 4 recent posts per account (300 total posts)
**For Production:** Increase to 20-50 to capture more event history

```json
"resultsType": "posts"
```
**Why:** Focus on post content, not just profile data
**Returns:** Individual post objects with full metadata

```json
"searchType": "user"
```
**Why:** Scraping from user profile pages (not hashtags or locations)
**Returns:** Posts from each specific Instagram handle

### Event Timing Settings

```json
"addParentData": true
```
**Why:** Includes profile metadata (followers, bio) with each post
**Event Value:** Profile bio often contains contact info and chapter details
**Returns:**
- `ownerUsername`
- `followersCount`
- `biography` (may contain president name, email)

### Leadership Identification

```json
"scrapePostComments": true,
"scrapePostCommentsCount": 20
```
**Why:** Comments reveal:
- Event RSVPs ("See you there!")
- Leader mentions ("Thanks @president_mike for organizing")
- Event details not in caption ("Starts at 7pm")
- Vendor questions ("Who did your DJ?")

**Returns Per Post:**
- `comments[]` array with:
  - `text` - Comment content
  - `ownerUsername` - Who commented
  - `timestamp` - When commented
  - `likesCount` - Comment engagement

### Data Quality Settings

```json
"proxy": {
  "useApifyProxy": true,
  "apifyProxyGroups": ["RESIDENTIAL"]
}
```
**Why:** Residential proxies avoid Instagram rate limiting
**Prevents:** Blocks, captchas, missing data
**Cost:** Higher but necessary for reliable scraping

## 📊 What Data You'll Get

### Per Post Object:
```javascript
{
  // POST METADATA
  "id": "C7xYz...",
  "url": "https://instagram.com/p/C7xYz...",
  "shortCode": "C7xYz",
  "timestamp": "2024-11-15T19:30:00.000Z",
  "type": "Photo", // or "Video", "Sidecar" (carousel)

  // TIMING DATA (Extract event dates from caption)
  "caption": "🎉 Rush Week starts TONIGHT at 7pm! See everyone at the house. Register at link in bio. #Rush2024 #SigmaChi",
  "timestamp": "2024-11-15T19:30:00.000Z", // When POSTED

  // ENGAGEMENT METRICS (Identify popular events)
  "likesCount": 342,
  "commentsCount": 28,
  "videoViewCount": 0,

  // LEADER IDENTIFICATION
  "taggedUsers": ["@vp_recruiting", "@social_chair"],
  "mentions": ["@president_mike", "@alumni_advisor"],

  // EVENT TYPE SIGNALS
  "hashtags": ["#rush2024", "#sigmachi", "#philanthropy", "#dateparty"],

  // LOCATION (Event venue)
  "locationName": "Sigma Chi House",
  "locationId": "123456789",

  // MEDIA
  "displayUrl": "https://instagram.com/...",
  "imageUrls": ["..."],

  // COMMENTS (Event details hidden here!)
  "comments": [
    {
      "text": "Can't wait! Bringing 3 friends",
      "ownerUsername": "potential_recruit_23",
      "timestamp": "2024-11-15T20:00:00.000Z"
    },
    {
      "text": "Who's the DJ for this?",
      "ownerUsername": "social_chair",
      "timestamp": "2024-11-15T20:15:00.000Z"
    }
  ],

  // PROFILE DATA (From addParentData: true)
  "ownerUsername": "michigansigmachi",
  "ownerId": "123456",
  "ownerFullName": "Sigma Chi - Michigan",
  "ownerFollowers": 2847,
  "ownerBio": "President: Mike Johnson | Email: president@michigansigmachi.com | est. 1877"
}
```

## 🎯 Event Extraction Strategy

### 1. Timing Detection
**Caption Analysis:**
- "tonight at 7pm" → Extract time
- "this Saturday" → Calculate date
- "Nov 18th" → Parse explicit date
- "Register by Friday" → Deadline detection

**Timestamp Logic:**
```
Post timestamp: Nov 15, 7:30pm
Caption says: "Rush starts TONIGHT at 7pm"
Actual event: Nov 15, 7:00pm (same day)
```

### 2. Leader Identification
**From Tagged Users:**
- `@vp_recruiting` → Vice President
- `@philanthropy_chair` → Event organizer

**From Bio:**
- "President: Mike Johnson" → Parse leadership
- "Contact: president@..." → Direct contact

**From Comments:**
- "Thanks @president_mike" → Identify president
- "@social_chair crushing it" → Identify social chair

### 3. Event Type Classification
**Hashtag Signals:**
- `#rush`, `#recruitment` → Recruitment event
- `#philanthropy`, `#charity` → Philanthropic event
- `#formal`, `#dateparty` → Social event
- `#brotherhood` → Internal event

**Caption Keywords:**
```javascript
const eventTypes = {
  recruitment: ["rush", "recruitment", "meet the house"],
  philanthropy: ["philanthropy", "fundraiser", "charity", "giving back"],
  social: ["formal", "date party", "mixer", "tailgate"],
  vendor_need: ["sponsor", "looking for DJ", "need photographer", "seeking vendor"]
}
```

### 4. Opportunity Scoring
**High-Value Signals:**
- Caption contains "looking for", "need", "sponsor" → Vendor opportunity
- High engagement (>5% engagement rate) → Active chapter
- Recent post (last 7 days) → Timely outreach
- Comments asking about vendors → Direct need
- Hashtags like #philanthropy → Partnership opportunity

## 🚀 Next Steps After Scraping

### 1. Import to Database
Parse the JSON and insert into your `chapter_posts` table:
```sql
INSERT INTO chapter_posts (
  chapter_id,
  instagram_post_id,
  post_url,
  caption,
  like_count,
  comment_count,
  posted_at,
  is_opportunity,
  opportunity_reason,
  opportunity_score
) VALUES (...)
```

### 2. Run Opportunity Detection
```javascript
function detectOpportunity(post) {
  const keywords = {
    sponsor: 15,
    partnership: 15,
    'looking for': 10,
    vendor: 12,
    photographer: 12,
    DJ: 12,
    philanthropy: 8
  };

  let score = 0;
  let reasons = [];

  for (const [keyword, weight] of Object.entries(keywords)) {
    if (post.caption.toLowerCase().includes(keyword)) {
      score += weight;
      reasons.push(`Mentioned "${keyword}"`);
    }
  }

  // Check comments for vendor questions
  const vendorComments = post.comments.filter(c =>
    c.text.toLowerCase().match(/who.*?(dj|photographer|vendor|catering)/)
  );

  if (vendorComments.length > 0) {
    score += 10;
    reasons.push(`${vendorComments.length} vendor-related comments`);
  }

  return {
    isOpportunity: score >= 10,
    score,
    reason: reasons.join(', ')
  };
}
```

### 3. Update CRM
Trigger notifications in your CRM when:
- High opportunity score detected
- Event happening within 30 days
- Chapter posted recently (active engagement)

## 💰 Cost Estimate
**Testing (4 posts × 75 accounts):**
- ~300 posts
- ~$0.50 - $1.00

**Production (50 posts × 75 accounts):**
- ~3,750 posts
- ~$5 - $10

**With Comments:**
- Add ~$2-3 for comment scraping

## 🔄 Recommended Schedule
- **Initial scrape:** 50 posts to build historical data
- **Weekly scrapes:** 10-20 posts to catch new content
- **Daily for high-priority chapters:** 5 posts for partnership chapters

---

## 📁 File Location
`/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/sigma_chi_instagram_scrape_optimized.json`

Ready to paste into Apify and run!

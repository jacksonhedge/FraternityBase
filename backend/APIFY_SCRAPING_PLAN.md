# Apify Scraping Plan for FraternityBase

## Overview
Now that we have **792 fraternity Instagram handles** across Power 5 universities, we need to scrape Instagram data to enrich our database with real-time metrics and content.

## Current Database State
- **Total chapters:** 5,268
- **Chapters with Instagram handles:** 792
- **Power 5 schools covered:** 36 universities
- **New data just added:** 655 Instagram handles

---

## What to Scrape with Apify

### 1. Instagram Profile Data (Primary)

**Apify Actor:** `apify/instagram-profile-scraper`

**Data Points to Collect:**
- **Username** (for verification)
- **Full Name** (chapter display name)
- **Bio/Description** (chapter description)
- **Profile Picture URL** (for chapter avatars)
- **Follower Count** (popularity metric)
- **Following Count** (engagement indicator)
- **Post Count** (activity level)
- **Is Verified** (authenticity check)
- **Is Private** (accessibility flag)
- **External URL** (chapter website)
- **Category** (if available)

**Why:**
- Display chapter metrics on FraternityBase
- Rank chapters by follower count
- Identify active vs inactive chapters
- Populate chapter profile pages

**Frequency:** Daily or weekly updates

---

### 2. Instagram Posts (Secondary)

**Apify Actor:** `apify/instagram-post-scraper`

**Data Points to Collect:**
- **Post URL**
- **Caption/Text**
- **Media URLs** (images/videos)
- **Like Count**
- **Comment Count**
- **Post Date**
- **Post Type** (photo, video, carousel)
- **Hashtags**
- **Tagged Accounts**

**Why:**
- Show recent chapter activity
- Display event photos
- Identify recruitment content
- Track engagement trends

**Strategy:** Scrape last 10-20 posts per chapter

**Frequency:** Weekly

---

### 3. Instagram Stories (Optional)

**Apify Actor:** `apify/instagram-story-scraper`

**Data Points:**
- **Story media**
- **View count**
- **Story type**

**Why:**
- Track real-time chapter events
- Monitor recruitment activities
- Identify trending content

**Frequency:** Daily (stories expire after 24h)

---

## Database Schema Additions Needed

### New Tables

#### `chapter_instagram_metrics`
```sql
CREATE TABLE chapter_instagram_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  followers INTEGER,
  following INTEGER,
  post_count INTEGER,
  is_verified BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  profile_pic_url TEXT,
  bio TEXT,
  external_url TEXT,
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_chapter_instagram_metrics_chapter ON chapter_instagram_metrics(chapter_id);
CREATE INDEX idx_chapter_instagram_metrics_scraped ON chapter_instagram_metrics(scraped_at DESC);
```

#### `chapter_posts` (Optional)
```sql
CREATE TABLE chapter_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  instagram_post_id TEXT UNIQUE,
  post_url TEXT NOT NULL,
  caption TEXT,
  media_urls TEXT[],
  like_count INTEGER,
  comment_count INTEGER,
  posted_at TIMESTAMP,
  post_type TEXT, -- 'photo', 'video', 'carousel'
  hashtags TEXT[],
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chapter_posts_chapter ON chapter_posts(chapter_id);
CREATE INDEX idx_chapter_posts_posted_at ON chapter_posts(posted_at DESC);
```

---

## Apify Implementation Plan

### Phase 1: Profile Scraping (Priority 1)
**Goal:** Get baseline metrics for all 792 Instagram handles

**Steps:**
1. Export Instagram handles from Supabase:
```sql
SELECT c.id, c.instagram_handle, u.name as university, g.name as fraternity
FROM chapters c
JOIN universities u ON c.university_id = u.id
JOIN greek_organizations g ON c.greek_organization_id = g.id
WHERE c.instagram_handle IS NOT NULL
ORDER BY u.name, g.name;
```

2. Create Apify task with `apify/instagram-profile-scraper`
   - Input: List of Instagram usernames
   - Max concurrency: 10-20 (to avoid rate limits)
   - Proxy: Use residential proxies

3. Process results and import to `chapter_instagram_metrics` table

**Estimated Cost:** ~$5-10 for 792 profiles (depends on Apify pricing tier)

**Expected Duration:** 1-2 hours

---

### Phase 2: Historical Posts (Priority 2)
**Goal:** Get recent 10-20 posts per chapter for content display

**Steps:**
1. Use same chapter list from Phase 1
2. Configure `apify/instagram-post-scraper`:
   - Limit: 20 posts per profile
   - Include captions, media, engagement
   - Skip private accounts

3. Import to `chapter_posts` table

**Estimated Cost:** ~$20-40 (more intensive than profiles)

**Expected Duration:** 3-4 hours

---

### Phase 3: Ongoing Monitoring (Priority 3)
**Goal:** Keep data fresh with scheduled updates

**Schedule:**
- **Profile metrics:** Every 3 days (to track follower growth)
- **New posts:** Weekly (to display recent content)
- **Stories:** Daily (optional, for real-time events)

**Implementation:**
- Use Apify Schedules (built-in cron jobs)
- Set up webhooks to Supabase Edge Functions for auto-import
- Monitor for failed scrapes (private accounts, deleted profiles)

---

## Data Quality Considerations

### Handle Invalid/Private Accounts
```sql
-- Mark chapters with private Instagram accounts
UPDATE chapters
SET status = 'private_instagram'
WHERE instagram_handle IN (
  SELECT instagram_handle FROM failed_scrapes WHERE reason = 'private_account'
);
```

### Handle Deleted Accounts
```sql
-- Flag chapters with deleted/suspended Instagram
UPDATE chapters
SET instagram_handle = NULL,
    notes = 'Instagram account no longer exists'
WHERE instagram_handle IN (
  SELECT instagram_handle FROM failed_scrapes WHERE reason = 'account_not_found'
);
```

---

## API Integration

### Supabase Edge Function for Apify Webhook

```typescript
// supabase/functions/apify-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const apifyData = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Process Instagram profile data
  for (const profile of apifyData.items) {
    await supabase
      .from('chapter_instagram_metrics')
      .insert({
        chapter_id: profile.chapterId, // Map from username
        followers: profile.followersCount,
        following: profile.followingCount,
        post_count: profile.postsCount,
        is_verified: profile.verified,
        is_private: profile.private,
        profile_pic_url: profile.profilePicUrl,
        bio: profile.biography,
        external_url: profile.externalUrl,
      })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

---

## Expected Outcomes

### After Phase 1:
- ✅ Follower counts for all 792 chapters
- ✅ Chapter profile pictures for website display
- ✅ Bio descriptions for chapter pages
- ✅ Ability to rank chapters by popularity
- ✅ Identify inactive/private/deleted accounts

### After Phase 2:
- ✅ Recent posts displayed on chapter pages
- ✅ Engagement metrics (likes, comments)
- ✅ Event photos and recruitment content
- ✅ Hashtag analysis for trends

### After Phase 3:
- ✅ Real-time chapter activity tracking
- ✅ Growth metrics over time
- ✅ Automated weekly reports
- ✅ Alerts for major follower changes

---

## Cost Estimate

**One-Time Initial Scrape:**
- Profile data (792 accounts): ~$10
- Posts (792 × 20 posts): ~$40
- **Total:** ~$50

**Monthly Ongoing:**
- Profile updates (3x/week): ~$30/month
- Post updates (weekly): ~$40/month
- **Total:** ~$70/month

**Annual:** ~$840/year

---

## Alternative: Build Custom Scraper

If Apify costs are too high, consider:
1. **Instagram Basic Display API** (free, but limited)
2. **Custom Puppeteer/Playwright scraper** (requires maintenance)
3. **Instagram Graph API** (requires business accounts)

**Recommendation:** Start with Apify for reliability, then optimize costs later if needed.

---

## Next Steps

1. ✅ Complete Power 5 Instagram handle import (DONE)
2. ⏳ Create Apify account and set up billing
3. ⏳ Create database tables (`chapter_instagram_metrics`)
4. ⏳ Run Phase 1 profile scraping
5. ⏳ Build Supabase Edge Function for data import
6. ⏳ Set up Apify webhook to auto-import data
7. ⏳ Create admin dashboard to view scraped data
8. ⏳ Schedule ongoing scrapes

---

## Questions to Answer

1. **Do we want to scrape all 792 chapters or just Power 5 initially?**
   - Recommendation: Start with Power 5 (655 chapters) to test

2. **How often should we update metrics?**
   - Recommendation: Weekly for now, daily once we have more users

3. **Do we need post content or just metrics?**
   - Recommendation: Start with metrics only, add posts later

4. **Should we track Stories?**
   - Recommendation: Skip for now (expire quickly, high cost)

5. **What's the budget for scraping?**
   - Recommendation: Start with $50 one-time, $50/month ongoing

---

## Success Metrics

After implementing Apify scraping, measure:
- ✅ % of Instagram handles successfully scraped
- ✅ Average follower count by conference
- ✅ Top 10 most popular chapters
- ✅ Chapters with most engagement
- ✅ Growth rate week-over-week

---

**Last Updated:** $(date)
**Status:** Ready to implement
**Owner:** Jackson Fitzgerald

# FraternityBase CRM System Guide

## Overview

The FraternityBase CRM is a **Kanban-style management system** for tracking outreach and engagement opportunities with fraternity chapters. It combines Instagram data scraping, AI-powered post analysis, and contact management to help you identify and act on partnership opportunities.

## 🎯 Key Features

1. **Kanban Board Workflow** - Drag chapters through outreach stages:
   - Not Contacted → Reached Out → Responded → In Conversation → Partnership
   - Plus: Not Interested, Archived

2. **Engagement Opportunity Detection** - Automatically identifies posts with partnership potential based on:
   - Event types (recruitment, philanthropy, socials)
   - Recent activity (posted in last 7 days)
   - Keyword matching (sponsor, vendor, partnership signals)

3. **Contact Management** - Track primary contacts, notes, follow-up dates, and communication history

4. **Engagement Scoring** - Auto-calculated score (0-100) based on:
   - Follower count
   - Recent posting activity
   - Post engagement rates
   - Opportunity posts

---

## 📊 Database Schema

### Core Tables

#### `chapter_outreach`
Tracks outreach status and contact information for each chapter.

```sql
- id (UUID)
- chapter_id (FK to chapters)
- status (not_contacted | reached_out | responded | in_conversation | partnership | not_interested | archived)
- primary_contact_name
- primary_contact_role
- contact_email
- contact_phone
- last_contact_date
- next_follow_up_date
- first_contacted_at
- engagement_score (0-100, auto-calculated)
- priority (low | medium | high | urgent)
- notes
```

#### `chapter_communications`
Logs all interactions with chapters.

```sql
- id (UUID)
- chapter_id (FK)
- type (dm | email | phone | comment | meeting | other)
- direction (outbound | inbound)
- subject
- content
- instagram_post_url
- instagram_dm_thread_id
- communicated_at
```

#### `chapter_instagram_metrics`
Stores Instagram profile data from Apify scraping.

```sql
- id (UUID)
- chapter_id (FK)
- followers
- following
- post_count
- is_verified
- is_private
- profile_pic_url
- bio
- external_url
- scraped_at
```

#### `chapter_posts`
Stores Instagram post data with engagement opportunity flags.

```sql
- id (UUID)
- chapter_id (FK)
- instagram_post_id
- post_url
- caption
- media_urls (array)
- like_count
- comment_count
- engagement_rate (calculated)
- post_type (photo | video | carousel)
- detected_event_type (recruitment | philanthropy | social | etc.)
- hashtags (array)
- is_opportunity (boolean)
- opportunity_reason (text)
- opportunity_score (0-100)
- posted_at
```

#### `engagement_keywords`
Defines keywords that trigger opportunity detection.

```sql
- id (UUID)
- keyword
- category (event_type | partnership_signal | vendor_need)
- weight (score boost amount)
```

---

## 🚀 Getting Started

### 1. Database Setup

The CRM tables are already created via the migration:
```bash
# Migration was applied on 2025-11-18
# File: backend/migrations/create_crm_tables.sql
```

### 2. Scrape Instagram Data (Apify)

Follow the [APIFY_SCRAPING_PLAN.md](./APIFY_SCRAPING_PLAN.md) to:

1. Set up Apify account
2. Configure `apify/instagram-profile-scraper` for profile metrics
3. Configure `apify/instagram-post-scraper` for post content
4. Import scraped data to `chapter_instagram_metrics` and `chapter_posts` tables

### 3. Analyze Engagement Opportunities

Run the analysis script to identify opportunities:

```bash
# Analyze all posts from last 30 days
npm run analyze:opportunities

# Analyze last 7 days only
npm run analyze:opportunities -- --days=7

# Analyze specific chapter
npm run analyze:opportunities -- --chapter=CHAPTER_UUID
```

This will:
- Flag posts as opportunities (`is_opportunity = true`)
- Add opportunity reasons
- Calculate opportunity scores (0-100)
- Detect event types
- Recalculate engagement scores for all chapters

### 4. Access the CRM Dashboard

Navigate to: `/crm` (or whatever route you configure)

---

## 🎨 Using the Kanban Board

### Drag & Drop

- Click and drag chapter cards between columns to update their status
- Status updates are saved automatically
- Engagement scores update in real-time when new posts/metrics are added

### Chapter Cards

Each card shows:
- **Fraternity name** and **University**
- **Instagram handle** (clickable)
- **Engagement score** (0-100)
- **Follower count**
- **Recent posts** (last 7 days)
- **Opportunities** (last 30 days) - highlighted in green if > 0
- **Primary contact name** (if set)
- **Priority level** (low, medium, high, urgent)
- **Next follow-up date** (if scheduled)

### Filters & Views

Top stats show counts for each pipeline stage:
- Not Contacted
- Reached Out
- Responded
- In Conversation
- Partnership
- Not Interested
- Archived

### View Chapter Details

Click "View Details →" on any card to open the detail modal with 3 tabs:

1. **Details Tab**
   - Edit contact information
   - Set priority level
   - Schedule next follow-up
   - Add notes

2. **Posts Tab**
   - View recent Instagram posts
   - See which are flagged as opportunities
   - Read AI-generated opportunity reasons
   - Click through to view on Instagram

3. **Communications Tab**
   - Log DMs, emails, calls, comments
   - Track inbound vs outbound communications
   - View communication history timeline

---

## 📋 API Endpoints

### Dashboard

```
GET /api/admin/crm/dashboard
```

Returns all chapters with CRM data, grouped by outreach status.

Response:
```json
{
  "success": true,
  "chapters": [...],
  "grouped": {
    "not_contacted": [...],
    "reached_out": [...],
    ...
  },
  "summary": {
    "total": 792,
    "not_contacted": 650,
    "reached_out": 80,
    ...
  }
}
```

### Chapter Details

```
GET /api/admin/crm/chapters/:chapterId
```

Returns detailed chapter info, outreach record, posts, and communications.

### Update Outreach

```
POST /api/admin/crm/chapters/:chapterId/outreach
```

Create or update outreach record (contact info, notes, priority, follow-up date).

Body:
```json
{
  "status": "reached_out",
  "primary_contact_name": "John Doe - President",
  "contact_email": "president@chapter.com",
  "priority": "high",
  "next_follow_up_date": "2025-12-01",
  "notes": "Interested in spring rush sponsorship"
}
```

### Update Status (Kanban)

```
PATCH /api/admin/crm/chapters/:chapterId/status
```

Update just the outreach status (for drag-and-drop).

Body:
```json
{
  "status": "in_conversation"
}
```

### Log Communication

```
POST /api/admin/crm/chapters/:chapterId/communications
```

Log an interaction with a chapter.

Body:
```json
{
  "type": "dm",
  "direction": "outbound",
  "subject": "Rush sponsorship inquiry",
  "content": "Reached out about sponsoring their fall rush events",
  "communicated_at": "2025-11-18T10:00:00Z"
}
```

### Get Posts

```
GET /api/admin/crm/chapters/:chapterId/posts?limit=20&opportunities_only=true
```

Get Instagram posts for a chapter.

### Get Opportunities

```
GET /api/admin/crm/opportunities?days=30&limit=50
```

Get top engagement opportunities across all chapters.

### Get Follow-ups

```
GET /api/admin/crm/follow-ups
```

Get chapters with follow-up dates in the next 7 days.

### Bulk Status Update

```
POST /api/admin/crm/bulk-status-update
```

Update status for multiple chapters at once.

Body:
```json
{
  "chapter_ids": ["uuid1", "uuid2", "uuid3"],
  "status": "archived"
}
```

---

## 🤖 Engagement Opportunity Logic

### Opportunity Detection Algorithm

Posts are scored based on:

1. **Keyword Matching** (from `engagement_keywords` table)
   - Event types: recruitment (+10), philanthropy (+8), social (+5)
   - Partnership signals: sponsor (+15), vendor (+12), looking for (+8)
   - Vendor needs: merch (+10), photographer (+12), DJ (+12)

2. **Recent Activity**
   - Posted in last 7 days: +10 points

3. **High Engagement**
   - Engagement rate > 5%: +15 points

4. **Event Detection**
   - Recruitment/rush: +15 points
   - Philanthropy: +12 points
   - Social events: +10 points
   - Brotherhood: +5 points
   - Sports: +5 points

5. **Partnership Signals**
   - Keywords like "sponsor", "partnership", "looking for": +20 points

6. **Vendor Needs**
   - Keywords like "merch", "photographer", "DJ", "catering": +12 points

**Threshold**: Posts with score ≥ 20 are flagged as opportunities.

### Adding Custom Keywords

Insert into `engagement_keywords` table:

```sql
INSERT INTO engagement_keywords (keyword, category, weight)
VALUES
  ('new member', 'event_type', 10),
  ('collaboration', 'partnership_signal', 15),
  ('t-shirt', 'vendor_need', 8);
```

---

## 📈 Engagement Score Calculation

Each chapter gets an engagement score (0-100) based on:

1. **Follower Count** (0-30 points)
   - Score = MIN(30, followers / 100)
   - Example: 2,500 followers = 25 points

2. **Recent Activity** (0-25 points)
   - 5 points per post in last 7 days
   - Example: 3 posts in last week = 15 points

3. **Engagement Rate** (0-20 points)
   - Average engagement rate from last 30 days
   - Example: 7% engagement = 7 points

4. **Opportunity Posts** (0-25 points)
   - 5 points per opportunity post in last 30 days
   - Example: 4 opportunity posts = 20 points

**Auto-Updates**: Scores recalculate automatically when:
- New posts are added (`chapter_posts` trigger)
- Instagram metrics are updated (`chapter_instagram_metrics` trigger)

---

## 🔄 Workflows

### Daily Workflow

1. **Check Opportunities Tab**
   - Review new posts flagged as opportunities
   - Identify hot leads (recent activity + high engagement)

2. **Process Follow-ups**
   - Check chapters with follow-up dates today
   - Move chapters through pipeline based on responses

3. **Log Communications**
   - Record all DMs, emails, calls
   - Update contact information as you learn more

### Weekly Workflow

1. **Run Apify Scrapes**
   - Update Instagram metrics (followers, post count)
   - Scrape new posts from last 7 days

2. **Analyze New Posts**
   ```bash
   npm run analyze:opportunities -- --days=7
   ```

3. **Review Pipeline**
   - Follow up with chapters in "Reached Out" for > 7 days
   - Archive inactive conversations

### Monthly Workflow

1. **Full Metrics Update**
   - Run comprehensive Apify scrape (all 792 chapters)
   - Analyze all posts from last 30 days

2. **Pipeline Review**
   - Move stale chapters to "Not Interested" or "Archived"
   - Celebrate new partnerships! 🎉

---

## 🎯 Best Practices

### Contact Management

- **Always log communications** - Even quick DMs should be tracked
- **Set follow-up dates** - Schedule next touchpoint immediately after contact
- **Add detailed notes** - Include context: what they're interested in, budget, timeline
- **Update priority** - High = active conversation, Urgent = time-sensitive opportunity

### Engagement Opportunities

- **Act fast on recent posts** - Opportunities in last 24-48 hours have highest conversion
- **Personalize outreach** - Reference specific posts/events in your DM
- **Target high-engagement chapters** - Higher engagement = more active chapter

### Pipeline Management

- **Don't skip stages** - Move chapters through pipeline systematically
- **Archive non-responsive** - After 3 follow-ups with no response, archive
- **Regular pipeline reviews** - Weekly check-ins prevent leads from going cold

---

## 🛠️ Troubleshooting

### Missing Engagement Scores

Run recalculation manually:
```sql
SELECT calculate_engagement_score('CHAPTER_UUID');
```

### No Opportunities Detected

1. Check if posts exist in `chapter_posts`
2. Verify keywords in `engagement_keywords` table
3. Run analysis script manually
4. Lower threshold (default: 20) if needed

### Slow Kanban Board

- Limit posts fetched per chapter (default: 20)
- Add pagination to opportunity feed
- Index on `chapter_posts.posted_at` already exists

---

## 📊 Success Metrics

Track these KPIs in the CRM:

- **Conversion Rate**: Partnerships / Total Chapters (target: 10%+)
- **Response Rate**: Responded / Reached Out (target: 30%+)
- **Average Time to Partnership**: Days from first contact to partnership
- **Opportunity Conversion**: Partnerships from opportunity posts vs. cold outreach
- **Top Performing Schools**: Which universities convert best?
- **Top Performing Events**: Which event types lead to partnerships?

---

## 🔮 Future Enhancements

Ideas for v2.0:

1. **Automated Outreach**
   - AI-generated DM templates based on post content
   - Schedule DMs to send at optimal times
   - A/B test different outreach messages

2. **Advanced Analytics**
   - Cohort analysis (by school, by Greek org, by semester)
   - Engagement trending (which chapters are growing fastest?)
   - Predictive scoring (ML model to predict conversion likelihood)

3. **Integration**
   - Slack notifications for new high-score opportunities
   - CRM webhooks for external tools (Zapier, Make)
   - Email campaigns (Resend integration for batch outreach)

4. **Mobile App**
   - Quick logging on the go
   - Push notifications for follow-ups
   - Swipe interface for pipeline management

---

## 📧 Support

Questions? Issues? Contact: [Your Contact Info]

Or file an issue in the GitHub repo.

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
**Owner**: Jackson Fitzgerald

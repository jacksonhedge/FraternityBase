# Admin Page Enhancement Plan

## Business Case Analysis
**FraternityBase/CollegeOrgNetwork** is a B2B SaaS platform where companies pay to unlock contact information for Greek organizations (fraternities/sororities) at universities. Revenue comes from:
- Credit purchases for chapter unlocks
- Subscription plans for access
- Premium features and data exports

## Current Admin Tabs (Keep All)
1. ✅ **Dashboard** - Overview stats
2. ✅ **Companies** - B2B customer management
3. ✅ **Fraternities** - Greek organization data
4. ✅ **Colleges** - University management
5. ✅ **Chapters** - Individual chapter data
6. ✅ **Users** - Chapter member contacts
7. ✅ **Waitlist** - Lead management

---

## NEW TABS TO ADD

### 8. 💰 **Payments & Revenue**
**Purpose:** Track all financial transactions and revenue

**Sections:**
- **Transaction History Table**
  - Date, Company, Amount, Type (credit purchase, subscription, unlock)
  - Payment method, Status, Invoice link
  - Search & filter by date range, company, amount

- **Revenue Analytics**
  - Total revenue (today, week, month, all-time)
  - MRR (Monthly Recurring Revenue)
  - Revenue by company (top spenders)
  - Revenue by unlock type (contact vs full chapter)
  - Average transaction value
  - Payment success/failure rate

- **Stripe Integration View**
  - Recent charges
  - Failed payments needing attention
  - Refund history

**Key Metrics Cards:**
- Total Revenue (All Time)
- This Month's Revenue
- Average Order Value
- Failed Payments (requires action)

---

### 9. 📊 **Chapter Unlocks Analytics**
**Purpose:** Track what's being unlocked and by whom

**Sections:**
- **Unlock History Table**
  - Date, Company, Chapter Name, University, Type, Credits Spent, Cost
  - Filter by company, university, date range
  - Export to CSV

- **Unlock Analytics**
  - Total unlocks (by day/week/month)
  - Most unlocked chapters (top 20)
  - Most popular universities
  - Most popular fraternities/sororities
  - Unlock type breakdown (contacts only vs full data)
  - Average credits per unlock

- **Unlock Trends**
  - Line chart: Unlocks over time
  - Bar chart: Unlocks by university
  - Pie chart: Unlock type distribution

**Key Metrics Cards:**
- Total Unlocks (All Time)
- This Month's Unlocks
- Average Credits per Unlock
- Most Popular Chapter

---

### 10. 💳 **Credits & Pricing**
**Purpose:** Manage credit system and pricing

**Sections:**
- **Credit Usage Overview**
  - Total credits purchased
  - Total credits spent
  - Credits remaining (across all companies)
  - Credit purchase trends

- **Credit Packages Management**
  - Edit credit package pricing
  - Set bulk discounts
  - Configure unlock costs per chapter type

- **Pricing Analytics**
  - Revenue per credit
  - Most popular credit packages
  - Discount usage tracking

**Key Metrics Cards:**
- Total Credits Sold
- Total Credits Spent
- Credits Outstanding
- Average $ per Credit

---

### 11. 🏢 **Company Intelligence**
**Purpose:** Deep dive into B2B customer behavior

**Sections:**
- **Company Performance Table**
  - Company name, Credits balance, Total spent, Unlocks count
  - Last active, Account age, Status
  - Sort by any column

- **Company Health Metrics**
  - Active companies (used in last 30 days)
  - Churned companies (no activity 90+ days)
  - High-value customers (top 10%)
  - At-risk customers (declining usage)

- **Company Cohort Analysis**
  - Retention by signup month
  - LTV by cohort
  - Usage patterns over time

- **Individual Company Deep Dive** (click to expand)
  - Full transaction history
  - All unlocks with details
  - Team members
  - Credit purchase history
  - Usage trends graph
  - Engagement score

**Key Metrics Cards:**
- Total Active Companies
- Churned This Month
- Average LTV
- Highest Spending Company

---

### 12. 📈 **Business Analytics**
**Purpose:** High-level business intelligence

**Sections:**
- **Growth Metrics**
  - New signups (daily/weekly/monthly)
  - Conversion rate (waitlist → paid)
  - Customer acquisition cost
  - Churn rate

- **Engagement Metrics**
  - Daily/Weekly/Monthly active companies
  - Average unlocks per company
  - Feature adoption rates
  - Time to first unlock

- **Geographic Analytics**
  - Revenue by state
  - Unlocks by university conference
  - Most profitable regions

- **Product Analytics**
  - Most searched universities
  - Most viewed chapters
  - Search → unlock conversion
  - Feature usage heatmap

**Dashboards:**
- Executive Summary (CEO view)
- Sales Performance (revenue trends)
- Product Health (engagement metrics)
- Customer Success (retention, churn)

---

### 13. 🎯 **Marketing & Partnerships**
**Purpose:** Track partnership opportunities and marketing

**Sections:**
- **Top Unlocked Chapters**
  - Identify popular chapters for partnership outreach
  - Contact info for partnership development
  - Track outreach status

- **University Partnership Opportunities**
  - Universities with high unlock rates
  - Revenue potential by school
  - Partnership status tracking

- **Company Referrals**
  - Track referral sources
  - Affiliate/partner revenue
  - Referral conversion rates

---

### 14. ⚙️ **System Health**
**Purpose:** Technical monitoring and admin tools

**Sections:**
- **System Metrics**
  - API response times
  - Database query performance
  - Error rates and logs
  - Uptime monitoring

- **Data Quality**
  - Incomplete chapter profiles
  - Missing contact information
  - Duplicate entries
  - Data verification status

- **Admin Actions Log**
  - Track all admin changes
  - User modifications
  - Data updates
  - System configurations

---

## ENHANCED DASHBOARD VIEW

Update the main dashboard with:

### Quick Stats Row (Top)
- Total Revenue (with % change)
- Active Companies (with % change)
- Chapter Unlocks This Month (with % change)
- Credits Remaining (across all companies)

### Charts Section
1. **Revenue Trend** (Line chart, last 30 days)
2. **Unlocks by University** (Bar chart, top 10)
3. **Credit Usage** (Pie chart: used vs remaining)
4. **Company Activity** (Heatmap, last 7 days)

### Action Items Section
- Failed payments needing attention
- Low-credit companies (under 10 credits)
- High-value customers ready for upsell
- Data quality issues to fix

### Recent Activity Feed
- Latest unlocks (last 10)
- Recent credit purchases (last 10)
- New company signups (last 10)
- Latest payments (last 10)

---

## IMPLEMENTATION PRIORITY

### Phase 1 (Week 1) - Revenue Focus
1. ✅ Payments & Revenue tab
2. ✅ Enhanced Dashboard with revenue metrics
3. ✅ Transaction history table

### Phase 2 (Week 2) - Product Analytics
1. ✅ Chapter Unlocks Analytics tab
2. ✅ Credits & Pricing tab
3. ✅ Unlock trends and charts

### Phase 3 (Week 3) - Customer Intelligence
1. ✅ Company Intelligence tab
2. ✅ Company health metrics
3. ✅ Individual company deep dive

### Phase 4 (Week 4) - Business Intelligence
1. ✅ Business Analytics tab
2. ✅ Marketing & Partnerships tab
3. ✅ System Health tab

---

## NEW DATABASE QUERIES NEEDED

### For Payments & Revenue:
```sql
-- Get all transactions with company info
SELECT t.*, c.name as company_name
FROM transactions t
JOIN companies c ON t.company_id = c.id
ORDER BY created_at DESC;

-- Monthly recurring revenue
SELECT DATE_TRUNC('month', created_at) as month, SUM(amount)
FROM transactions
WHERE type = 'subscription'
GROUP BY month;
```

### For Chapter Unlocks:
```sql
-- Most unlocked chapters
SELECT ch.chapter_name, u.name as university, COUNT(*) as unlock_count
FROM chapter_unlocks cu
JOIN chapters ch ON cu.chapter_id = ch.id
JOIN universities u ON ch.university_id = u.id
GROUP BY ch.id, u.name
ORDER BY unlock_count DESC
LIMIT 20;

-- Unlock trends over time
SELECT DATE(created_at) as date, COUNT(*) as unlocks
FROM chapter_unlocks
GROUP BY date
ORDER BY date;
```

### For Company Intelligence:
```sql
-- Company performance metrics
SELECT
  c.id,
  c.name,
  c.credits_balance,
  COUNT(cu.id) as total_unlocks,
  SUM(cu.credits_spent) as total_credits_spent,
  MAX(cu.created_at) as last_active
FROM companies c
LEFT JOIN chapter_unlocks cu ON c.id = cu.company_id
GROUP BY c.id;

-- At-risk companies (no activity in 30 days)
SELECT c.*
FROM companies c
LEFT JOIN chapter_unlocks cu ON c.id = cu.company_id
WHERE cu.created_at < NOW() - INTERVAL '30 days'
OR cu.id IS NULL;
```

---

## UI/UX ENHANCEMENTS

### Navigation
- **Left Sidebar** with icon-based menu
- Group tabs by category:
  - 📊 Overview (Dashboard)
  - 💼 Business (Companies, Payments, Analytics)
  - 🎓 Data (Colleges, Fraternities, Chapters, Users)
  - 📈 Growth (Waitlist, Marketing)
  - ⚙️ System (Health, Settings)

### Visual Improvements
- **Color-coded metrics** (green = good, red = needs attention)
- **Trend indicators** (↑↓ arrows with percentages)
- **Interactive charts** (hover for details, click to filter)
- **Export buttons** (CSV, PDF) on all tables
- **Date range pickers** for all analytics
- **Real-time updates** for critical metrics

### Filters & Search
- Global search across all entities
- Advanced filters on every table
- Save filter presets
- Bulk actions on table rows

---

## API ENDPOINTS TO ADD

### Revenue Analytics
- `GET /api/admin/revenue/summary` - Total revenue, MRR, trends
- `GET /api/admin/revenue/transactions` - Transaction history
- `GET /api/admin/revenue/by-company` - Revenue breakdown

### Unlock Analytics
- `GET /api/admin/unlocks/summary` - Total unlocks, trends
- `GET /api/admin/unlocks/popular-chapters` - Most unlocked
- `GET /api/admin/unlocks/by-university` - University breakdown
- `GET /api/admin/unlocks/history` - Full unlock history

### Company Intelligence
- `GET /api/admin/companies/performance` - All companies with metrics
- `GET /api/admin/companies/:id/deep-dive` - Individual company details
- `GET /api/admin/companies/health` - Health metrics
- `GET /api/admin/companies/at-risk` - Companies needing attention

### Business Analytics
- `GET /api/admin/analytics/growth` - Signup trends, conversion
- `GET /api/admin/analytics/engagement` - DAU, MAU, retention
- `GET /api/admin/analytics/geographic` - Location-based insights

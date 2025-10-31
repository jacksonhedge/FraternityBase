# FraternityBase Codebase Architecture Summary

**Last Updated:** October 29, 2025  
**Supabase Project ID:** `vvsawtexgpopqxgaqyxg`  
**Backend URL:** https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api  

---

## 1. DATABASE SCHEMA & RELATIONSHIPS

### Core Tables

#### **universities** (Locations)
- `id` (UUID, PK)
- `name`, `state`, `location`
- `student_count`, `greek_percentage`
- `website`, `logo_url`
- **Usage:** Map/filter fraternity chapters by college location

#### **greek_organizations** (National Orgs)
- `id` (UUID, PK)
- `name`, `greek_letters` (e.g., "ΣΧ")
- `organization_type` (fraternity, sorority, honor_society)
- `founded_year`, `total_chapters`, `total_members`
- `national_website`, `colors`, `philanthropy`
- **Usage:** National fraternity/sorority data (Sigma Chi, Delta Delta Delta, etc.)

#### **chapters** (Local Chapters)
- `id` (UUID, PK)
- `greek_organization_id` (FK), `university_id` (FK)
- `chapter_name`, `status` (active, inactive, suspended, colony)
- `member_count`, `officer_count`
- `grade` (numeric, 1-5 scale for quality rating)
- `is_platinum` (boolean, referred partners)
- `is_viewable` (boolean, visibility control)
- `is_favorite` (boolean, admin priority)
- `house_address`, `contact_email`, `phone`
- `instagram_handle`, `website`, `facebook_page`
- `engagement_score` (0-100)
- **UNIQUE:** (greek_organization_id, university_id)
- **Usage:** Individual chapter records for chapters list, detail pages, map view

#### **chapter_officers** (Roster/Contacts)
- `id` (UUID, PK)
- `chapter_id` (FK)
- `name`, `position` (President, Treasurer, etc.)
- `email`, `phone`, `linkedin_profile`
- `graduation_year`, `major`
- `is_primary_contact` (boolean)
- **CONSTRAINT:** `position` NOT NULL (defaults to 'Member')
- **Usage:** Contact information (locked behind unlocks), roster management

#### **companies** (Brands/Sponsors)
- `id` (UUID, PK)
- `name`, `industry`, `company_size`
- `website`, `logo_url`, `description`
- `headquarters_location`, `target_demographics` (JSONB)
- `partnership_types` (TEXT array)
- **Usage:** Brand profiles, subscription management, unlock tracking

#### **company_users** (Employees)
- `id` (UUID, PK)
- `company_id` (FK)
- `email` (UNIQUE), `password_hash`
- `first_name`, `last_name`, `position`, `role`
- `is_verified`, `last_login`
- **Usage:** Authentication, company team management via Supabase Auth

---

### Unlock & Billing Tables

#### **chapter_unlocks** (Access Control)
- `id` (UUID, PK)
- `chapter_id` (FK), `company_id` (FK)
- `unlock_type` (full_contacts, partial, preview)
- `amount_paid` (DECIMAL)
- `transaction_id` (FK to balance_transactions)
- `unlocked_at`, `expires_at`
- **Usage:** Track which companies have unlocked which chapters, access control logic

#### **account_balance** (Credit System)
- `id` (UUID, PK)
- `company_id` (FK, UNIQUE)
- `balance_dollars` (DECIMAL, >= 0)
- `balance_credits` (INTEGER, >= 0)
- `lifetime_spent_dollars`, `lifetime_added_dollars`
- `lifetime_spent_credits`, `lifetime_earned_credits`
- `subscription_tier` (trial, monthly, team, enterprise)
- `last_monthly_credit_grant_at`
- `stripe_customer_id`, `stripe_payment_method_id`
- `auto_reload_enabled`, `auto_reload_threshold`, `auto_reload_amount`
- **Usage:** Track company credit balance, subscription status

#### **balance_transactions** (Audit Log)
- `id` (UUID, PK)
- `company_id` (FK), `chapter_id` (FK)
- `amount_dollars` (DECIMAL)
- `amount_credits` (INTEGER)
- `transaction_type` (top_up, manual_add, auto_reload, chapter_unlock, warm_intro, ambassador_referral, refund, adjustment)
- `balance_before`, `balance_after`
- `stripe_payment_intent_id`, `stripe_charge_id`
- `description`, `metadata` (JSONB)
- `created_by` (admin UUID)
- **CONSTRAINT:** Validates positive amounts for credits, negative for deductions
- **Usage:** Complete audit trail of all credit/dollar transactions

#### **warm_intro_requests** (Lead Generation)
- `id` (UUID, PK)
- `company_id` (FK), `chapter_id` (FK)
- `status` (pending, in_progress, completed, cancelled)
- `message` (request text), `urgency`
- `amount_paid` (DEFAULT 59.99), `transaction_id` (FK)
- `admin_notes`, `introduction_made_at`
- `contact_person_name`, `contact_person_email`
- **Usage:** Companies request warm intro to chapter leadership ($59.99 each)

#### **ambassador_referral_requests** (Matching)
- `id` (UUID, PK)
- `company_id` (FK), `chapter_id` (FK)
- `status` (pending, matched, active, completed, cancelled)
- `campaign_description`, `budget_range`, `timeline`
- `amount_paid` (DEFAULT 99.99), `transaction_id` (FK)
- **Usage:** Companies request ambassador matching ($99.99 each)

#### **pricing** (Price Config)
- `id` (UUID, PK)
- `item_type` (UNIQUE: chapter_unlock, warm_intro, ambassador_referral, etc.)
- `price_dollars`, `description`
- `is_active` (boolean)
- **Usage:** Centralized pricing configuration

---

### Engagement & Analytics Tables

#### **events**
- `id` (UUID, PK)
- `chapter_id` (FK)
- `name`, `event_type` (rush, social, philanthropy, formal, mixer, workshop)
- `start_date`, `end_date`, `location`
- `expected_attendance`, `budget_range`
- `sponsorship_opportunities` (TEXT array)
- `partnership_status` (open, partnered, closed)
- **Usage:** Chapter events available for sponsorship

#### **partnerships**
- `id` (UUID, PK)
- `company_id` (FK), `chapter_id` (FK), `event_id` (FK, nullable)
- `partnership_type` (event_sponsor, ambassador, merchandise, long_term)
- `status` (pending, active, completed, cancelled)
- `start_date`, `end_date`, `budget_amount`
- `deliverables` (TEXT array), `success_metrics` (JSONB)
- **Usage:** Track completed partnerships and deals

#### **engagement_metrics**
- `id` (UUID, PK)
- `chapter_id` (FK), `metric_date` (DATE)
- `website_views`, `social_media_engagement`
- `event_attendance`, `partnership_inquiries`
- **UNIQUE:** (chapter_id, metric_date)
- **Usage:** Daily engagement tracking for chapters

#### **user_activity_logs**
- `id` (UUID, PK)
- `user_id` (FK), `company_id` (FK)
- `action_type` (view_chapter, unlock_chapter, request_intro, etc.)
- `resource_type`, `resource_id`
- `session_id`, `ip_address`, `user_agent`
- **Usage:** Track user behavior, analytics, dashboards

---

## 2. BACKEND API STRUCTURE

### Technology Stack
- **Framework:** Node.js + Express.js v5.1.0
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth (JWT tokens)
- **Payment:** Stripe (webhooks for payment events)
- **Email:** Resend (transactional emails)
- **AI:** Anthropic Claude SDK
- **File Upload:** Multer
- **CSV Parsing:** csv-parse
- **Environment:** Deployed on Vercel

### Directory Structure

```
/backend/src/
├── server.ts                 # Main Express app setup
├── server-enhanced.ts        # Alternative with additional features
├── database.ts               # SQLite setup (waitlist/signups)
├── config/
│   └── pricing.ts           # Pricing constants (CREDIT_PACKAGES, tier pricing)
├── routes/
│   ├── credits.ts           # 71KB - Credit purchases, subscriptions, webhooks
│   ├── activityTracking.ts  # User activity logging
│   ├── adminNotifications.ts # Admin alert system
│   ├── ai.ts                # Claude AI integration
│   ├── roadmap.ts           # Product roadmap
│   ├── updateTracking.ts    # Update notifications
│   └── shares.ts            # Chapter sharing (disabled in current setup)
├── services/
│   ├── CreditNotificationService.ts    # Email on credit events
│   ├── EmailNotificationService.ts     # Generic email sending
│   ├── DailyReportService.ts           # Daily digest emails
│   ├── EnhancedDailyReportService.ts   # Advanced metrics in emails (33KB)
│   ├── AdminNotificationService.ts     # Admin-specific alerts
│   ├── UpdateTrackingService.ts        # Update tracking logic
│   └── slackNotificationService.ts     # Slack integration
├── scripts/                  # One-off data import/migration scripts
├── utils/
│   ├── instagram.ts         # Instagram handle fetching
│   └── slackNotifier.ts     # Slack notification helper
└── migrations/              # Database migrations (17 files)
```

### Key Routes & Endpoints

#### Authentication
- `GET /api/auth/verify` - Verify JWT token, return user/company data
- Uses Supabase Auth for JWT validation

#### Credits & Billing
- `POST /api/credits/purchase` - Create Stripe checkout for credits
- `POST /api/credits/subscribe` - Create subscription checkout (monthly/enterprise)
- `GET /api/credits/balance` - Get company's credit balance
- `POST /api/credits/webhook` - Stripe webhook handler (raw body for signature verification)
  - Handles `charge.succeeded`, `customer.subscription.created`, `customer.subscription.updated`
  - Grants credits/subscription benefits to account_balance
  - Triggers email notifications

#### Activity & Notifications
- `POST /api/activity/*` - Log user clicks, page views, unlocks
- `GET /api/admin/notifications` - Fetch pending notifications
- `POST /api/admin/notifications/:id/acknowledge` - Mark notification as read

#### Admin Features
- `/api/admin/chapters/*` - Chapter CRUD operations (uses `supabaseAdmin`)
- `/api/admin/officers/*` - Roster management
- `/api/admin/chapters/quick-add` - Fuzzy matching chapter creation

---

## 3. AUTHENTICATION & AUTHORIZATION

### Supabase Auth Integration
- **Client:** `supabase` (public key, respects RLS)
- **Admin:** `supabaseAdmin` (service role key, bypasses RLS)
- **Flow:** Register → Email verification → JWT token in localStorage
- **Token:** Included in `Authorization: Bearer {token}` header

### Company Roles
1. **Admin** - Full company access, team management
2. **User** - Standard access, can unlock chapters
3. **Viewer** - Read-only access

### Row Level Security (RLS)
- Configured per table in Supabase
- Admin endpoints must use `supabaseAdmin` client to bypass RLS
- Regular endpoints use `supabase` client

---

## 4. EXISTING EMAIL NOTIFICATION INFRASTRUCTURE

### Services (All Using Resend API)

#### **CreditNotificationService**
- Triggers on credit events: purchase, manual add, auto-reload, deduction
- Sends to company email + admin email
- Includes transaction details, balance before/after
- Located: `/backend/src/services/CreditNotificationService.ts`

#### **EmailNotificationService**
- Generic service for sending templated emails
- Used for update notifications
- Processes pending notifications from database
- Includes rate limiting (100ms between emails)
- Located: `/backend/src/services/EmailNotificationService.ts`

#### **DailyReportService & EnhancedDailyReportService**
- Sends daily email digest to admins
- Includes: new chapters, new roster members, high-grade chapters
- Enhanced version adds: partnerships, unlocks, warm intros, user growth, engagement metrics
- Triggered by cron job: `npm run daily-report` or `npm run daily-report-enhanced`
- Located: `/backend/src/services/DailyReportService.ts` & `EnhancedDailyReportService.ts`

#### **AdminNotificationService**
- Sends notifications to admin email for specific events
- Can be customized for different event types
- Located: `/backend/src/services/AdminNotificationService.ts`

#### **slackNotificationService**
- Slack webhooks for real-time admin alerts
- Used for payment events, new partnerships, etc.
- Located: `/backend/src/utils/slackNotifier.ts`

### Email Configuration
- **Email Provider:** Resend
- **From Emails:**
  - `credits@fraternitybase.com` - Credit/billing emails
  - `updates@fraternitybase.com` - Update notifications
  - `notifications@fraternitybase.com` - General notifications
- **Admin Email:** Set via `process.env.ADMIN_EMAIL` (default: admin@fraternitybase.com)
- **API Key:** `process.env.RESEND_API_KEY`

### Email Template Structure
- HTML templates with inline CSS
- Plain text fallback for accessibility
- Branded with FraternityBase logo/colors
- Includes call-to-action buttons linking to dashboard

---

## 5. FRONTEND ARCHITECTURE

### Technology Stack
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Animations:** Anime.js, Framer Motion
- **HTTP Client:** Fetch API
- **Authentication:** Supabase Auth SDK

### Directory Structure
```
/frontend/src/
├── pages/                    # 59 page components
│   ├── ChapterDetailPage.tsx       # Full chapter profile + unlock modal
│   ├── ChaptersPage.tsx            # Browse/search chapters
│   ├── CollegesPage.tsx            # Browse universities
│   ├── CreditsPage.tsx             # Credit marketplace
│   ├── DashboardPage.tsx           # Main user dashboard
│   ├── SubscriptionPage.tsx        # Subscription management
│   ├── AdminPageV4.tsx             # Admin control panel (312KB)
│   ├── MapPage.tsx, SuperMapPage.tsx, RetroSuperMapPage.tsx  # Map visualizations
│   ├── MyUnlockedPage.tsx          # User's unlocked chapters
│   ├── RequestedIntroductionsPage.tsx  # Warm intro requests
│   └── ... (many others)
├── components/
│   ├── Layout.tsx           # Main wrapper
│   ├── PrivateRoute.tsx      # Protected routes
│   ├── AdminRoute.tsx        # Admin-only routes
│   ├── AuthProvider.tsx      # Supabase Auth context
│   ├── ErrorBoundary.tsx     # Error handling
│   ├── AIAssistant.tsx       # Claude AI chat widget
│   ├── admin/                # Admin-specific components
│   │   └── AdminNotificationCenter.tsx  # Notification display
│   └── legal/                # Legal docs
├── store/
│   ├── store.ts             # Redux store setup
│   ├── slices/              # Redux slices (auth, company, etc.)
│   └── api/                 # API integration
├── services/
│   └── analytics.ts         # Event tracking service
├── hooks/
│   ├── useActivityTracking.tsx  # Track user clicks/views
│   └── ... (custom hooks)
├── contexts/                # Auth and other contexts
├── utils/                   # Helper functions
├── lib/                     # Library wrappers
└── App.tsx                  # Main routing setup
```

### Key Features
1. **Real-time Activity Tracking** - Logs clicks, page views, unlocks
2. **Authentication** - Register, login, password reset via Supabase
3. **Interactive Map** - Visualize chapters by geography
4. **Chapter Browsing** - Filter by organization, university, state, rating
5. **Unlock System** - Purchase credits, unlock chapter contact info
6. **Subscription Management** - View plan, manage payment method
7. **Admin Panel** - Chapter/officer management, analytics, CSV import

---

## 6. CREDIT & SUBSCRIPTION SYSTEM

### Pricing Model
**Subscriptions:**
- Team: $29.99/month (100 credits/month)
- Enterprise: $299.99/month (1000 credits/month)
- Annual discounts: 10% off

**Credit Packages (Pay-as-you-go):**
- 100 credits: $29.99
- 500 credits: $139.99 (7% bonus)
- 1000 credits: $249.99 (17% bonus)

**Service Costs (in dollars, converted to credits):**
- Chapter Unlock (5-star): $9.99 (30 credits)
- Chapter Unlock (standard): $2.99 (10 credits)
- Warm Introduction: $59.99 (200 credits)
- Ambassador Referral: $99.99 (330 credits)
- Venue Connection: $49.99 (160 credits)

### Credit Flow
1. Company registers → 0 credits, 3-day trial + 1 free chapter unlock
2. Company subscribes → Monthly credit grant (50-1000 depending on tier)
3. Company requests unlock → Credits deducted from balance
4. Company can purchase additional credits anytime

### Database Transactions
All transactions recorded in `balance_transactions`:
- Type validation ensures + amounts for credits, - amounts for deductions
- Reference to `chapter_id` for unlock tracking
- Stripe payment intent/charge IDs for reconciliation
- Audit trail with `created_by` admin ID

---

## 7. NOTIFICATION SYSTEM

### Notification Types

#### 1. **Credit Notifications** (Transactional)
- When credits purchased
- When monthly grant applied
- When subscription activated/renewed
- Email recipients: company user + admin

#### 2. **Daily Reports** (Scheduled)
- Admin receives summary of platform activity
- Includes: new chapters, officers, high-grade chapters
- Enhanced version: partnerships, revenue, user growth
- Cron job triggers daily (typically 6 AM)

#### 3. **Update Tracking** (On-demand)
- Partners notified of new chapters in their target markets
- Can be immediate (urgent) or batched (daily/weekly)
- Stored in database, sent via EmailNotificationService

#### 4. **Admin Notifications** (Real-time)
- Warm intro requests
- New partnerships created
- High-value transactions
- Sent immediately or batched

#### 5. **Slack Notifications** (Real-time)
- Payment events in #payments channel
- New chapters/data in #data-updates
- Admin alerts in #admin-alerts

---

## 8. RECOMMENDED ARCHITECTURE FOR MARKETPLACE FEATURE

### New Database Tables Required

```sql
-- Sponsorship Opportunities
CREATE TABLE sponsorship_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opportunity_type VARCHAR(50), -- 'event_sponsor', 'merchandise', 'philanthropy_partner', etc.
  target_companies TEXT ARRAY,
  budget_needed DECIMAL(10,2),
  timeline VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'filled', 'expired'
  posted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_chapter_id (chapter_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);

-- Sponsorship Notifications
CREATE TABLE sponsorship_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES sponsorship_opportunities(id) ON DELETE CASCADE,
  notification_type VARCHAR(20), -- 'daily_digest', 'immediate', 'weekly_summary'
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'bounced', 'failed'
  
  INDEX idx_company_id (company_id),
  INDEX idx_sent_at (sent_at),
  INDEX idx_status (status)
);

-- Company Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  email_frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'never'
  notification_types JSONB, -- {"new_opportunities": true, "matches": true, "updates": false}
  target_states TEXT ARRAY,
  target_organizations TEXT ARRAY,
  min_budget_range VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_company_id (company_id)
);
```

### Service Layer

```
/backend/src/services/
├── SponsorshipNotificationService.ts
│   ├── generateDailyDigest(companyId)
│   ├── sendImmediateNotification(companyId, opportunity)
│   ├── sendWeeklyDigest(companyId)
│   └── trackEmailInteraction(notificationId, type)
├── SponsorshipMatchingService.ts
│   ├── matchOpportunitiesForCompany(company)
│   ├── scoreOpportunity(company, opportunity)
│   └── filterByPreferences(company, opportunities)
└── SponsorshipAnalyticsService.ts
    ├── trackEmailOpenRate(opportunityId)
    ├── trackClickThroughRate(notificationId)
    └── generateMatchMetrics(companyId)
```

### API Routes

```
/backend/src/routes/
├── sponsorships.ts
│   ├── POST   /api/sponsorships                    (chapter creates opportunity)
│   ├── GET    /api/sponsorships                    (company browses opportunities)
│   ├── GET    /api/sponsorships/:id                (view detail)
│   ├── PATCH  /api/sponsorships/:id                (chapter updates)
│   ├── DELETE /api/sponsorships/:id                (chapter deletes)
│   ├── GET    /api/sponsorships/matches            (AI-matched opportunities)
│   └── POST   /api/sponsorships/:id/apply          (company applies)
└── notifications/sponsorships.ts
    ├── GET    /api/notifications/preferences       (get user preferences)
    ├── PATCH  /api/notifications/preferences       (update preferences)
    ├── GET    /api/notifications/pending           (pending notifications)
    ├── POST   /api/notifications/:id/track-open    (email open tracking)
    └── POST   /api/notifications/:id/track-click   (email click tracking)
```

### Frontend Components

```
/frontend/src/
├── pages/
│   ├── SponsorshipMarketplacePage.tsx
│   │   ├── Browse/search sponsorships
│   │   ├── Save favorites
│   │   ├── Apply to opportunities
│   │   └── View match score
│   ├── MyOpportunitiesPage.tsx
│   │   ├── Create sponsorship listing
│   │   ├── View applications received
│   │   └── Manage existing opportunities
│   └── NotificationPreferencesPage.tsx
│       ├── Email frequency selector
│       ├── Interest filtering (industries, states, org types)
│       └── Budget range preferences
├── components/
│   ├── SponsorshipCard.tsx
│   ├── OpportunityDetailModal.tsx
│   ├── ApplicationModal.tsx
│   ├── NotificationSettingsPanel.tsx
│   └── SponsorshipMatchBadge.tsx
```

---

## 9. KEY INTEGRATION POINTS

### Existing Systems to Leverage

1. **Stripe Webhooks** - Already receiving payment events, can extend for sponsorship purchases
2. **Resend Email** - Already configured, just add sponsorship templates
3. **Supabase Auth** - Use existing company_id and user roles
4. **Database Migrations** - Follow existing pattern in `/backend/migrations/`
5. **Activity Tracking** - Hook into existing `useActivityTracking` for analytics
6. **Admin Panel** - Add sponsorship management tab to AdminPageV4

### Cron Jobs Required

```javascript
// Daily digest scheduler (6 AM)
'0 6 * * *' => SponsorshipNotificationService.sendDailyDigests()

// Weekly summary (Monday 9 AM)
'0 9 * * 1' => SponsorshipNotificationService.sendWeeklyDigests()

// Expire old opportunities (daily)
'0 0 * * *' => SponsorshipOpportunityService.expireOldListings()
```

### Email Templates

1. **Daily Digest Email**
   - 3-5 new sponsorship opportunities matching company interests
   - Match score (AI-powered relevance)
   - CTA: "View all" → `/sponsorships`

2. **Weekly Summary**
   - Top 10 opportunities
   - Hot deals (high applications)
   - Market trends
   - CTA: "Manage preferences"

3. **Immediate Notification** (high-value opportunities)
   - Single opportunity with detailed description
   - Chapter profile preview
   - CTA: "Apply now"

4. **Application Confirmation**
   - Sent to chapter when company applies
   - CTA: "Review application" → admin dashboard

---

## 10. DEPLOYMENT & ENVIRONMENT

### Backend Deployment
- **Platform:** Vercel (auto-deploy on push)
- **Environment Variables:** `.env` file (see `.env.example`)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (file uploads)

### Important Environment Variables
```
SUPABASE_URL=https://oqptnptlshlhbmmnjamb.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
RESEND_API_KEY=...
ANTHROPIC_API_KEY=...
ADMIN_EMAIL=admin@fraternitybase.com
CREDITS_FROM_EMAIL=credits@fraternitybase.com
FRONTEND_URL=https://fraternitybase.com
```

### Development Commands
```bash
# Start backend
npm run dev

# Build for production
npm run build

# Run database migrations
# (Use Supabase SQL Editor for .sql migrations)

# Run scheduled jobs locally
npm run daily-report
npm run daily-report-enhanced
```

---

## 11. KEY FILES TO REFERENCE

### Database
- `/database/schema.sql` - Main table definitions
- `/database/migrate_to_dollar_balance_system.sql` - Credit system
- `/backend/migrations/` - Incremental migrations

### Backend Services
- `/backend/src/services/CreditNotificationService.ts` - Email on credit events
- `/backend/src/services/EnhancedDailyReportService.ts` - Daily digest emails
- `/backend/src/routes/credits.ts` - Payment/subscription logic

### Documentation
- `/BACKEND_OPERATIONS.md` - Admin operations guide
- `/FRATERNITYBASE_API_PLAN.md` - Future API design
- `/PLATFORM_BUSINESS_MODEL.md` - Business logic overview
- `/CREDIT_PRICING_UPDATE_OCT17_2025.md` - Pricing details

---

## 12. CURRENT LIMITATIONS & NOTES

### Known Issues/TODOs
1. Shares router disabled (line 15 in server.ts - PostgreSQL pool missing)
2. Admin token hardcoded in documentation (should be env var)
3. RLS policies need verification for all tables
4. Rate limiting not fully implemented for API

### Data Quality
- 5,000+ chapters in database
- ~2,000 with complete roster data
- Instagram handles for ~60% of chapters
- Some universities missing GPS coordinates

### Performance Considerations
- Chapter queries limited to 5000 rows (Supabase default)
- Need indexes on frequently filtered columns (state, organization_id, grade)
- Consider read replicas for high-traffic API queries
- Cache user's unlocked chapters in Redis

---

**End of Architecture Summary**

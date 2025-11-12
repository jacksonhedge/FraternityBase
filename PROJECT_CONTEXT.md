# FraternityBase - Project Context

**Last Updated:** November 8, 2025
**Quick Start:** Read this file first for rapid project context loading

---

## What Is It (30-Second Overview)

FraternityBase is a B2B SaaS platform connecting brands with Greek life chapters (fraternities & sororities) for sponsorships, partnerships, and ambassador programs. Companies subscribe to unlock chapter contact data, request warm introductions, and discover sponsorship opportunities. Chapters can sign up to browse brands and create sponsorship listings.

**Business Model:** Credit-based system + subscriptions. Companies buy credits to unlock chapter contacts ($2.99-$9.99 per chapter), request warm intros ($59.99), and access premium features.

**Current State:** Production-ready platform with 5,000+ chapters, active credit/billing system, admin panel, and interactive map visualization. Fraternity user dashboard and marketplace features recently launched.

---

## Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State:** Redux Toolkit
- **Routing:** React Router v6
- **Auth:** Supabase Auth (JWT)
- **Animations:** Anime.js, Framer Motion
- **Hosting:** Vercel

### Backend
- **Runtime:** Node.js + Express.js (TypeScript)
- **Database:** PostgreSQL via Supabase (Project ID: `vvsawtexgpopqxgaqyxg`)
- **Auth:** Supabase Auth
- **Payments:** Stripe (webhooks for subscriptions/purchases)
- **Email:** Resend API
- **AI:** Anthropic Claude SDK
- **Hosting:** Vercel

### Key Services
- **Stripe:** Credit purchases, subscriptions, auto-reload
- **Resend:** Transactional emails (credits, daily reports, notifications)
- **Supabase:** Database, auth, storage, Row Level Security (RLS)
- **Anthropic Claude:** AI assistant for users

---

## Directory Structure

```
CollegeOrgNetwork/
├── frontend/                   # React + TypeScript SPA
│   ├── src/
│   │   ├── pages/             # 59 page components
│   │   │   ├── AdminPageV4.tsx         # Main admin panel (312KB)
│   │   │   ├── ChapterDetailPage.tsx   # Chapter profile + unlock
│   │   │   ├── ChaptersPage.tsx        # Browse chapters
│   │   │   ├── CreditsPage.tsx         # Buy credits
│   │   │   ├── DashboardPage.tsx       # Company dashboard
│   │   │   ├── FraternityDashboardPage.tsx  # Fraternity user dashboard
│   │   │   ├── MapPage.tsx, RetroSuperMapPage.tsx  # Map views
│   │   │   └── ...
│   │   ├── components/        # Shared components
│   │   ├── store/             # Redux slices/API
│   │   ├── contexts/          # Auth context
│   │   ├── services/          # Analytics, API clients
│   │   └── App.tsx            # Main routing
│   ├── package.json
│   └── README.md
│
├── backend/                    # Express API server
│   ├── src/
│   │   ├── server.ts          # Main Express app
│   │   ├── routes/
│   │   │   ├── credits.ts     # Payment/subscription logic (71KB)
│   │   │   ├── activityTracking.ts
│   │   │   ├── adminNotifications.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── CreditNotificationService.ts     # Email on credit events
│   │   │   ├── EnhancedDailyReportService.ts    # Daily digest emails
│   │   │   ├── EmailNotificationService.ts
│   │   │   └── slackNotificationService.ts
│   │   ├── scripts/           # Data import/migration scripts
│   │   └── migrations/        # Database migrations (17 files)
│   ├── package.json
│   └── BACKEND_OPERATIONS.md  # **KEY OPERATIONS GUIDE**
│
├── database/                   # SQL schemas
│   ├── schema.sql
│   └── migrate_to_dollar_balance_system.sql
│
├── data/                       # Static data (CSVs, etc.)
├── csv-templates/              # Template files for CSV imports
├── scrapers/                   # Data scraping scripts
├── scripts/                    # Utility scripts
│
└── [100+ documentation files]
```

---

## Current Status (November 2025)

### Fully Working
- ✅ Core chapter database (5,000+ chapters)
- ✅ Credit/billing system with Stripe
- ✅ Subscription tiers (Team $29.99/mo, Enterprise $299.99/mo)
- ✅ Chapter unlock system ($2.99-$9.99 per chapter)
- ✅ Admin panel for chapter/roster management
- ✅ Interactive map visualization
- ✅ Company authentication & dashboard
- ✅ Fraternity user authentication & approval flow
- ✅ Fraternity dashboard (7 tabs: Listings, Browse Brands, Sponsorships, Assets, Events, Analytics, Settings)
- ✅ Email notification infrastructure (Resend)
- ✅ Activity tracking & analytics
- ✅ CSV roster import

### In Development
- 🚧 Marketplace sponsorship listings
- 🚧 Brand-chapter matching algorithm
- 🚧 Marketplace notification system

### Production URLs
- **Frontend:** https://fraternitybase.com
- **Backend API:** https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api

---

## Key Documents (Start Here)

### Essential Reading (Priority Order)
1. **`PROJECT_CONTEXT.md`** (this file) - Start here for quick overview
2. **`BACKEND_OPERATIONS.md`** - Database ops, common tasks, API endpoints
3. **`FRATERNITY_SYSTEM_ARCHITECTURE.md`** - Fraternity user system (signup → dashboard)
4. **`FRATERNITYBASE_ARCHITECTURE_SUMMARY.md`** - Complete architecture deep-dive

### Feature Documentation
- **Pricing:** `PRICING_FINAL_QUICK_REF.txt`, `CREDIT_PRICING_UPDATE_OCT17_2025.md`
- **Admin Guide:** `ADMIN_GUIDE.md`, `ADMIN_COMPREHENSIVE_TEST_GUIDE.md`
- **CSV Imports:** `CSV_UPLOAD_README.md`, `CSV_UPLOAD_QUICK_REFERENCE.md`
- **Map Features:** `RETRO_MAP_OVERVIEW.md`, `MAP_ARCHITECTURE_OVERVIEW.md`
- **Marketplace:** `SPONSORSHIP_MARKETPLACE_README.md`, `MARKETPLACE_IMPLEMENTATION_STATUS.md`
- **Testing:** `TESTING_CHECKLIST.md`, `ADMIN_TESTING_TOOLS.md`

### Business/Strategy
- **Business Model:** `PLATFORM_BUSINESS_MODEL.md`
- **Roadmap:** `ROADMAP.md`
- **Deployment:** `PRODUCTION_DEPLOYMENT_GUIDE.md`

---

## Database Quick Reference

### Supabase Info
- **Project ID:** `vvsawtexgpopqxgaqyxg`
- **Dashboard:** https://supabase.com/dashboard/project/vvsawtexgpopqxgaqyxg
- **DB URL:** https://oqptnptlshlhbmmnjamb.supabase.co
- **Access:** Use MCP Supabase tools (`mcp__supabase__*`)

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `universities` | College/university data | name, state, location, student_count |
| `greek_organizations` | National orgs (Sigma Chi, etc.) | name, greek_letters, organization_type |
| `chapters` | Local chapters | greek_organization_id, university_id, grade, is_viewable, is_platinum |
| `chapter_officers` | Roster members | chapter_id, name, position, email, phone |
| `companies` | Brand profiles | name, industry, logo_url, approval_status |
| `company_users` | Brand employees | company_id, email, role |
| `fraternity_users` | Fraternity user accounts | user_id, approval_status, fraternity_or_sorority, college |
| `account_balance` | Company credits/subscription | company_id, balance_credits, subscription_tier |
| `balance_transactions` | Audit log | company_id, amount_credits, transaction_type |
| `chapter_unlocks` | Access tracking | chapter_id, company_id, amount_paid |
| `warm_intro_requests` | Intro requests | chapter_id, company_id, status, amount_paid ($59.99) |

### Important Constraints
- **`chapter_officers.position`** - NOT NULL (default: 'Member')
- **`chapters` UNIQUE** - (greek_organization_id, university_id)
- **Admin endpoints** - Must use `supabaseAdmin` client (bypasses RLS)

---

## Common Tasks

### Add a New Chapter
```javascript
// Best method: Quick Add with fuzzy matching
fetch('https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api/admin/chapters/quick-add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': process.env.ADMIN_TOKEN
  },
  body: JSON.stringify({
    organization_name: 'Sigma Chi',
    university_name: 'Michigan',
    grade: 4.0,
    is_viewable: true,
    status: 'active'
  })
});
```

### Run Database Migration
```javascript
// Use Supabase MCP tool
mcp__supabase__apply_migration({
  project_id: 'vvsawtexgpopqxgaqyxg',
  name: 'add_new_field',
  query: `
    ALTER TABLE chapters
    ADD COLUMN IF NOT EXISTS new_field BOOLEAN DEFAULT FALSE;
  `
});
```

### Query Database
```javascript
// Use Supabase MCP tool
mcp__supabase__execute_sql({
  project_id: 'vvsawtexgpopqxgaqyxg',
  query: `SELECT * FROM chapters WHERE is_platinum = true LIMIT 10;`
});
```

### Import Roster CSV
See: `BACKEND_OPERATIONS.md` line 195 and `CSV_UPLOAD_README.md`

### Deploy Backend
```bash
cd backend
npm run build    # TypeScript compilation
vercel --prod    # Auto-deploys to Vercel
```

### Run Daily Report (Email)
```bash
cd backend
npm run daily-report           # Basic report
npm run daily-report-enhanced  # Advanced metrics
```

---

## Authentication & Authorization

### Two User Types

#### 1. Company Users (Brand Accounts)
- **Auth:** Supabase Auth JWT
- **Table:** `company_users` (links to `companies`)
- **Roles:** Admin, User, Viewer
- **Access:** Dashboard, chapter browsing, credit purchases, unlocks
- **Routes:** `/signup`, `/login`, `/dashboard`, `/chapters`, `/credits`

#### 2. Fraternity Users (Chapter Accounts)
- **Auth:** Supabase Auth JWT
- **Table:** `fraternity_users` (separate from companies)
- **Approval:** Admin must approve via `/admin/fraternity-users` tab
- **Access:** Fraternity dashboard after approval
- **Routes:** `/signup/fraternity`, `/fraternity/dashboard`, `/fraternity/marketplace`

### Admin Access
- **Admin Panel:** `/admin` (requires admin role)
- **Admin Token:** `x-admin-token` header (env var: `ADMIN_TOKEN`)
- **Admin Endpoints:** `/api/admin/*` (use `supabaseAdmin` client)

---

## Credit & Pricing System

### Subscriptions
- **Team:** $29.99/month → 100 credits/month
- **Enterprise:** $299.99/month → 1000 credits/month
- **Trial:** 3 days free + 1 free chapter unlock

### Credit Packages (Pay-as-you-go)
- 100 credits: $29.99
- 500 credits: $139.99 (7% bonus)
- 1000 credits: $249.99 (17% bonus)

### Service Costs (deducted from credits)
- **Chapter Unlock (5-star):** $9.99 (30 credits)
- **Chapter Unlock (standard):** $2.99 (10 credits)
- **Warm Introduction:** $59.99 (200 credits)
- **Ambassador Referral:** $99.99 (330 credits)

### Implementation
- **Payment Gateway:** Stripe (webhooks handle charge.succeeded, subscription events)
- **Credit Storage:** `account_balance` table
- **Audit Trail:** `balance_transactions` table
- **Email Notifications:** `CreditNotificationService` (via Resend)

---

## API Endpoints (Key Routes)

### Admin Endpoints (require `x-admin-token`)
```
GET    /api/admin/chapters              # List all (uses supabaseAdmin, limit 5000)
POST   /api/admin/chapters/quick-add    # Create with fuzzy matching
PATCH  /api/admin/chapters/:id          # Update chapter
DELETE /api/admin/chapters/:id          # Delete chapter
POST   /api/admin/chapters/:id/paste-roster  # Bulk CSV roster import

GET    /api/admin/officers              # List officers (uses supabaseAdmin)
POST   /api/admin/officers              # Create officer
PUT    /api/admin/officers/:id          # Update officer
DELETE /api/admin/officers/:id          # Delete officer

GET    /api/admin/fraternity-users      # List fraternity signups
PATCH  /api/admin/fraternity-users/:id/approve   # Approve fraternity user
PATCH  /api/admin/fraternity-users/:id/reject    # Reject fraternity user
```

### Company Endpoints (require JWT)
```
POST   /api/credits/purchase            # Create Stripe checkout for credits
POST   /api/credits/subscribe           # Subscribe to Team/Enterprise
GET    /api/credits/balance             # Get current balance
POST   /api/credits/webhook             # Stripe webhook (raw body)

GET    /api/chapters/search             # Search/filter chapters
GET    /api/chapters/:id                # Chapter details
POST   /api/chapters/:id/unlock         # Unlock chapter contacts

GET    /api/companies                   # List approved brands
```

### Fraternity Endpoints (require JWT)
```
POST   /api/fraternity/signup           # Register new fraternity user
GET    /api/fraternity/me               # Get current fraternity profile
```

---

## Email Notification Infrastructure

### Services (All via Resend API)

| Service | Trigger | Recipient | From Address |
|---------|---------|-----------|--------------|
| `CreditNotificationService` | Credit purchase/deduction | Company + Admin | credits@fraternitybase.com |
| `EnhancedDailyReportService` | Cron job (daily 6 AM) | Admin | notifications@fraternitybase.com |
| `EmailNotificationService` | Update notifications | Company | updates@fraternitybase.com |
| `slackNotificationService` | Real-time events | Slack channels | N/A (webhook) |

### Email Template Structure
- HTML with inline CSS
- Plain text fallback
- Branded with FraternityBase logo/colors
- CTA buttons → dashboard links
- Transactional (not marketing)

---

## Important Patterns & Lessons Learned

### Always Use `supabaseAdmin` for Admin Endpoints
- Regular `supabase` client respects Row Level Security (RLS)
- Admin endpoints **must** use `supabaseAdmin` to bypass RLS
- Fixed in `server.ts`: All `/api/admin/*` routes use `supabaseAdmin`

### NOT NULL Constraints
- `chapter_officers.position` requires value
- Always provide default: `position: position || 'Member'`
- Test with single request before bulk imports

### Query Limits
- Supabase default: 1000 rows
- Admin chapter list: `.limit(5000)` to show all
- Use pagination for large datasets

### Fuzzy Matching
- Quick Add uses Levenshtein distance for org/university names
- Handles typos gracefully
- Add missing orgs to database first, then create chapters

### Platinum Chapters
- `is_platinum = true` → chapters referred to partners
- Always set: `grade: 5.0`, `is_viewable: true`, `is_favorite: true`

### Stripe Webhooks
- Must use raw body for signature verification
- Webhook secret in env: `STRIPE_WEBHOOK_SECRET`
- Handle `charge.succeeded`, `customer.subscription.created`, `customer.subscription.updated`

---

## Environment Variables

### Backend (Required)
```
SUPABASE_URL=https://oqptnptlshlhbmmnjamb.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
ANTHROPIC_API_KEY=...
ADMIN_TOKEN=sk_admin_fra7ernity_b4se_sec2ret_92fj39
ADMIN_EMAIL=admin@fraternitybase.com
CREDITS_FROM_EMAIL=credits@fraternitybase.com
FRONTEND_URL=https://fraternitybase.com
```

### Deployment
- Set via Vercel CLI: `vercel env add`
- Requires redeployment after changes

---

## Troubleshooting

### Chapter Not Showing in Admin Panel
1. Check if using `supabaseAdmin` in GET endpoint
2. Verify query limit (increase to 5000+)
3. Check `is_viewable: true`
4. Mark as `is_favorite: true` to prioritize

### Roster Import Failing (500 Errors)
1. Verify `position` field has default value
2. Check endpoints use `supabaseAdmin`
3. Test with single curl request first
4. Review `chapter_officers` NOT NULL constraints

### Organization Not Found
1. Check spelling (fuzzy matching has tolerance)
2. Query: `SELECT * FROM greek_organizations WHERE name ILIKE '%searchterm%'`
3. Add missing org before creating chapters
4. Include `greek_letters` and `organization_type`

### Stripe Webhook Failures
1. Verify raw body parsing: `express.raw({type: 'application/json'})`
2. Check webhook secret matches Stripe dashboard
3. Review logs for signature verification errors
4. Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/credits/webhook`

---

## Development Commands

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server (nodemon + tsx)
npm run build        # TypeScript compilation
npm run start        # Start production server
npm run daily-report # Run daily digest email
npm run daily-report-enhanced  # Run enhanced daily report
```

### Database
```bash
# Use Supabase MCP tools for migrations
mcp__supabase__list_tables({ project_id: 'vvsawtexgpopqxgaqyxg' })
mcp__supabase__execute_sql({ project_id: 'vvsawtexgpopqxgaqyxg', query: '...' })
mcp__supabase__apply_migration({ project_id: 'vvsawtexgpopqxgaqyxg', name: '...', query: '...' })
```

---

## Data Overview

### Current Data Volume
- **5,000+ chapters** in database
- **~2,000 chapters** with complete roster data
- **Instagram handles** for ~60% of chapters
- **28 Rutgers chapters** (example: high-density school)
- **11 platinum chapters** (high-value, referred partners)

### Data Quality Notes
- Some universities missing GPS coordinates
- Organization names use fuzzy matching
- Chapter grades on 1-5 scale (5 = platinum)

---

## Recent Work (November 2025)

### Platinum Chapters Added
Created 11 platinum chapters (grade 5.0, referred partners):
- Sigma Chi at Michigan, Rutgers, Michigan State, Texas A&M, Pitt, Illinois
- Phi Sigma Phi at WVU
- Zeta Psi at Rutgers
- Chi Phi at Penn State
- Lambda Chi Alpha at Penn State
- Alpha Delta Phi at Illinois

### Rutgers Expansion
- Added 24 chapters to Rutgers (grade 4.0)
- Added 6 new organizations to database
- Total Rutgers chapters: 28

### Fraternity User System Launch
- Implemented full fraternity signup flow
- Admin approval workflow
- 7-tab dashboard (Listings, Browse Brands, Sponsorships, Assets, Events, Analytics, Settings)
- Marketplace integration for fraternity users to browse brands

---

## Next Steps / Roadmap

### Immediate Priorities
1. Complete marketplace sponsorship listings feature
2. Build brand-chapter matching algorithm
3. Implement marketplace notification system (daily digests)

### Future Enhancements
- Email verification before approval
- Rate limiting on API endpoints
- 2FA for user accounts
- Redis caching for unlocked chapters
- Read replicas for high-traffic queries

---

## Support & Resources

### Documentation Index
- See root directory for 100+ MD files
- Key guides linked in "Key Documents" section above
- Business/pricing docs in root
- Technical docs in `backend/` and `frontend/`

### Admin Access
- **Admin Panel:** https://fraternitybase.com/admin
- **Supabase Dashboard:** https://supabase.com/dashboard/project/vvsawtexgpopqxgaqyxg
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Vercel Dashboard:** https://vercel.com/dashboard

### Useful MCP Tools
- `mcp__supabase__list_projects` - List all Supabase projects
- `mcp__supabase__list_tables` - Show database tables
- `mcp__supabase__execute_sql` - Run SQL queries
- `mcp__supabase__apply_migration` - Create migrations
- `mcp__supabase__get_advisors` - Check for security/performance issues

---

**End of Project Context**

For detailed information on specific features, consult the documentation files listed in "Key Documents" section.

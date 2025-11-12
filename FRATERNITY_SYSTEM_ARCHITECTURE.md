# FraternityBase - Fraternity User System Architecture

## Executive Summary

FraternityBase has a complete fraternity user system with a separate authentication flow from company accounts. Fraternity users sign up via `/signup/fraternity`, are placed in a pending approval state, and once approved, access a comprehensive dashboard at `/fraternity/dashboard` where they can browse brands and manage sponsorship opportunities.

---

## 1. AUTHENTICATION SYSTEM

### Separate Auth Flow for Fraternity Users
- **Sign-up Route**: `/signup/fraternity` → `FraternitySignUpPageEnhanced` component
- **Pending Approval**: `/fraternity/pending-approval` → `FraternityPendingApprovalPage`
- **Dashboard Login**: Direct access after email auth approval at `/fraternity/dashboard`
- **Auth Provider**: Uses Supabase Auth (JWT tokens)
- **Authorization**: Uses Bearer token in headers for API calls

### Authentication Endpoints
```
POST /api/fraternity/signup          - Register new fraternity user
GET  /api/fraternity/me              - Get current fraternity profile
```

### Approval Workflow
1. User signs up with personal info, chapter info, and optional event details
2. Account created with `approval_status: 'pending'`
3. Admin must approve via: `PATCH /api/admin/fraternity-users/:id/approve`
4. On approval, user can login and access full dashboard

---

## 2. FRATERNITY_USERS TABLE STRUCTURE

### Database Schema
```sql
CREATE TABLE fraternity_users (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,              -- Links to Supabase auth.users
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  college VARCHAR(255),
  fraternity_or_sorority VARCHAR(255),       -- e.g., "Sigma Chi"
  position VARCHAR(100),                     -- President, Vice President, etc.
  sponsorship_type VARCHAR(50),              -- 'event', 'chapter', 'both'
  
  -- Chapter Information
  instagram VARCHAR(255),
  website VARCHAR(255),
  
  -- Payment Information (encrypted at rest)
  preferred_payment_method VARCHAR(100),
  payment_recipient_name VARCHAR(255),
  payment_venmo VARCHAR(255),
  payment_zelle VARCHAR(255),
  payment_paypal VARCHAR(255),
  payment_bank_account VARCHAR(255),
  payment_routing_number VARCHAR(255),
  
  -- Event Information
  has_upcoming_event BOOLEAN,
  event_name VARCHAR(255),
  event_date DATE,
  event_type VARCHAR(100),
  
  -- Status
  approval_status VARCHAR(20),               -- 'pending', 'approved', 'rejected'
  rejection_reason VARCHAR(255),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Key Fields
- **user_id**: Foreign key to Supabase auth.users table
- **approval_status**: Controls access to dashboard
- **sponsorship_type**: Determines what they're looking for
- **Multiple payment methods**: Flexibility in how they receive sponsorship funds

---

## 3. FRATERNITY USER PAGES & NAVIGATION

### Public Pages (No Authentication Required)
- **`/signup/fraternity`** - Basic sign-up form (3 steps)
- **`/signup/fraternity/enhanced`** → `FraternitySignUpPageEnhanced` - Enhanced signup
- **`/fraternity/pending-approval`** - Waiting for admin approval
- **`/get-sponsored`** - Landing page about sponsorship opportunities
- **`/fraternity/marketplace`** - Browse brands (public, no login needed)

### Private Dashboard Pages (Requires Approval)
- **`/fraternity/dashboard`** → `FraternityDashboardPage` - Main dashboard (Protected)

---

## 4. FRATERNITY DASHBOARD STRUCTURE

### Dashboard Routes & Features
The main dashboard at `/fraternity/dashboard` uses tabbed navigation:

#### Tab 1: "My Listings" 
- **Purpose**: Create sponsorship opportunities for brands to discover
- **Features**:
  - Display existing listings (currently 0 - empty state)
  - Quick-create buttons for different sponsorship types:
    - Semester Long Partnership
    - Charity Event Sponsor
    - Event Sponsorship
    - Intramural Sports
    - March Madness Pool
    - Super Bowl Squares
    - Fantasy Football League
    - Casino Night/Poker

#### Tab 2: "Browse Brands" (Marketplace)
- **Purpose**: Discover brands looking to sponsor chapters
- **Features**:
  - Grid of approved companies
  - Search functionality (search by brand name/description)
  - Filter by industry/vertical
  - Company cards showing:
    - Logo and name
    - Industry category
    - Description
    - Social media links
    - Budget range ($500-$2,000)
    - "Request" button

#### Tab 3: "My Sponsorships"
- **Purpose**: Manage active brand partnerships
- **Features**:
  - List of connected sponsors (currently empty state)
  - Shows pending and active sponsorships

#### Tab 4: "Assets & Media"
- **Purpose**: Upload chapter branding materials
- **Features**:
  - Upload chapter logo
  - Upload event photos
  - Upload promotional materials
  - Brands can reference these materials

#### Tab 5: "My Events"
- **Purpose**: Track and manage upcoming events
- **Features**:
  - List of created events
  - Create new event functionality
  - Track philanthropic activities

#### Tab 6: "Analytics"
- **Purpose**: Track sponsorship performance
- **Features**:
  - View sponsorship metrics
  - Event engagement tracking
  - Earnings reports

#### Tab 7: "Settings"
- **Purpose**: Manage chapter profile information
- **Features**:
  - Read-only profile fields:
    - Chapter Name
    - College
    - Instagram Handle
    - Website
  - These can't be edited (must go through re-signup/admin)

### Dashboard Statistics (Top Section)
- Available Brands: Count of approved companies
- Avg. Sponsorship: $750 (placeholder)
- Active Requests: Number of pending sponsorship requests
- Total Earned: Cumulative sponsorship earnings

### Navigation Structure
```
Left Sidebar (Desktop/Mobile Toggle)
├─ Header: Chapter Logo, Name, College
├─ Navigation Menu:
│  ├─ My Listings (FileText icon)
│  ├─ Browse Brands (Store icon)
│  ├─ My Sponsorships (Handshake icon)
│  ├─ Assets & Media (Image icon)
│  ├─ My Events (Calendar icon)
│  ├─ Analytics (BarChart3 icon)
│  └─ Settings (Settings icon)
└─ Profile Section:
   ├─ User Avatar (initials)
   ├─ Name & Position
   └─ Logout Button

Top Bar
├─ Mobile Menu Toggle
├─ Current Tab Title & Description
└─ Sponsorship Type Badge (Event/Chapter)
```

---

## 5. BACKEND ROUTES FOR FRATERNITY USERS

### Authentication Routes
```typescript
POST /api/fraternity/signup
  - Body: firstName, lastName, email, password, college, fraternityOrSorority, position, sponsorshipType, etc.
  - Response: User object with approval_status: 'pending'

GET /api/fraternity/me
  - Headers: Authorization: Bearer <token>
  - Response: Current fraternity user profile
```

### Admin Routes
```typescript
GET /api/admin/fraternity-users
  - Query: status (optional), limit, offset
  - Headers: x-admin-token (must match process.env.ADMIN_TOKEN)
  - Response: List of fraternity users

PATCH /api/admin/fraternity-users/:id/approve
  - Headers: x-admin-token
  - Response: Updated user with approval_status: 'approved'

PATCH /api/admin/fraternity-users/:id/reject
  - Body: reason (optional)
  - Headers: x-admin-token
  - Response: Updated user with approval_status: 'rejected'

DELETE /api/admin/fraternity-users/:id
  - Headers: x-admin-token
  - Behavior: Deletes fraternity_users record and associated auth user
```

### Marketplace Routes
```typescript
GET /api/chapters/search
  - Query: q (search query), limit
  - Response: Matching chapters for browsing

GET /api/companies
  - Query: approval_status='approved'
  - Response: List of approved brands
```

---

## 6. FRONTEND COMPONENTS & PAGES

### Key Components
- **`AuthProvider`** - Wraps entire app with Supabase auth context
- **`PrivateRoute`** - Protects routes that require authentication
- **`AdminRoute`** - Protects admin-only pages

### Fraternity-Specific Pages
```
frontend/src/pages/
├─ FraternitySignUpPage.tsx           # Basic 3-step signup
├─ FraternitySignUpPageEnhanced.tsx  # Enhanced signup (newer version)
├─ FraternityPendingApprovalPage.tsx # Waiting screen during approval
├─ FraternityDashboardPage.tsx       # Main dashboard (private route)
└─ FraternityMarketplacePage.tsx     # Browse brands page

frontend/src/contexts/
└─ AuthContext.tsx                   # Auth state management
```

### Route Mappings (App.tsx)
```typescript
// Public routes
'/signup/fraternity' → FraternitySignUpPageEnhanced
'/signup/fraternity/basic' → FraternitySignUpPage
'/fraternity/pending-approval' → FraternityPendingApprovalPage
'/get-sponsored' → GetSponsoredPage

// Private route (requires dashboard auth)
'/fraternity/dashboard' → FraternityDashboardPage

// Public marketplace
'/fraternity/marketplace' → FraternityMarketplacePage
```

---

## 7. DATA FLOW: LOGIN TO DASHBOARD

### Step 1: Sign Up
```
User fills FraternitySignUpPage (3 steps)
  ↓
POST /api/fraternity/signup (backend)
  ↓
✓ Supabase auth.users created (JWT issued)
✓ fraternity_users record created (approval_status: 'pending')
  ↓
Redirect to /fraternity/pending-approval
```

### Step 2: Admin Approval
```
Admin logs in at /admin/fraternity-users tab
  ↓
Sees pending fraternity users
  ↓
Clicks "Approve" button
  ↓
PATCH /api/admin/fraternity-users/:id/approve
  ↓
Database: approval_status = 'approved'
```

### Step 3: User Access
```
User returns and logs in via normal login (/login)
  ↓
Supabase authenticates with JWT
  ↓
Frontend checks GET /api/fraternity/me
  ↓
Backend verifies approval_status = 'approved'
  ↓
Grant access to /fraternity/dashboard
  ↓
OR redirect to /fraternity/pending-approval if not approved
```

### Step 4: Dashboard Load
```
FraternityDashboardPage mounts
  ↓
GET /api/fraternity/me (with Bearer token)
  ↓
GET /api/companies (fetch approved brands)
  ↓
Display tabbed dashboard interface
```

---

## 8. KEY FEATURES READY FOR "BROWSE BRANDS" & "MARK INTEREST"

### Already Built
✓ Fraternity authentication system
✓ Approval workflow
✓ Fraternity dashboard
✓ Company/brand listing fetching
✓ Search & filter by industry
✓ Brand card display with details
✓ "Request" button on brand cards (currently no backend)

### Ready for Enhancement
- **Browse Brands Tab** - Display companies filtered by approval status
- **Request/Interest Tracking** - Create new table: `fraternity_brand_interests`
- **My Sponsorships Tab** - Show interests and pending/active connections
- **Matching Algorithm** - Suggest brands based on sponsorship type
- **Direct Messaging** - Connect fraternity users with company reps

---

## 9. ADMIN PANEL ACCESS

### Admin Fraternity Users Tab
- Route: `/admin/fraternity-users`
- URL: Part of main `AdminPageV4` dashboard
- Features:
  - View all pending fraternity user signups
  - Approve/reject with optional message
  - Delete fraudulent users
  - Filter by status (pending, approved, rejected)
  - Pagination support

---

## 10. ARCHITECTURE SUMMARY

### Authentication Flow
```
Fraternity User ← Separate from Company Users
      ↓
Supabase Auth (JWT based)
      ↓
fraternity_users table (Supabase)
      ↓
approval_status controls access
```

### Access Control
- **Public**: Signup, Pending Approval page, Marketplace
- **Private**: Dashboard, Profile, Settings (requires approval_status='approved')
- **Admin**: User management and approval

### Company Integration
- Companies stored in `companies` table
- Approval status gates who appears in marketplace
- Brand cards show logo, industry, description
- Future: Direct integration with sponsorship opportunities

### Data Storage Locations
| Data | Location | Purpose |
|------|----------|---------|
| Authentication | Supabase auth.users | Login/JWT tokens |
| Fraternity Profile | fraternity_users table | User metadata & approval |
| Companies | companies table | Brand information |
| Sponsorships (Future) | sponsorships table | Pending/active deals |

---

## NEXT STEPS FOR FEATURES

### To Add "Browse Brands" with Mark Interest:

1. **Create `fraternity_brand_interests` table**
   ```sql
   CREATE TABLE fraternity_brand_interests (
     id UUID PRIMARY KEY,
     fraternity_user_id UUID REFERENCES fraternity_users(id),
     company_id UUID REFERENCES companies(id),
     interest_type VARCHAR(50),  -- 'event', 'chapter', 'both'
     status VARCHAR(20),         -- 'interested', 'contacted', 'active'
     created_at TIMESTAMP,
     UNIQUE(fraternity_user_id, company_id)
   );
   ```

2. **Create Backend Routes**
   ```typescript
   POST /api/fraternity/brands/:id/mark-interest
   GET /api/fraternity/my-brand-interests
   DELETE /api/fraternity/brands/:id/interests
   ```

3. **Update Frontend**
   - Change "Request" button to "Mark Interest"
   - Add to-heart icon toggle
   - Show marked brands in "My Sponsorships" tab
   - Update analytics to show engagement

---

## SECURITY CONSIDERATIONS

✓ Approval workflow prevents unauthorized access
✓ JWT tokens used for API authentication
✓ RLS policies on sensitive tables
✓ Admin token verification for admin endpoints
✓ Payment info stored in database (encrypted at rest in Supabase)
✓ Email verification on signup

⚠️ To Improve:
- Implement rate limiting on signup
- Add email verification before approval
- Implement 2FA for user accounts
- Audit logging for sponsorship connections


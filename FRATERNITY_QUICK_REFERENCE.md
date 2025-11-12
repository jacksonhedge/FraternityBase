# FraternityBase - Quick Reference Guide

## File Locations

### Frontend Pages
- **Sign Up**: `/frontend/src/pages/FraternitySignUpPage.tsx` (basic 3-step form)
- **Dashboard**: `/frontend/src/pages/FraternityDashboardPage.tsx` (main UI - 7 tabs)
- **Pending Approval**: `/frontend/src/pages/FraternityPendingApprovalPage.tsx`
- **Marketplace**: `/frontend/src/pages/FraternityMarketplacePage.tsx`

### Backend Routes
- **Main Handler**: `/backend/src/routes/fraternity.ts` (signup, profile, approve, reject, delete)
- **Database Schema**: `/database/create_user_profiles.sql` (user_profiles table)

### Database Tables
- **Fraternity Users**: `fraternity_users` table (links to Supabase auth)
- **Companies**: `companies` table (brands available in marketplace)

## Key Routes

### Frontend Routes
```
/signup/fraternity                    - Main signup
/fraternity/pending-approval          - Waiting screen
/fraternity/dashboard                 - Authenticated dashboard (private)
/fraternity/marketplace               - Browse brands (public)
/get-sponsored                        - Landing page
```

### API Routes
```
POST   /api/fraternity/signup         - Create account
GET    /api/fraternity/me             - Get current user profile
GET    /api/admin/fraternity-users    - List all fraternity users
PATCH  /api/admin/fraternity-users/:id/approve   - Approve user
PATCH  /api/admin/fraternity-users/:id/reject    - Reject user
DELETE /api/admin/fraternity-users/:id           - Delete user
```

## Current State

### What Works
- User registration with 3-step form
- Email + password authentication via Supabase
- Admin approval workflow
- Dashboard with 7 tabs
- Browse brands with search/filter
- Brand card display
- Basic statistics

### What's Missing
- Backend endpoint for "Mark Interest" button
- `fraternity_brand_interests` database table
- Interest status tracking
- "My Sponsorships" population
- Direct messaging/contacting brands

## How to Use

### As a Fraternity User
1. Go to `/signup/fraternity`
2. Fill out 3-step form (personal, chapter, optional event)
3. Wait for admin approval
4. Receive approval email
5. Login at `/login`
6. Access `/fraternity/dashboard`
7. Browse brands in "Browse Brands" tab
8. Click "Request" to mark interest (currently no backend)

### As Admin
1. Go to `/admin/fraternity-users`
2. See pending signups
3. Click "Approve" or "Reject"
4. User gets email notification

## Dashboard Tabs Explained

| Tab | Purpose | Status |
|-----|---------|--------|
| My Listings | Create sponsorship opportunities | UI Only |
| Browse Brands | Discover brands to partner with | 80% Complete |
| My Sponsorships | Track active partnerships | Empty State |
| Assets & Media | Upload chapter materials | UI Only |
| My Events | Manage events | UI Only |
| Analytics | View performance | UI Only |
| Settings | Read chapter profile | Working |

## Key Tables

### fraternity_users (Supabase)
```sql
id, user_id, first_name, last_name, email, college, 
fraternity_or_sorority, position, sponsorship_type,
approval_status ('pending'/'approved'/'rejected'),
instagram, website, payment_venmo, payment_zelle, etc.,
has_upcoming_event, event_name, event_date, event_type
```

### companies (Supabase)
```sql
id, name, logo_url, industry, description, 
approval_status, website, created_at
```

### user_profiles (Company Users)
```sql
id, user_id, company_id, role, subscription_tier, etc.
(DIFFERENT from fraternity_users - used for company employees)
```

## Important Notes

- **Fraternity auth ≠ Company auth**: Two separate user types
- **Approval required**: Users can't access dashboard until approved
- **JWT tokens**: All API calls need Bearer token in headers
- **Admin token**: Admin routes need `x-admin-token` header
- **Brand filtering**: Only `approval_status='approved'` companies show

## To Add Mark Interest Feature

1. Create table:
```sql
CREATE TABLE fraternity_brand_interests (
  id UUID PRIMARY KEY,
  fraternity_user_id UUID REFERENCES fraternity_users(id),
  company_id UUID REFERENCES companies(id),
  interest_type VARCHAR(50),
  status VARCHAR(20),
  created_at TIMESTAMP,
  UNIQUE(fraternity_user_id, company_id)
);
```

2. Add routes:
```typescript
POST /api/fraternity/brands/:id/mark-interest
GET /api/fraternity/my-brand-interests
DELETE /api/fraternity/brands/:id/interests
```

3. Update UI:
- Change "Request" button to show heart icon
- Toggle interest on click
- Populate "My Sponsorships" tab with interests

## Debugging

### User can't login
- Check `approval_status` in fraternity_users table
- Verify Supabase auth user exists
- Check JWT token in browser console

### Dashboard not loading
- Verify user is authenticated
- Check GET /api/fraternity/me returns data
- Look for CORS errors in browser console

### Brands not showing
- Verify companies exist in database
- Check `approval_status = 'approved'` filter
- Verify Supabase query permissions


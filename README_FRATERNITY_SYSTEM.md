# FraternityBase Fraternity User System - Complete Documentation

## Overview

This directory contains comprehensive documentation for the FraternityBase fraternity user system. The system allows Greek life organizations (fraternities & sororities) to sign up, browse sponsorship opportunities from brands, and manage partnerships - all at zero cost.

## Documentation Files

### 1. **FRATERNITY_SYSTEM_ARCHITECTURE.md** (Primary Reference)
   - **Size**: 13KB, 400+ lines
   - **Purpose**: Complete technical documentation
   - **Contains**:
     - Authentication system overview
     - Database schema definitions
     - Complete API endpoint documentation
     - Data flow diagrams
     - Security considerations
     - Recommended next steps for features
   - **Best for**: Understanding the complete system architecture

### 2. **FRATERNITY_QUICK_REFERENCE.md** (Quick Lookup)
   - **Size**: 4.8KB, 150+ lines
   - **Purpose**: Quick lookup guide for developers
   - **Contains**:
     - File locations (frontend, backend, database)
     - Key route mappings
     - Database table structures
     - Current state & what's missing
     - How to use (user/admin perspectives)
     - Debugging tips
   - **Best for**: Finding files, remembering route names, troubleshooting

### 3. **FRATERNITY_SYSTEM_FLOW.txt** (Visual Diagrams)
   - **Size**: 16KB, 350+ lines
   - **Purpose**: ASCII diagrams and visual workflows
   - **Contains**:
     - Sign-up flow diagram
     - Dashboard layout diagram
     - Tab details breakdown
     - Database schema diagram
     - API endpoint reference
     - Current state checklist
   - **Best for**: Visual learners, understanding data flow

## Quick Start

### For New Team Members
1. Start with **FRATERNITY_QUICK_REFERENCE.md**
2. Review **FRATERNITY_SYSTEM_FLOW.txt** for visual understanding
3. Deep dive into **FRATERNITY_SYSTEM_ARCHITECTURE.md** as needed

### For Implementation Work
1. Check **FRATERNITY_QUICK_REFERENCE.md** for file locations
2. Use **FRATERNITY_SYSTEM_ARCHITECTURE.md** for API specs
3. Reference **FRATERNITY_SYSTEM_FLOW.txt** for data flow

### For Debugging
1. Go to **FRATERNITY_QUICK_REFERENCE.md** → "Debugging" section
2. Check **FRATERNITY_SYSTEM_ARCHITECTURE.md** → "Security Considerations"
3. Use file locations to find code

## System Architecture Summary

### Authentication
- **Separate** from company users (different auth flow)
- Uses **Supabase JWT tokens** (email/password)
- Links to Supabase `auth.users` table
- Approval workflow gates access

### Sign-Up Process
1. User fills 3-step form at `/signup/fraternity`
2. Account created with `approval_status: 'pending'`
3. Admin approves via `/admin/fraternity-users`
4. User logs in and accesses `/fraternity/dashboard`

### Dashboard Features
- **7 tabbed interface** with sidebar navigation
- **Browse Brands tab**: Search/filter approved companies (80% complete)
- **My Sponsorships**: Track active partnerships (empty state)
- **My Listings**: Create sponsorship opportunities (UI only)
- **My Events**: Manage events (UI only)
- **Assets & Media**: Upload materials (UI only)
- **Analytics**: View performance (UI only)
- **Settings**: View read-only profile info

### Database
- **fraternity_users**: Main user table (30+ columns)
- **companies**: Brand information
- **auth.users**: Supabase managed authentication

### API Endpoints
```
POST   /api/fraternity/signup              - Register new user
GET    /api/fraternity/me                  - Get current profile
GET    /api/admin/fraternity-users         - List users (admin)
PATCH  /api/admin/fraternity-users/:id/approve  - Approve (admin)
PATCH  /api/admin/fraternity-users/:id/reject   - Reject (admin)
DELETE /api/admin/fraternity-users/:id          - Delete (admin)
```

## Key File Locations

### Frontend
```
/frontend/src/pages/FraternitySignUpPage.tsx          - Basic 3-step signup
/frontend/src/pages/FraternitySignUpPageEnhanced.tsx  - Enhanced signup
/frontend/src/pages/FraternityPendingApprovalPage.tsx - Waiting screen
/frontend/src/pages/FraternityDashboardPage.tsx       - Main dashboard (7 tabs)
/frontend/src/pages/FraternityMarketplacePage.tsx     - Public brand browsing
/frontend/src/App.tsx                                 - Route definitions
```

### Backend
```
/backend/src/routes/fraternity.ts          - All fraternity endpoints
/backend/src/server.ts                     - Server configuration
/database/create_user_profiles.sql         - User profiles schema
/database/sigma_chi_schema.sql             - Member encryption schema
```

### Database
```
Supabase Project ID: vvsawtexgpopqxgaqyxg
Table: fraternity_users
Table: companies
Table: auth.users (Supabase managed)
```

## Current Implementation Status

### Complete (✓)
- User registration with 3-step form
- Email/password authentication
- Admin approval workflow
- Dashboard with 7 tabs
- Browse brands with search/filter
- Brand card display with details
- Basic statistics

### In Progress / Partial (⏳)
- Tab: My Listings (UI only, no backend)
- Tab: Assets & Media (UI only)
- Tab: My Events (UI only)
- Tab: Analytics (UI only)
- Request/Mark Interest button (no backend)

### Not Started (✗)
- fraternity_brand_interests database table
- Mark Interest API endpoint
- My Sponsorships population
- Direct messaging system
- Matching algorithm

## Next Steps: Mark Interest Feature

To complete the "Browse Brands" → "Mark Interest" functionality:

### Phase 1: Database (15 min)
```sql
CREATE TABLE fraternity_brand_interests (
  id UUID PRIMARY KEY,
  fraternity_user_id UUID REFERENCES fraternity_users(id),
  company_id UUID REFERENCES companies(id),
  interest_type VARCHAR(50),    -- 'event', 'chapter', 'both'
  status VARCHAR(20),           -- 'interested', 'contacted', 'active'
  created_at TIMESTAMP,
  UNIQUE(fraternity_user_id, company_id)
);
```

### Phase 2: Backend (30 min)
```
POST   /api/fraternity/brands/:id/mark-interest
GET    /api/fraternity/my-brand-interests
DELETE /api/fraternity/brands/:id/interests
```

### Phase 3: Frontend (45 min)
- Change "Request" button → "Mark Interest" with heart icon
- Toggle interest on click
- Populate "My Sponsorships" tab
- Add engagement analytics

**Total Estimated Time**: 1.5 hours

## Security Features

### Current
✓ Approval workflow prevents unauthorized access
✓ JWT tokens for API authentication
✓ Admin token verification
✓ Payment info stored (encrypted in Supabase)
✓ Email verification on signup

### Recommended Improvements
⚠️ Add rate limiting on signup
⚠️ Implement 2FA for user accounts
⚠️ Email verification before approval
⚠️ Audit logging for sponsorship connections

## Testing Checklist

- [ ] Sign up at /signup/fraternity
- [ ] Verify pending approval redirect
- [ ] Check fraternity_users table
- [ ] Approve via /admin/fraternity-users
- [ ] Log in with approved account
- [ ] Access /fraternity/dashboard
- [ ] Test all 7 dashboard tabs
- [ ] Test browse brands search/filter
- [ ] Verify statistics display
- [ ] Test brand card UI

## Debugging Guide

### User can't login
- Check `approval_status` in fraternity_users table
- Verify Supabase auth user exists
- Check JWT token in browser console

### Dashboard not loading
- Verify user is authenticated
- Check GET /api/fraternity/me response
- Look for CORS errors in browser console

### Brands not showing
- Verify companies exist in database
- Check `approval_status = 'approved'` filter
- Verify Supabase query permissions

## Resources

### Documentation
- **FRATERNITY_SYSTEM_ARCHITECTURE.md** - Technical deep dive
- **FRATERNITY_QUICK_REFERENCE.md** - Quick lookup
- **FRATERNITY_SYSTEM_FLOW.txt** - Visual diagrams

### External Resources
- Supabase Project: [vvsawtexgpopqxgaqyxg](https://app.supabase.com)
- Backend Operations: See `/backend/BACKEND_OPERATIONS.md`
- Frontend: React with TypeScript + Tailwind CSS
- Backend: Node.js/Express + TypeScript

## Support

For questions about:
- **Architecture**: See FRATERNITY_SYSTEM_ARCHITECTURE.md
- **File locations**: See FRATERNITY_QUICK_REFERENCE.md
- **Data flow**: See FRATERNITY_SYSTEM_FLOW.txt
- **Specific features**: See individual component files

---

**Last Updated**: November 4, 2025
**Status**: Investigation Complete
**Next Action**: Ready to implement Mark Interest feature

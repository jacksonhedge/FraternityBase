# FraternityBase Project - Resume Work Prompt

Copy and paste this prompt to Claude Code when resuming work tomorrow:

---

## 🎯 PROJECT CONTEXT

I'm working on **FraternityBase**, a SaaS platform that helps businesses connect with Greek life organizations (fraternities and sororities) across 250+ universities. The platform provides access to 5,000+ chapters with features like chapter unlocks, warm introductions, and ambassador referrals.

## 📂 PROJECT LOCATION

**Main Project Directory:**
```
/Users/jacksonfitzgerald/CollegeOrgNetwork/
```

**Key Directories:**
- Frontend: `/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/`
- Backend: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/`
- Documentation: `/Users/jacksonfitzgerald/CollegeOrgNetwork/` (pricing docs are here)

**Tech Stack:**
- Frontend: React + TypeScript + Vite + TailwindCSS
- Backend: Express.js + Node.js
- Database: Supabase (PostgreSQL)
- Deployment: Vercel (both frontend and backend)
- State Management: Redux
- Routing: React Router

## 🚀 DEPLOYMENT COMMANDS

### Deploy Backend to Production:
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
vercel deploy --prod
```

### Deploy Frontend to Production:
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
vercel deploy --prod
```

**Note:** Always deploy backend first if both have changes, then deploy frontend.

## 📊 RECENT CHANGES (Session Summary)

### What Was Completed in Previous Sessions:

1. **TickerTape Feature**
   - Created `/api/chapters/recent` endpoint to fetch 20 newest chapters
   - Updated DashboardPage to show real data instead of hardcoded examples
   - Added debugging logs to track data flow

2. **Fraternities Page Accuracy**
   - Created `/api/greek-organizations` endpoint with real chapter counts
   - Removed hardcoded fake national data (39 orgs with fake stats)
   - Updated to show actual database data (61 real organizations)
   - Fixed table structure to match database schema

3. **College Detail Page Fixes**
   - Fixed chapter filtering to use university ID instead of unreliable name matching
   - Fixed Greek org count header to show actual filtered results
   - Added "Coming Soon" tabs for Events and Partnerships

4. **Colleges Page Updates**
   - Removed Students section (not needed)
   - Updated to show Chapters count and Greek Life % (defaults to 15%)
   - Changed from 3 columns to 2 columns in grid view
   - Updated list view table headers

5. **Auto-Logout Feature**
   - Created `useIdleTimeout` hook for 5-minute inactivity timeout
   - Integrated into AuthContext
   - Added idle logout message to LoginPage
   - Users auto-sign out after 5 minutes of inactivity

6. **Pricing Updates**
   - Renamed "Enterprise" to "Enterprise Tier 1" ($299.99/mo) in SubscriptionPage
   - Renamed "Super Enterprise" to "Enterprise Tier 2" (Custom) in SubscriptionPage
   - Updated Team Plan to show 3 chapter unlocks (not 1)
   - Created comprehensive pricing documentation

7. **Database Integration**
   - All `/api/admin/universities` endpoints now use `supabaseAdmin` (bypasses RLS)
   - Accurate chapter counts calculated from actual chapters table
   - Fixed data format inconsistencies

### What Was Completed Today (2025-10-09):

8. **PricingPage Enterprise Tier 1 Addition** ✅
   - Added Enterprise Tier 1 ($299.99/mo) to public PricingPage.tsx
   - Previously only showed 4 tiers (Trial, Team, Billing, Enterprise Tier 2)
   - Now shows 5 tiers with proper ordering
   - Updated grid layout from 4 to 5 columns
   - Features: 1,000 credits/month, 3 warm intros, unlimited unlocks, API access
   - Deployed to production: https://frontend-jea45gklc-jackson-fitzgeralds-projects.vercel.app
   - File: `/frontend/src/pages/PricingPage.tsx` (lines 66-87)

## 🔧 AREAS THAT MIGHT NEED ENHANCEMENT

### 1. **TickerTape Blank Issue (UNRESOLVED)**
   - The TickerTape on Dashboard may still show blank
   - Debugging logs are in place but root cause not confirmed
   - Check browser console for `[Dashboard]` and `[TickerTape]` logs
   - Verify data format from `/api/chapters/recent` endpoint
   - File: `/frontend/src/pages/DashboardPage.tsx`
   - File: `/frontend/src/components/AnimatedTickertape.tsx`

### 2. **Database Fields Not Fully Utilized**
   - `greek_percentage` field added to colleges but still defaults to 15%
   - `greek_members` field added but not populated or displayed
   - Consider calculating actual Greek Life % from chapter data
   - File: `/frontend/src/pages/CollegesPage.tsx`

### 3. **Missing Features from Backend**
   - `/api/credits/transactions` endpoint referenced but not implemented
   - Auto-reload settings for credits not fully implemented
   - File: `/backend/src/server.ts` (search for TODO comments)

### 4. **Hardcoded Data Still Present**
   - Some pages may still reference old hardcoded data
   - Check for `oldOrganizations` or similar arrays
   - Verify all stats are pulling from real API endpoints

### 5. **List View "Avg Deal" Column**
   - Colleges list view shows "Avg Deal" column but has no data
   - Either populate with real data or remove the column
   - File: `/frontend/src/pages/CollegesPage.tsx` (line ~330-395)

### 6. **Error Handling**
   - Many API calls lack comprehensive error handling
   - Loading states are basic (just spinners)
   - Could add retry logic for failed requests
   - Could add toast notifications for errors

### 7. **TypeScript Types**
   - Some `any` types used throughout codebase
   - Could create shared types in `/frontend/src/types/`
   - Interface definitions could be more strict

### 8. **Performance Optimizations**
   - Large lists (5,000+ chapters) could use pagination or virtual scrolling
   - API responses could use caching
   - Images could use lazy loading
   - Consider React.memo for expensive components

### 9. **Mobile Responsiveness**
   - Most pages designed for desktop first
   - Complex tables may not work well on mobile
   - Consider separate mobile views for data-heavy pages

## 🗄️ DATABASE STRUCTURE (Key Tables)

**Supabase Tables:**
- `universities` - 1,106 universities
- `greek_organizations` - 61 organizations
- `chapters` - 103 chapters (links universities + greek_organizations)
- `officers` - 160 officers
- `user_profiles` - User account data
- `companies` - Company/client data
- `unlock_history` - Track chapter unlocks
- `usage_logs` - Track platform usage

**Key Relationships:**
- chapters.university_id → universities.id
- chapters.greek_organization_id → greek_organizations.id
- user_profiles.company_id → companies.id

## 🔐 ENVIRONMENT VARIABLES

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001/api (dev) or Vercel backend URL (prod)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Backend (.env):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3001
```

## 🎨 DESIGN PATTERNS USED

1. **Data Fetching:** useEffect + fetch + localStorage.getItem('token')
2. **State Management:** Redux for auth, local useState for component state
3. **Routing:** React Router with PrivateRoute and AdminRoute wrappers
4. **Styling:** TailwindCSS utility classes + gradients
5. **Icons:** Lucide React icons
6. **API Format:** `{ success: boolean, data: any }` for all responses

## 📝 COMMON TASKS

### Add a new API endpoint:
1. Add route in `/backend/src/server.ts`
2. Use `supabaseAdmin` for database queries (bypasses RLS)
3. Return format: `res.json({ success: true, data: results })`
4. Add error handling with try/catch

### Update a page:
1. Find page in `/frontend/src/pages/`
2. Update component state and JSX
3. Deploy with `vercel deploy --prod` from frontend directory

### Add a new feature:
1. Backend: Create API endpoint
2. Frontend: Add page/component
3. Add route in `/frontend/src/App.tsx`
4. Test locally: `npm run dev` (both frontend and backend)
5. Deploy: backend first, then frontend

## 🐛 DEBUGGING TIPS

1. **Check browser console** for `[Component]` prefixed logs
2. **Check backend logs** with `vercel logs` command
3. **Check API responses** in Network tab (DevTools)
4. **Common issues:**
   - CORS errors: Check API_URL environment variable
   - 401 Unauthorized: Check token in localStorage
   - Empty data: Check Supabase RLS policies (use supabaseAdmin)
   - Deployment issues: Check Vercel build logs

## ✅ WHAT'S WORKING WELL

- ✅ Auto-logout after 5 minutes inactivity
- ✅ Real database integration (no more fake data)
- ✅ Pricing pages updated with correct tier names (both Subscription and Public Pricing)
- ✅ PricingPage now shows all 5 tiers including Enterprise Tier 1 ($299.99/mo)
- ✅ College detail pages show accurate chapter counts
- ✅ All admin API endpoints use service role key
- ✅ Fraternities page shows real greek organizations
- ✅ Comprehensive pricing documentation created

## 🎯 SUGGESTED NEXT STEPS

1. **Debug TickerTape** - Check why it might be showing blank
2. **Calculate Real Greek Life %** - Instead of defaulting to 15%
3. **Remove "Avg Deal" column** - Or populate with real data
4. **Implement transactions endpoint** - For credits page
5. **Add pagination** - For large lists (5,000+ items)
6. **Improve error handling** - Add toast notifications
7. **Mobile optimization** - Make tables responsive
8. **Add loading skeletons** - Better UX than just spinners
9. **Write tests** - Unit tests for critical functions
10. **Populate greek_percentage and greek_members** - Calculate from actual chapter data

---

## 🚀 QUICK START TOMORROW

```bash
# Navigate to project
cd /Users/jacksonfitzgerald/CollegeOrgNetwork

# Start backend dev server
cd backend
npm run dev

# In new terminal, start frontend dev server
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

---

**Last Updated:** 2025-10-09
**Session Summary:** Added Enterprise Tier 1 to PricingPage (5 tiers now shown). Previous sessions: Fixed data accuracy issues, renamed enterprise tiers, added auto-logout, updated pricing docs.
**Production URL:** https://frontend-jea45gklc-jackson-fitzgeralds-projects.vercel.app

# FraternityBase Admin Database Management Guide

## Current State Overview

### What Currently Exists

#### 1. **Frontend Admin Page** (`/admin-panel` route)
- **File**: `/frontend/src/pages/AdminPageV4.tsx`
- **Access**: Protected by `AdminRoute` component
- **Current Features**:
  - 4 tabs: Fraternities, Colleges, Chapters, Contacts
  - CRUD operations UI (Create, Read, Update, Delete)
  - Search functionality
  - Form interfaces for each data type

#### 2. **Backend Database** (SQLite)
- **File**: `/backend/src/database.ts`
- **Location**: `/backend/fraternity-base.db`
- **Current Tables**:
  - `waitlist` - Email collection for landing page
  - `company_signups` - B2B customer signups with approval workflow

**IMPORTANT**: The admin UI references tables that DON'T YET EXIST:
  - `greek_organizations` (fraternities/sororities) - NOT CREATED
  - `universities` (colleges) - NOT CREATED
  - `chapters` (org chapters at specific colleges) - NOT CREATED
  - `chapter_officers` (student leaders) - NOT CREATED

#### 3. **Frontend Map Data** (Hardcoded)
- **File**: `/frontend/src/data/statesGeoData.ts`
- **Contains**:
  - `STATE_COORDINATES`: All 50 US states with lat/lng
  - `COLLEGE_LOCATIONS`: ~90 hardcoded colleges with:
    ```typescript
    {
      lat, lng, state,
      fraternities: number,
      sororities: number,
      totalMembers: number,
      conference: string,
      division: string
    }
    ```
  - Examples: University of Minnesota (52 frats, 28 sororities, 3900 members)

#### 4. **College Logos**
- **Location**: `/frontend/public/college-logos/`
- **Coverage**: 418 college logos organized by conference
- **Conferences**: ACC, Big 10, Big 12, SEC, PAC-12, Big East, Ivy League, +17 others
- **Mapping**: `/frontend/src/utils/collegeLogos.ts`

---

## What Needs to Be Built

### Phase 1: Create Database Tables

Add to `/backend/src/database.ts` in the `initializeDatabase()` function:

```sql
-- Greek Organizations (National/International)
CREATE TABLE IF NOT EXISTS greek_organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  greek_letters TEXT,
  organization_type TEXT CHECK(organization_type IN ('fraternity', 'sorority')),
  founded_year INTEGER,
  national_website TEXT,
  total_chapters INTEGER,
  colors TEXT,
  symbols TEXT,
  philanthropy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Universities/Colleges
CREATE TABLE IF NOT EXISTS universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  student_count INTEGER,
  greek_percentage REAL,
  website TEXT,
  logo_url TEXT,
  conference TEXT,
  division TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chapters (Org presence at specific college)
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  greek_organization_id TEXT REFERENCES greek_organizations(id),
  university_id TEXT REFERENCES universities(id),
  chapter_name TEXT,
  member_count INTEGER,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
  founded_year INTEGER,
  house_address TEXT,
  website TEXT,
  instagram_handle TEXT,
  grade TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chapter Officers/Leaders
CREATE TABLE IF NOT EXISTS chapter_officers (
  id TEXT PRIMARY KEY,
  chapter_id TEXT REFERENCES chapters(id),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  graduation_year INTEGER,
  major TEXT,
  linkedin_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapters_org ON chapters(greek_organization_id);
CREATE INDEX IF NOT EXISTS idx_chapters_uni ON chapters(university_id);
CREATE INDEX IF NOT EXISTS idx_officers_chapter ON chapter_officers(chapter_id);
CREATE INDEX IF NOT EXISTS idx_universities_state ON universities(state);
```

### Phase 2: Create Backend API Routes

Create `/backend/src/routes/admin.ts`:

```typescript
import { Router } from 'express';
import { db } from '../database';

const router = Router();

// Greek Organizations
router.get('/greek-organizations', (req, res) => { /* ... */ });
router.post('/greek-organizations', (req, res) => { /* ... */ });
router.put('/greek-organizations/:id', (req, res) => { /* ... */ });
router.delete('/greek-organizations/:id', (req, res) => { /* ... */ });

// Universities
router.get('/universities', (req, res) => { /* ... */ });
router.post('/universities', (req, res) => { /* ... */ });
router.put('/universities/:id', (req, res) => { /* ... */ });
router.delete('/universities/:id', (req, res) => { /* ... */ });

// Chapters
router.get('/chapters', (req, res) => { /* ... */ });
router.post('/chapters', (req, res) => { /* ... */ });
router.put('/chapters/:id', (req, res) => { /* ... */ });
router.delete('/chapters/:id', (req, res) => { /* ... */ });

// Officers
router.get('/officers', (req, res) => { /* ... */ });
router.post('/officers', (req, res) => { /* ... */ });
router.put('/officers/:id', (req, res) => { /* ... */ });
router.delete('/officers/:id', (req, res) => { /* ... */ });

export default router;
```

Then register in `/backend/src/server.ts`:
```typescript
import adminRoutes from './routes/admin';
app.use('/api/admin', adminRoutes);
```

### Phase 3: Connect Admin UI to Backend

Update `/frontend/src/pages/AdminPageV4.tsx` to:
- Replace mock data with real API calls to `http://localhost:3001/api/admin/*`
- Implement actual CRUD operations
- Add error handling and loading states
- Add image upload for college logos

### Phase 4: Data Migration

Migrate existing hardcoded data from `/frontend/src/data/statesGeoData.ts` into the database:

1. **Universities**: Extract ~90 colleges from `COLLEGE_LOCATIONS`
2. **Greek Organizations**: Create entries for common fraternities/sororities
3. **Chapters**: Generate chapter records linking orgs to universities

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL UI                          │
│              /admin-panel (AdminPageV4.tsx)                 │
│   Tabs: Fraternities | Colleges | Chapters | Contacts      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API ROUTES                         │
│              /api/admin/* (admin.ts)                        │
│    GET/POST/PUT/DELETE for each resource type              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ SQL Queries
                      ↓
┌─────────────────────────────────────────────────────────────┐
│                 SQLITE DATABASE                             │
│            backend/fraternity-base.db                       │
│  Tables: greek_organizations, universities, chapters, etc.  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Data Read
                      ↓
┌─────────────────────────────────────────────────────────────┐
│               USER-FACING MAP VIEW                          │
│           /app/map (MapPageFullScreen.tsx)                  │
│     Displays colleges, fraternities, chapters on map       │
└─────────────────────────────────────────────────────────────┘
```

---

## Admin Panel Features (Already Built in UI)

### 1. Fraternities Tab
**Form Fields**:
- Name (e.g., "Sigma Chi")
- Greek Letters (e.g., "ΣX")
- Type: Fraternity or Sorority
- Founded Year
- National Website URL
- Total Chapters
- Colors
- Symbols
- Philanthropy

### 2. Colleges Tab
**Form Fields**:
- Name
- Location (city)
- State
- Coordinates (lat, lng)
- Student Count
- Greek Percentage
- Website
- Logo URL/Upload

### 3. Chapters Tab
**Form Fields**:
- Select Greek Organization (dropdown)
- Select University (dropdown)
- Chapter Name (e.g., "Alpha Beta")
- Member Count
- Status (Active/Inactive/Suspended)
- Founded Year
- House Address
- Website
- Instagram Handle

### 4. Contacts Tab (Chapter Officers)
**Form Fields**:
- Select Chapter (dropdown)
- Name
- Position (President, VP, etc.)
- Email
- Phone
- Graduation Year
- Major
- LinkedIn URL

---

## Key Integration Points

### Map View Integration
The map (`/app/map`) currently uses hardcoded data from `statesGeoData.ts`. After building the database:

1. Create API endpoint: `GET /api/map/colleges?state=MN`
2. Update `MapPageFullScreen.tsx` to fetch from API instead of hardcoded data
3. Keep existing structure:
   ```typescript
   {
     name: string,
     lat: number,
     lng: number,
     state: string,
     fraternities: number,
     sororities: number,
     totalMembers: number,
     conference: string,
     division: string
   }
   ```

### Fraternity List Integration
When users click a college in the map, they see a fraternity list (`MapPageFullScreen.tsx` lines 795-820). After database is built:

1. Create API: `GET /api/chapters?university_id=xyz`
2. Replace placeholder "Fraternity 1, Fraternity 2" with real chapter data
3. Include: Chapter name, Greek org name, member count, status

---

## File Locations Reference

### Backend
- **Database**: `/backend/src/database.ts`
- **SQLite File**: `/backend/fraternity-base.db`
- **Routes** (to create): `/backend/src/routes/admin.ts`
- **Server**: `/backend/src/server.ts`

### Frontend
- **Admin Panel**: `/frontend/src/pages/AdminPageV4.tsx`
- **Map View**: `/frontend/src/pages/MapPageFullScreen.tsx`
- **Hardcoded Data**: `/frontend/src/data/statesGeoData.ts`
- **Logo Utility**: `/frontend/src/utils/collegeLogos.ts`
- **College Logos**: `/frontend/public/college-logos/`

### Routes
- Admin Panel: `http://localhost:5173/admin-panel`
- Admin Login: `http://localhost:5173/admin-login`
- Map View: `http://localhost:5173/app/map`

---

## Next Steps for Implementation

1. ✅ Create database tables in `backend/src/database.ts`
2. ✅ Create backend API routes in `backend/src/routes/admin.ts`
3. ✅ Register routes in `backend/src/server.ts`
4. ✅ Connect AdminPageV4 to backend API
5. ✅ Test CRUD operations via admin panel
6. ✅ Migrate hardcoded college data to database
7. ✅ Update map view to fetch from database
8. ✅ Add college logo upload functionality
9. ✅ Populate fraternity/sorority data
10. ✅ Link chapters to organizations and universities

---

## Common Fraternities to Add

**Fraternities** (for reference):
- Sigma Chi, Pi Kappa Alpha, Sigma Alpha Epsilon, Kappa Sigma, Delta Tau Delta, Phi Delta Theta, Lambda Chi Alpha, Sigma Nu, Tau Kappa Epsilon, Alpha Tau Omega, Phi Kappa Psi, Beta Theta Pi, Sigma Phi Epsilon, Phi Gamma Delta, Kappa Alpha Order, Theta Chi, Delta Chi, Psi Upsilon, Zeta Beta Tau, Sigma Pi, Delta Upsilon

**Sororities**:
- Alpha Chi Omega, Alpha Delta Pi, Alpha Phi, Chi Omega, Delta Delta Delta, Gamma Phi Beta, Kappa Alpha Theta, Kappa Delta, Kappa Kappa Gamma, Pi Beta Phi, Zeta Tau Alpha, Alpha Omicron Pi, Alpha Gamma Delta, Alpha Sigma Alpha, Delta Gamma

---

## Notes

- Admin page UI is **already built** but not connected to real data
- College data is **hardcoded** in TypeScript file, needs migration to DB
- College logos (418 total) are **already available** in `/public/college-logos/`
- Map view works perfectly, just needs real data source instead of hardcoded
- SQLite database exists but only has waitlist/company signup tables
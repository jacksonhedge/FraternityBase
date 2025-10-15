# Backend Operations Guide - CollegeOrgNetwork

## Database Information
- **Project**: FraternityBase
- **Supabase Project ID**: `vvsawtexgpopqxgaqyxg`
- **Database URL**: `***REMOVED***`
- **Admin API**: `https://backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app/api`
- **Admin Token**: `***REMOVED***`

## Key Tables

### `chapters`
- Links greek_organizations and universities
- **Important Fields**:
  - `id` (uuid)
  - `chapter_name` (varchar)
  - `grade` (numeric) - Rating out of 5.0
  - `is_viewable` (boolean) - Controls visibility
  - `is_favorite` (boolean) - Priority chapters in admin
  - `is_platinum` (boolean) - Chapters referred to partners
  - `member_count` (integer)
  - `status` (varchar) - 'active', 'inactive', etc.

### `greek_organizations`
- **Required Fields**:
  - `name` (varchar, NOT NULL)
  - `greek_letters` (varchar, NOT NULL)
- **Optional Fields**:
  - `organization_type` (varchar) - Usually 'fraternity' or 'sorority'
  - `founded_year` (integer)
  - `national_website`, `total_chapters`, `total_members`, `colors`, `symbols`, `philanthropy`

### `chapter_officers`
- Stores roster members
- **Required Fields**:
  - `chapter_id` (uuid, NOT NULL)
  - `name` (varchar, NOT NULL)
  - `position` (varchar, NOT NULL) - **IMPORTANT**: Always provide default 'Member' if not specified
- **Optional Fields**:
  - `member_type`, `email`, `phone`, `linkedin_profile`, `graduation_year`, `major`, `is_primary_contact`

## Common Operations

### 1. Adding a New Greek Organization

```javascript
// Use Supabase MCP tool
mcp__supabase__execute_sql({
  project_id: 'vvsawtexgpopqxgaqyxg',
  query: `
    INSERT INTO greek_organizations (id, name, greek_letters, organization_type, founded_year)
    VALUES (gen_random_uuid(), 'Organization Name', 'ΑΒΓ', 'fraternity', 1850)
    RETURNING id, name;
  `
})
```

### 2. Creating a Chapter (Quick Add Method)

```javascript
// Best method - uses fuzzy matching for org/university names
const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': ADMIN_TOKEN
  },
  body: JSON.stringify({
    organization_name: 'Sigma Chi',
    university_name: 'Rutgers',
    grade: 4.0,
    is_viewable: true,
    status: 'active'
  })
});
```

### 3. Updating a Chapter

```javascript
const res = await fetch(`${API_URL}/admin/chapters/${chapterId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-token': ADMIN_TOKEN
  },
  body: JSON.stringify({
    is_favorite: true,
    grade: 5.0,
    member_count: 133,
    is_viewable: true
  })
});
```

### 4. Applying Database Migrations

```javascript
// Use Supabase MCP tool
mcp__supabase__apply_migration({
  project_id: 'vvsawtexgpopqxgaqyxg',
  name: 'descriptive_migration_name',
  query: `
    ALTER TABLE chapters
    ADD COLUMN IF NOT EXISTS new_field BOOLEAN DEFAULT FALSE;
  `
})
```

### 5. Bulk Chapter Creation Pattern

```javascript
const chapters = [
  { org: 'Sigma Chi', university: 'Michigan' },
  { org: 'Sigma Chi', university: 'Rutgers' }
  // ... more chapters
];

for (const chapter of chapters) {
  const res = await fetch(`${API_URL}/admin/chapters/quick-add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    },
    body: JSON.stringify({
      organization_name: chapter.org,
      university_name: chapter.university,
      grade: 4.0,
      is_viewable: true,
      status: 'active'
    })
  });

  const data = await res.json();
  // Handle existing chapters: data.existing_chapter
}
```

## Important Patterns & Lessons Learned

### Always Use `supabaseAdmin` for Admin Endpoints
- Regular `supabase` client respects Row Level Security (RLS)
- Admin endpoints must use `supabaseAdmin` to bypass RLS
- **Fixed in server.ts**: All `/api/admin/*` endpoints now use `supabaseAdmin`

### NOT NULL Constraints
- `chapter_officers.position` has NOT NULL constraint
- Always provide default: `position: position || 'Member'`
- Test with curl before bulk imports

### Query Limits
- Supabase default: 1000 rows
- Admin chapter list: `.limit(5000)` to show all chapters
- Applies to: GET `/api/admin/chapters`

### Organization Matching
- Quick Add uses fuzzy matching (Levenshtein distance)
- If org doesn't exist, you'll get clear error message
- Add missing orgs to database first, then create chapters

### Platinum Chapters
- `is_platinum = true` indicates chapters referred to partners
- These are high-value chapters with existing relationships
- Always set: `grade: 5.0`, `is_viewable: true`, `is_favorite: true`

## Recent Work Summary

### Platinum Chapters (November 2025)
Created 11 platinum chapters:
- Sigma Chi at University of Michigan
- Sigma Chi at Rutgers
- Sigma Chi at Michigan State
- Sigma Chi at Texas A&M
- Sigma Chi at Pitt
- Phi Sigma Phi at WVU
- Sigma Chi at Illinois
- Zeta Psi at Rutgers
- Chi Phi at Penn State
- Lambda Chi Alpha at Penn State
- Alpha Delta Phi at Illinois (new org added)

### Rutgers Expansion (November 2025)
Added 24 chapters to Rutgers at 4.0 grade:
- Added 6 new organizations: Alpha Phi Delta, Chi Psi, La Unidad Latina Lambda Upsilon Lambda, Phi Mu Delta, Sigma Beta Rho, Sigma Phi Delta
- All chapters marked `is_viewable: true`, `status: 'active'`
- Total Rutgers chapters: 28 (including 2 pre-existing 5.0 platinum)

## API Endpoints Reference

### Admin Chapter Endpoints
- `GET /api/admin/chapters` - List all chapters (uses `supabaseAdmin`, limit 5000)
- `POST /api/admin/chapters/quick-add` - Create chapter with fuzzy matching
- `PATCH /api/admin/chapters/:id` - Update chapter
- `POST /api/admin/chapters/:id/paste-roster` - Bulk import roster CSV
- `DELETE /api/admin/chapters/:id` - Delete chapter

### Admin Officer Endpoints
- `GET /api/admin/officers` - List officers (uses `supabaseAdmin`)
- `POST /api/admin/officers` - Create officer (uses `supabaseAdmin`, default position)
- `PUT /api/admin/officers/:id` - Update officer (uses `supabaseAdmin`)
- `DELETE /api/admin/officers/:id` - Delete officer (uses `supabaseAdmin`)

## Troubleshooting

### Chapter Not Showing in Admin Panel
- Check if using `supabaseAdmin` in GET endpoint
- Check query limit (increase to 5000+)
- Verify `is_viewable: true`
- Mark as `is_favorite: true` to prioritize

### Roster Import Failing with 500 Errors
- Check NOT NULL constraints on `chapter_officers` table
- Ensure `position` field has default value
- Verify endpoints use `supabaseAdmin`
- Test with single curl request first

### Organization Not Found
- Check spelling with fuzzy tolerance in mind
- Query database: `SELECT * FROM greek_organizations WHERE name ILIKE '%searchterm%'`
- Add missing org before creating chapters
- Include `greek_letters` and `organization_type`

## Scripts Location
All operational scripts in: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/`

## Deployment
- Backend: Vercel (auto-deploy on push)
- Latest: `backend-cnwqxx53h-jackson-fitzgeralds-projects.vercel.app`
- Environment variables must be set via Vercel CLI and require redeployment

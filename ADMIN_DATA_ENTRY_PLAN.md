# Super-Admin Data Entry System

## Quick Start Admin Tools (Build These First!)

### 1. CSV Bulk Import Page
```javascript
// Route: /admin/import
Features:
- Drag & drop multiple CSV files
- Auto-detect column mappings
- Preview & validate before import
- Progress tracking
- Error reporting with line numbers
```

### 2. Quick Add Form
```javascript
// Route: /admin/quick-add
Fields:
- Chapter selection dropdown
- Member info (name, email, phone)
- Graduation year
- Position/role
- One-click save
- Keyboard shortcuts (Ctrl+Enter to save & new)
```

### 3. Data Quality Dashboard
```javascript
// Route: /admin/quality
Shows:
- Chapters missing data
- Incomplete member records
- Duplicate warnings
- Last update dates
- Coverage map (which chapters have data)
```

### 4. Search & Edit
```javascript
// Route: /admin/edit
Features:
- Global search across all data
- Inline editing
- Bulk operations (delete, update chapter, etc.)
- Change history
```

## Data Entry Workflows

### Workflow 1: New Chapter Roster
1. Receive roster (email, PDF, Excel)
2. Convert to CSV if needed
3. Upload via /admin/import
4. Review preview
5. Fix any mapping issues
6. Import
7. Check quality dashboard

### Workflow 2: Update Existing Chapter
1. Search chapter in /admin/edit
2. Either:
   - Upload new CSV (system merges)
   - Edit individual records
   - Bulk update fields

### Workflow 3: Quick Officer Updates
1. Go to /admin/quick-add
2. Select chapter
3. Add/update officer positions
4. Save & next

## Database Queries You'll Need

```sql
-- Find chapters needing updates
SELECT
  chapter_name,
  COUNT(*) as member_count,
  MAX(updated_at) as last_update,
  DATEDIFF(NOW(), MAX(updated_at)) as days_old
FROM chapters c
LEFT JOIN members m ON c.id = m.chapter_id
GROUP BY c.id
HAVING days_old > 180
ORDER BY days_old DESC;

-- Find incomplete records
SELECT
  COUNT(*) FILTER (WHERE email IS NULL) as missing_emails,
  COUNT(*) FILTER (WHERE phone IS NULL) as missing_phones,
  COUNT(*) FILTER (WHERE graduation_year IS NULL) as missing_grad_year
FROM members
WHERE chapter_id = ?;

-- Duplicate detection
SELECT
  email,
  COUNT(*) as count
FROM members
GROUP BY email
HAVING count > 1;
```

## Time-Saving Features

### 1. Template Recognition
System learns common CSV formats and auto-maps columns

### 2. Batch Operations Keyboard Shortcuts
- `Ctrl+S` - Save current
- `Ctrl+N` - New entry
- `Ctrl+D` - Duplicate current
- `Ctrl+/` - Search

### 3. Smart Defaults
- Auto-detect university from chapter name
- Predict graduation year from age/grade
- Format phone numbers automatically
- Validate emails in real-time

### 4. Import History
- Track who imported what and when
- Ability to rollback bad imports
- See diff of what changed

## API Endpoints for Admin

```typescript
// Admin-only endpoints (require super-admin auth)
POST   /api/admin/import/csv
POST   /api/admin/members/quick-add
GET    /api/admin/quality/report
PUT    /api/admin/members/:id
DELETE /api/admin/members/:id
POST   /api/admin/bulk/update
GET    /api/admin/duplicates
POST   /api/admin/merge
GET    /api/admin/import/history
POST   /api/admin/import/rollback/:batchId
```

## Security for Admin

```javascript
// Simple but effective admin auth
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAIL = 'jacksonfitzgerald25@gmail.com';

// Or use a simple token
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// Middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Admin only' });
  }
  next();
}
```

## Priority Order (Do These First!)

1. **Day 1 Morning**: Build CSV import with preview
2. **Day 1 Afternoon**: Create quick-add form
3. **Day 2**: Add search/edit functionality
4. **Day 3**: Quality dashboard
5. **Week 1**: Automate common patterns

## Pro Tips

1. **Start with USC Sigma Chi** - Import this completely first
2. **Create keyboard macros** - For repetitive data entry
3. **Use Google Sheets** - As a staging area before import
4. **Build undo/rollback** - You'll make mistakes
5. **Log everything** - Track what data came from where

## Data Sources to Tap

### Immediate
- Chapter websites (officer pages)
- Instagram bios (often list position)
- LinkedIn (search "Sigma Chi USC")
- Greek life directories

### Soon
- Chapter management systems (OmegaFi, Greek Capital)
- University Greek life offices
- National headquarters databases

### Eventually
- Direct partnerships with nationals
- API integrations
- Member self-service updates

Remember: You don't need perfect data on day 1. You need ENOUGH data to prove value. Even 50% complete rosters are valuable if you're the only one who has them!
# Mass Import - Quick Reference Card

## Basic Commands

### Import by Chapter ID
```bash
cd backend
npm run mass-import -- --file roster.csv --chapter-id "abc-123-def"
```

### Import by University + Org
```bash
npm run mass-import -- --file roster.csv --university "Penn State" --org "Sigma Chi"
```

### Dry Run (Preview)
```bash
npm run mass-import -- --file roster.csv --chapter-id "abc-123" --dry-run
```

---

## Minimal CSV Format

**Required columns**: `name` + `position`

```csv
name,position
Tyler Alesse,President
John Smith,Vice President
```

---

## Recommended CSV Format

**Include email for smart updates**:

```csv
name,position,email,phone,graduation_year
Tyler Alesse,President,tyler@psu.edu,8145551234,2026
John Smith,VP Finance,john@psu.edu,8145555678,2026
```

---

## Flexible Column Names

These all work:

| Standard | Variations Accepted |
|----------|-------------------|
| `name` | full_name, first_name, last_name |
| `position` | title, role, officer_position |
| `email` | email_address |
| `phone` | phone_number, cell, mobile |
| `linkedin` | linkedin_profile, linkedin_url |
| `instagram` | instagram_handle, ig |
| `graduation_year` | grad_year, year |
| `member_type` | type (officer/member/alumni) |

---

## Data Auto-Formatting

| Input | Auto-Formatted To |
|-------|------------------|
| `8145551234` | `(814) 555-1234` |
| `tyleralesse` | `https://www.linkedin.com/in/tyleralesse` |
| `psusigmachi` | `@psusigmachi` |

---

## Find Chapter ID

```sql
SELECT c.id, g.name, u.name
FROM chapters c
JOIN greek_organizations g ON g.id = c.greek_organization_id
JOIN universities u ON u.id = c.university_id
WHERE u.name ILIKE '%Penn State%'
  AND g.name ILIKE '%Sigma Chi%';
```

---

## Verify Import

```sql
-- Count imported officers
SELECT COUNT(*) FROM chapter_officers WHERE chapter_id = 'YOUR_ID';

-- View sample records
SELECT name, position, email FROM chapter_officers
WHERE chapter_id = 'YOUR_ID' LIMIT 5;
```

---

## Common Errors

| Error | Solution |
|-------|----------|
| "Chapter not found" | Verify chapter ID or use uni + org name |
| "University not found" | Use full name or check spelling |
| "Missing required fields" | Ensure CSV has `name` and `position` columns |

---

## Pro Tips

1. **Always dry-run first**: `--dry-run`
2. **Include emails**: Enables smart updates
3. **Use UTF-8**: Save CSV as "UTF-8" in Excel
4. **Test small batch**: Import 5 rows first

---

## Full Documentation

See **MASS_IMPORT_GUIDE.md** for complete details.

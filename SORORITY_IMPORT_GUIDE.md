# Sorority Import Guide

**Ready to import 5,313 sorority chapters!** 🎀

---

## What's Been Done

✅ Database schema updated:
- Added `greek_letters` column (for ΣΧ, ΦΜ, etc.)
- Added `greekrank_url` column (external validation)
- Added `greekrank_verified` flag
- Added `organization_type` column (fraternity/sorority)

✅ Import script created:
- Filters for sororities only
- Matches existing universities
- Creates new organizations with Greek letters
- Prevents duplicates
- Full logging and statistics

✅ Dry-run tested successfully:
- University matching works (Miami University, Cleveland State, etc.)
- Greek letters extracted correctly (ΚΚΓ, ΦΜ, ΑΧΩ, ΑΔΠ)
- Organization creation logic validated

---

## How to Run

### Test First (Recommended)
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run import:sororities -- --dry-run
```

This will show you exactly what would be imported without writing any data.

### Actually Import
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run import:sororities
```

This will import all 5,313 sororities into your database.

---

## What Will Be Imported

### Sorority Organizations (Examples):
- Kappa Kappa Gamma (ΚΚΓ)
- Alpha Chi Omega (ΑΧΩ)
- Delta Delta Delta (ΔΔΔ)
- Pi Beta Phi (ΠΒΦ)
- Chi Omega (ΧΩ)
- Alpha Phi (ΑΦ)
- Zeta Tau Alpha (ΖΤΑ)
- Delta Gamma (ΔΓ)
- Kappa Delta (ΚΔ)
- Alpha Omicron Pi (ΑΟΠ)
- Gamma Phi Beta (ΓΦΒ)
- Alpha Delta Pi (ΑΔΠ)
- Phi Mu (ΦΜ)
- Delta Zeta (ΔΖ)
- Kappa Alpha Theta (ΚΑΘ)
- Alpha Gamma Delta (ΑΓΔ)
- Sigma Kappa (ΣΚ)

Plus many more, including historically Black sororities:
- Alpha Kappa Alpha (ΑΚΑ)
- Delta Sigma Theta (ΔΣΘ)
- Zeta Phi Beta (ΖΦΒ)
- Sigma Gamma Rho (ΣΓΡ)

### Sample Universities:
- Florida State University (21 sororities)
- Miami University (22 sororities)
- Ohio University (13 sororities)
- Penn State University (~30 sororities)
- University of Alabama (25+ sororities)
- And 800+ more universities

---

## Expected Results

**Projected Import Statistics:**
```
📦 Batches processed:        17
🏫 Universities:
   - Matched existing:       ~15-20
   - Created new:            ~800-805
📍 Chapters:
   - Created:                5,313 sororities
   - With Greek letters:     5,313
   - With GreekRank URLs:    5,313
```

**Database Growth:**
- **Before:** 97 chapters (all fraternities)
- **After:** 5,410 chapters (97 fraternities + 5,313 sororities)
- **Growth:** 5,477% increase! 🚀

---

## Safety Features

✅ **No Overwriting:** Script won't touch existing fraternity data
✅ **Duplicate Detection:** Checks university + organization combination
✅ **Transaction Safety:** Each chapter insertion is atomic
✅ **Error Handling:** Continues processing even if one chapter fails
✅ **Dry-Run Mode:** Test before committing

---

## Import Time Estimate

- **Dry-run:** ~5-10 minutes (just reads and displays)
- **Actual import:** ~15-25 minutes (creates 5,313 records + ~150 new organizations + ~800 universities)

---

## After Import

### Verify Data:
```sql
-- Check sorority count
SELECT COUNT(*) FROM chapters WHERE organization_type = 'sorority';

-- Sample sororities with Greek letters
SELECT
  chapter_name,
  greek_letters,
  greek_organizations.name as org_name,
  universities.name as university
FROM chapters
JOIN greek_organizations ON chapters.greek_organization_id = greek_organizations.id
JOIN universities ON chapters.university_id = universities.id
WHERE organization_type = 'sorority'
LIMIT 20;

-- Check GreekRank verification
SELECT COUNT(*) FROM chapters WHERE greekrank_verified = true;
```

### Update Frontend:
- Chapters will now have `greek_letters` field populated
- Display as: "Alpha Chi Omega (ΑΧΩ) at Penn State"
- Show sororities alongside fraternities in search
- Add sorority filter option

---

## Business Impact

### Market Expansion:
- **New Customer Segment:** Sorority recruitment companies
- **New Use Cases:** Sorority marketing, Panhellenic council engagement
- **Competitive Advantage:** Only platform with comprehensive sorority data

### Revenue Opportunities:
- Same unlock pricing applies to sororities
- 5,313 additional unlock opportunities
- Potential 54x increase in unlock revenue

### Platform Value:
- From niche (fraternities only) → comprehensive (all Greek life)
- Better for universities (see full Greek landscape)
- More attractive for investors

---

## Rollback Plan

If something goes wrong, you can remove all imported sororities:

```sql
-- Remove sorority chapters (DANGER - only use if needed!)
DELETE FROM chapters WHERE organization_type = 'sorority';

-- Remove sorority organizations (if not used elsewhere)
DELETE FROM greek_organizations
WHERE type = 'sorority'
  AND id NOT IN (SELECT DISTINCT greek_organization_id FROM chapters);

-- Remove universities with no chapters (if needed)
DELETE FROM universities
WHERE id NOT IN (SELECT DISTINCT university_id FROM chapters);
```

**Note:** Only use rollback if there's a critical issue. Test with dry-run first!

---

## Next Steps After Import

1. **Frontend Updates:**
   - Display Greek letters in chapter cards
   - Add sorority filter to search
   - Update chapter detail pages to show Greek letters
   - Add "View on GreekRank" link

2. **Quality Check:**
   - Spot-check 10-20 sorority chapters
   - Verify Greek letters render correctly
   - Test GreekRank URLs

3. **Marketing:**
   - Announce sorority data to existing customers
   - Reach out to sorority recruitment companies
   - Update website to mention sorority coverage

4. **Later: Fraternity Import:**
   - Once sororities are validated, import fraternities
   - Will enrich existing fraternity data with Greek letters

---

## Ready to Run?

**Recommended Sequence:**
1. ✅ Run dry-run to see what would happen
2. ✅ Review the output carefully
3. ✅ Run actual import: `npm run import:sororities`
4. ✅ Wait 15-25 minutes for completion
5. ✅ Verify data in database
6. ✅ Update frontend to display Greek letters
7. ✅ Celebrate! 🎉

---

**Questions?** Review the output of the dry-run carefully. The script will show you exactly what it's doing at each step.

**Estimated Total Time:** 30 minutes start to finish
**Risk Level:** Low (won't touch existing fraternity data)
**Impact:** Very High (transforms platform scope)

# FraternityBase Data Population Guide

## Project Overview
FraternityBase is a B2B SaaS platform that provides detailed information about fraternity and sorority chapters at colleges across the United States. Companies pay credits to unlock chapter rosters, contact information, and full member details.

## Database: Supabase (PostgreSQL)

### Supabase Connection Details
- **URL**: Check `SUPABASE_URL` in `.env`
- **Anon Key**: Check `SUPABASE_ANON_KEY` in `.env`
- **Backend connects via**: `backend/src/server.ts`

---

## Core Database Tables

### 1. `companies` Table
**Purpose**: Customer accounts (B2B clients who purchase credits)

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  credits_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. `chapters` Table (NEEDS TO BE CREATED & POPULATED)
**Purpose**: Individual fraternity/sorority chapters at specific colleges

**Required Fields**:
```sql
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fraternity_name TEXT NOT NULL,           -- e.g., "Sigma Chi"
  chapter_name TEXT,                       -- e.g., "Alpha Beta Chapter"
  university TEXT NOT NULL,                -- e.g., "Penn State"
  state TEXT NOT NULL,                     -- e.g., "PA"
  city TEXT,                               -- e.g., "State College"
  founded_year INTEGER,                    -- e.g., 1912
  total_members INTEGER,                   -- Current member count
  house_address TEXT,                      -- Physical chapter house location
  website_url TEXT,                        -- Chapter website
  instagram_handle TEXT,                   -- Social media
  status TEXT DEFAULT 'active',            -- 'active', 'inactive', 'suspended'
  grade TEXT,                              -- e.g., "A+", "B", "C" (chapter quality rating)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes Needed**:
```sql
CREATE INDEX idx_chapters_university ON chapters(university);
CREATE INDEX idx_chapters_fraternity ON chapters(fraternity_name);
CREATE INDEX idx_chapters_state ON chapters(state);
```

### 3. `chapter_members` Table (NEEDS TO BE CREATED)
**Purpose**: Individual members within each chapter

```sql
CREATE TABLE chapter_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  graduation_year INTEGER,
  major TEXT,
  position TEXT,                           -- e.g., "President", "Treasurer", "Member"
  linkedin_url TEXT,
  instagram_handle TEXT,
  member_since INTEGER,                    -- Year joined
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexes Needed**:
```sql
CREATE INDEX idx_members_chapter ON chapter_members(chapter_id);
CREATE INDEX idx_members_name ON chapter_members(last_name, first_name);
```

### 4. `credit_transactions` Table (ALREADY EXISTS)
**Purpose**: Track all credit purchases and usage

```sql
-- Already created, used for tracking:
-- - Credit purchases (transaction_type = 'purchase')
-- - Credit usage (transaction_type = 'usage')
-- - Admin adjustments (transaction_type = 'adjustment')
```

### 5. `chapter_unlocks` Table (ALREADY EXISTS)
**Purpose**: Track which companies have unlocked which chapters

```sql
-- Already created, tracks:
-- - company_id: Which company unlocked
-- - chapter_id: Which chapter was unlocked
-- - unlock_type: 'roster', 'contacts', 'full_access'
-- - credits_spent: How many credits it cost
```

---

## Data You Need to Populate

### Priority 1: Colleges/Universities
**You need a list of colleges with Greek life**

Example data format (CSV or JSON):
```json
{
  "name": "Penn State",
  "state": "PA",
  "city": "State College",
  "total_fraternities": 45,
  "total_sororities": 28,
  "total_greek_members": 8500,
  "latitude": 40.7982,
  "longitude": -77.8599
}
```

**Colleges currently mapped in your app** (from `statesGeoData.ts`):
- Check `frontend/src/data/statesGeoData.ts` for the list of colleges already in COLLEGE_LOCATIONS

### Priority 2: Fraternities/Sororities
**List of national/international organizations**

Example data:
```json
{
  "name": "Sigma Chi",
  "type": "fraternity",
  "founded_year": 1855,
  "national_website": "https://sigmachi.org",
  "total_chapters": 244,
  "colors": ["Blue", "Gold"],
  "symbols": "White Cross"
}
```

**Common Fraternities** (you likely need):
- Sigma Chi, Pi Kappa Alpha, Sigma Alpha Epsilon
- Kappa Sigma, Delta Tau Delta, Phi Delta Theta
- Lambda Chi Alpha, Sigma Nu, Tau Kappa Epsilon
- Alpha Tau Omega, Phi Kappa Psi, Beta Theta Pi
- Sigma Phi Epsilon, Phi Gamma Delta, Kappa Alpha Order
- Theta Chi, Delta Chi, Psi Upsilon
- Zeta Beta Tau, Sigma Pi, Delta Upsilon

**Common Sororities**:
- Alpha Chi Omega, Alpha Delta Pi, Alpha Phi
- Chi Omega, Delta Delta Delta, Gamma Phi Beta
- Kappa Alpha Theta, Kappa Delta, Kappa Kappa Gamma
- Pi Beta Phi, Zeta Tau Alpha, Alpha Omicron Pi
- Alpha Gamma Delta, Alpha Sigma Alpha, Delta Gamma

### Priority 3: Chapters
**Individual chapters at each college**

Example CSV format:
```csv
fraternity_name,chapter_name,university,state,city,founded_year,total_members,house_address,website_url,grade
Sigma Chi,Alpha Zeta,Penn State,PA,State College,1912,85,420 E Prospect Ave,https://sigmachi.psu.edu,A+
Pi Kappa Alpha,Beta Delta,Penn State,PA,State College,1904,75,116 S Atherton St,https://pikes.psu.edu,A
Alpha Tau Omega,Gamma Omicron,Ohio State,OH,Columbus,1896,92,1975 Waldeck Ave,https://ato-osu.org,B+
```

### Priority 4: Chapter Members (Most Valuable Data)
**Individual member information**

Example CSV format:
```csv
chapter_id,first_name,last_name,email,phone,graduation_year,major,position
uuid-here,John,Smith,jsmith@psu.edu,555-0100,2025,Finance,President
uuid-here,Mike,Johnson,mjohnson@psu.edu,555-0101,2026,Marketing,VP Finance
uuid-here,Tom,Williams,twilliams@psu.edu,555-0102,2025,Engineering,Member
```

---

## Credit System & Unlock Costs

**Current Pricing** (from `server.ts`):
```javascript
const UNLOCK_COSTS = {
  roster: 25,        // Basic member list (names only)
  contacts: 50,      // Contact info (email, phone)
  full_access: 100   // Everything (full profiles, LinkedIn, etc.)
};
```

**Credit Packages**:
- Trial: 10 credits for $0.99
- Starter: 100 credits for $59
- Popular: 500 credits for $275
- Professional: 1000 credits for $500
- Enterprise: 5000 credits for $2000

---

## Data Sources You Can Use

1. **University Greek Life Directories**
   - Most universities publish lists of recognized chapters
   - Example: psu.edu/studentaffairs/greeklife/chapters

2. **National Fraternity/Sorority Websites**
   - Most have "Find a Chapter" or chapter locator tools
   - Example: sigmachi.org/chapters

3. **Public Social Media**
   - Instagram, Facebook chapter pages
   - LinkedIn university alumni groups

4. **Greek Life Aggregators**
   - Greekrank.com (has rankings and some data)
   - GreekLifeEdu platforms

5. **University Student Directories**
   - Many schools have public student org directories
   - May require scraping or manual entry

---

## Sample Data Population Queries

### Insert a College (if you create a colleges table):
```sql
INSERT INTO colleges (name, state, city, total_fraternities, total_sororities, latitude, longitude)
VALUES ('Penn State', 'PA', 'State College', 45, 28, 40.7982, -77.8599);
```

### Insert a Chapter:
```sql
INSERT INTO chapters (fraternity_name, chapter_name, university, state, city, founded_year, total_members, house_address, grade)
VALUES ('Sigma Chi', 'Alpha Zeta', 'Penn State', 'PA', 'State College', 1912, 85, '420 E Prospect Ave', 'A+');
```

### Insert Members:
```sql
INSERT INTO chapter_members (chapter_id, first_name, last_name, email, graduation_year, major, position)
VALUES 
  ('chapter-uuid-here', 'John', 'Smith', 'jsmith@psu.edu', 2025, 'Finance', 'President'),
  ('chapter-uuid-here', 'Mike', 'Johnson', 'mjohnson@psu.edu', 2026, 'Marketing', 'Member');
```

---

## Data Quality Standards

### For Chapters:
- ✅ Must have: fraternity_name, university, state
- ✅ Good to have: total_members, grade, website_url
- ✅ Premium data: house_address, social media handles
- ⚠️ Verify chapter is currently active

### For Members:
- ✅ Must have: first_name, last_name, chapter_id
- ✅ Good to have: email OR phone (at least one contact method)
- ✅ Premium data: LinkedIn, graduation_year, major, position
- ⚠️ Ensure data is current (graduated members should be marked inactive)

### Data Privacy & Compliance:
- Only collect publicly available information
- Respect privacy settings on social media
- Don't include SSN, private addresses, or sensitive data
- Mark data source and collection date
- Allow opt-out mechanisms

---

## College Logo Files

**You already have 418 college logos** in:
```
/frontend/public/college-logos/
```

**Conferences covered**:
- ACC, Big 10, Big 12, SEC, PAC-12, Big East, Ivy League
- Plus 17 other conferences (A10, MAC, etc.)

**Logo mapping**: `frontend/src/utils/collegeLogos.ts`

---

## API Endpoints You'll Use

### Get Chapter Info:
```
GET /api/chapters/:id
```

### Unlock Chapter Data:
```
POST /api/chapters/:id/unlock
Body: { unlockType: 'roster' | 'contacts' | 'full_access' }
```

### Check Unlock Status:
```
GET /api/chapters/:id/unlock-status
```

---

## Next Steps for Data Population

1. **Create the `chapters` and `chapter_members` tables** in Supabase
2. **Start with top 10-20 universities** (biggest Greek systems)
3. **Add 5-10 chapters per university** (most popular/largest)
4. **Add 20-50 members per chapter** (focus on leadership first)
5. **Test unlock flow** with real data
6. **Scale up** to more universities and chapters
7. **Keep updating** with current semester data

---

## Tools You Can Use

- **Supabase Studio**: Web UI for manual data entry
- **CSV Import**: Bulk import via Supabase or pgAdmin
- **API Scripts**: Node.js scripts to populate via API
- **Web Scraping**: Python/Node.js scrapers (respect robots.txt)
- **Manual Entry**: Start small with high-quality data

---

## Questions to Answer

1. Which universities should we prioritize first?
2. Which fraternities/sororities are most important?
3. What level of member detail do you want? (just names vs full profiles)
4. Do you have any existing data sources or partnerships?
5. Budget for data acquisition? (manual vs automated)

---

## Contact

For questions about the data structure or population:
- Check `backend/src/server.ts` for API logic
- Check `frontend/src/` for UI requirements
- Database schema is in Supabase dashboard

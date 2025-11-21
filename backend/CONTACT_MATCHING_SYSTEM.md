# Contact Matching System for Outreach Portal

## Overview
System to match imported chapter data with existing database contacts, enabling admins to identify who to contact for outreach campaigns.

## Database Schema Analysis

### Contact Sources (Priority Order)

#### 1. **chapter_officers** (PRIMARY SOURCE)
- **Purpose**: Roster data for chapter leadership
- **Contact Fields**:
  - `name` (full name)
  - `first_name`, `last_name` (newer entries)
  - `email` ✅
  - `phone` ✅
  - `linkedin_profile`
  - `position` (President, Rush Chair, Social Chair, etc.)
  - `is_primary_contact` (boolean flag)
  - `is_ambassador` (boolean flag)
- **Relationship**: `chapter_id` → chapters table
- **Data Quality**: Most chapters with officers have 1-146 officers
- **Notes**: Some chapters have hundreds of members imported as "Member" position

#### 2. **chapters** (CHAPTER-LEVEL)
- **Contact Fields**:
  - `contact_email` ✅ (rarely populated)
  - `phone` (rarely populated)
  - `instagram_handle`
  - `facebook_page`
  - `twitter_handle`
- **Relationship**: Direct chapter data
- **Data Quality**: Most chapters have NO direct contact info

#### 3. **fraternity_users** (SIGNUP DATA)
- **Purpose**: Users who signed up for the platform
- **Contact Fields**:
  - `first_name`, `last_name`
  - `email` ✅
  - `college` (free text, NOT linked to universities table)
  - `fraternity_or_sorority` (free text, NOT linked to greek_organizations)
  - `position`
  - `instagram`
  - `approval_status` (pending/approved/rejected)
- **Relationship**: NOT directly linked to chapters (needs matching)
- **Data Quality**: Clean signup data, but requires fuzzy matching to chapters

#### 4. **ambassador_profiles** (AMBASSADORS)
- **Contact Fields**:
  - `first_name`, `last_name`
  - `email` ✅
  - `phone` ✅
  - `linkedin_profile`
  - `position`
  - `ambassador_status`
- **Relationship**: `chapter_id` → chapters table
- **Data Quality**: Small subset of chapters

#### 5. **chapter_members** (GENERAL MEMBERS)
- **Contact Fields**:
  - `name`
  - `email` ✅
  - `phone` ✅
  - `linkedin_url`
  - `position`
  - `is_primary_contact`
- **Relationship**: `chapter_id` → chapters table
- **Data Quality**: Less populated than chapter_officers

## Chapter Identification Strategy

To match imported data to existing chapters, use these fields:

```sql
-- Match by Greek Org + University
SELECT c.*
FROM chapters c
JOIN greek_organizations go ON c.greek_organization_id = go.id
JOIN universities u ON c.university_id = u.id
WHERE go.name ILIKE '%{greek_org_name}%'
  AND u.name ILIKE '%{university_name}%'
```

### Matching Algorithm Priority:
1. **Exact Match**: `greek_org.name` + `university.name` + `chapter_name`
2. **Fuzzy Match**: `greek_org.name` (with nicknames) + `university.name` (with aliases)
3. **Instagram Match**: If imported data has Instagram handle, match to `chapters.instagram_handle`

## Contact Priority System

When returning contacts for a matched chapter:

### Priority 1: Primary Contact
```sql
SELECT * FROM chapter_officers
WHERE chapter_id = ? AND is_primary_contact = true
LIMIT 1
```

### Priority 2: Leadership Positions
```sql
SELECT * FROM chapter_officers
WHERE chapter_id = ?
  AND position IN ('President', 'Vice President', 'Social Chair', 'Rush Chair')
ORDER BY
  CASE position
    WHEN 'President' THEN 1
    WHEN 'Vice President' THEN 2
    WHEN 'Social Chair' THEN 3
    WHEN 'Rush Chair' THEN 4
  END
LIMIT 5
```

### Priority 3: Ambassadors
```sql
SELECT * FROM chapter_officers
WHERE chapter_id = ? AND is_ambassador = true
LIMIT 5
```

### Priority 4: All Officers with Contact Info
```sql
SELECT * FROM chapter_officers
WHERE chapter_id = ?
  AND (email IS NOT NULL OR phone IS NOT NULL)
ORDER BY created_at DESC
LIMIT 10
```

### Priority 5: Fraternity Signups (Fuzzy Match)
```sql
SELECT * FROM fraternity_users
WHERE fraternity_or_sorority ILIKE '%{greek_org}%'
  AND college ILIKE '%{university}%'
  AND approval_status = 'approved'
ORDER BY created_at DESC
```

## API Endpoint Design

### POST `/api/admin/outreach/match-contacts`

**Request Body:**
```json
{
  "chapters": [
    {
      "greek_organization": "Sigma Chi",
      "university": "Penn State University",
      "chapter_name": "Alpha Chi",
      "instagram_handle": "@sigmachi_psu" // optional
    }
  ]
}
```

**Response:**
```json
{
  "matches": [
    {
      "input": {
        "greek_organization": "Sigma Chi",
        "university": "Penn State University",
        "chapter_name": "Alpha Chi"
      },
      "matched_chapter": {
        "id": "01394a98-22e2-4729-94b4-ca432e005608",
        "chapter_name": "Alpha Chi",
        "greek_organization": "Sigma Chi",
        "university": "Pennsylvania State University",
        "state": "Pennsylvania",
        "instagram_handle": null,
        "status": "active",
        "match_confidence": "high", // high/medium/low
        "match_method": "exact" // exact/fuzzy/instagram
      },
      "contacts": {
        "primary": {
          "source": "chapter_officers",
          "name": "John Smith",
          "position": "President",
          "email": "president@sigmachipsu.com",
          "phone": "(555) 123-4567",
          "linkedin": "linkedin.com/in/johnsmith",
          "is_primary_contact": true
        },
        "leadership": [
          {
            "source": "chapter_officers",
            "name": "Jane Doe",
            "position": "Vice President",
            "email": "vp@sigmachipsu.com",
            "phone": null
          }
        ],
        "ambassadors": [],
        "all_officers_count": 146,
        "chapter_level": {
          "email": null,
          "phone": null,
          "instagram": null
        }
      },
      "override_instructions": {
        "update_contact_url": "/api/admin/chapters/{chapter_id}/contacts",
        "add_officer_url": "/api/admin/chapters/{chapter_id}/officers"
      }
    }
  ],
  "unmatched": []
}
```

## Contact Override System

### Update Chapter-Level Contact
```
PATCH /api/admin/chapters/{chapter_id}
{
  "contact_email": "new@email.com",
  "phone": "555-1234"
}
```

### Update Officer Contact
```
PATCH /api/admin/chapter-officers/{officer_id}
{
  "email": "new@email.com",
  "phone": "555-1234",
  "is_primary_contact": true
}
```

### Add New Officer
```
POST /api/admin/chapters/{chapter_id}/officers
{
  "name": "John Smith",
  "position": "President",
  "email": "president@chapter.com",
  "phone": "555-1234",
  "is_primary_contact": true
}
```

## Greek Organization Name Aliases

Common fraternity nicknames to handle fuzzy matching:
- Sigma Chi → "Sig Chi", "Sigs"
- Alpha Tau Omega → "ATO"
- Sigma Alpha Epsilon → "SAE"
- Pi Kappa Alpha → "Pike", "PIKE"
- Beta Theta Pi → "Beta"
- Kappa Sigma → "Kappa Sig"

Store in `greek_organizations.common_nicknames` JSONB field or create mapping table.

## Implementation Notes

1. **Fuzzy Matching**: Use PostgreSQL `ILIKE` with `%pattern%` for university/greek org matching
2. **Confidence Scoring**:
   - HIGH: Exact match on all fields
   - MEDIUM: Fuzzy match on greek org + exact on university
   - LOW: Fuzzy match on both, or Instagram-only match
3. **Caching**: Cache matched results for performance
4. **Validation**: Warn if imported chapter has no contacts found
5. **Batch Processing**: Support bulk matching for large outreach campaigns

## Future Enhancements

1. **Machine Learning**: Train model on past successful matches
2. **Contact Verification**: Email verification system
3. **Contact History**: Track when/how each contact was reached
4. **Response Tracking**: Log email opens, responses, conversions
5. **Auto-Update**: Sync with LinkedIn/Instagram APIs for fresh contact data

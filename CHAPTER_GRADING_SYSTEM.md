# Chapter Grading & Classification System

## Overview
FraternityBase uses a 0-5.0 grading system to classify chapter quality and determine available features/pricing.

---

## Grade Definitions

### 5.0 - Premium/Five-Star Chapters
- **Criteria**: Comprehensive data (65+ members, full contact info, social media)
- **Unlock Cost**: 40 credits ($11.99)
- **Features**: Full roster access, officer contacts, social media links
- **Database Field**: `five_star_rating = true` OR `grade >= 5.0`

### 4.5 - Introducable Chapters ⭐️
- **Criteria**: High-quality data with verified contacts
- **Special Classification**: These chapters are eligible for **warm introductions**
- **Unlock Cost**: 25 credits ($7.49)
- **Features**:
  - Full chapter data
  - **Warm Introduction Available** ($59.99)
  - Direct connection through existing partnership network
- **Business Logic**:
  - FraternityBase has access to these chapters through strategic partnerships
  - Can provide personalized introductions to brands
  - Higher success rate for brand partnerships
- **Database Field**: `grade >= 4.5`

**Note**: The partnership network (including College Casino Tour relationship) enables these introductions. This capability is a competitive advantage and should remain confidential.

### 4.0-4.4 - High Quality Chapters
- **Criteria**: Good data with some contact information
- **Unlock Cost**: 25 credits ($7.49)
- **Features**: Chapter info, some officer contacts, social links

### 3.5-3.9 - Standard Chapters
- **Criteria**: Basic complete data with social media presence
- **Unlock Cost**: 20 credits ($5.99)
- **Features**: Basic chapter information, social media links

### Below 3.5 - Basic Chapters
- **Criteria**: Limited data available
- **Unlock Cost**: 20 credits ($5.99)
- **Features**: Minimal chapter information

---

## Unlock Types & Features

### Full Unlock
- **Description**: Complete access to all available chapter data
- **Includes**:
  - Chapter information
  - Officer roster (if available)
  - Member roster (if available)
  - Contact information
  - Social media links
  - House/venue information

### Warm Introduction (Grade 4.5+ Only)
- **Cost**: $59.99
- **Description**: Personal introduction to chapter leadership
- **Delivery**: 24-48 hours
- **Method**: Through existing partnership network
- **Success Rate**: High (due to trusted referral)
- **Business Value**:
  - Bypasses cold outreach
  - Pre-vetted brand/chapter fit
  - Higher conversion to partnerships

---

## Pricing Tiers

| Grade | Classification | Credits | Dollar Value |
|-------|----------------|---------|--------------|
| 5.0   | Premium        | 40      | $11.99       |
| 4.5   | Introducable   | 25      | $7.49        |
| 4.0-4.4 | High Quality | 25      | $7.49        |
| 3.5-3.9 | Standard     | 20      | $5.99        |
| <3.5  | Basic          | 20      | $5.99        |

---

## Implementation Notes

### Backend Logic (server.ts)
```javascript
// Check grade for pricing
const grade = chapterData.grade || 0;
const is5Star = grade >= 5.0;
const isIntroducable = grade >= 4.5;

let credits = 20; // Default
let dollarValue = 5.99;

if (grade >= 5.0) {
  credits = 40;
  dollarValue = 11.99;
} else if (grade >= 4.0) {
  credits = 25;
  dollarValue = 7.49;
} else if (grade >= 3.5) {
  credits = 20;
  dollarValue = 5.99;
}
```

### Frontend Display
- Show "Request Introduction" button for chapters with `grade >= 4.5`
- Display grade badge/indicator on chapter cards
- Highlight introducable chapters with special styling

---

## Database Schema

### chapters table
```sql
grade NUMERIC CHECK (grade >= 0 AND grade <= 5.0)
  COMMENT 'Chapter quality grade (0-5.0):
           5.0 = full roster,
           4.5 = introducable (warm intro available),
           4.0 = some contacts,
           3.5 = social links only,
           <3.5 = basic info'
```

---

## Business Strategy

### Why 4.5 is the "Introducable" Threshold
1. **Data Quality**: Sufficient verified information to make meaningful introductions
2. **Relationship Access**: These chapters are within our partnership network
3. **Success Rate**: Higher conversion due to warm referral vs cold outreach
4. **Premium Service**: Justifies $59.99 introduction fee
5. **Competitive Moat**: Partnership network is difficult to replicate

### Partnership Network (Confidential)
- Strategic relationships with key organizations enable warm introductions
- Existing brand partnerships provide credibility and access
- Network effect: successful introductions strengthen relationships
- This capability differentiates FraternityBase from data-only competitors

---

## Future Considerations

### Potential Expansions
- **Ambassador Program**: Connect 4.5+ chapters with brand ambassadors
- **Tiered Introductions**:
  - Email intro ($59.99)
  - Video call intro ($99.99)
  - In-person meeting ($299.99)
- **Bulk Introduction Packages**: Discounts for multiple chapters
- **Success Guarantees**: Refund if introduction doesn't lead to meeting

### Grade Evolution
- Regularly update grades as new data becomes available
- Consider adding half-grades (4.5, 4.0, 3.5) for more granularity
- Track introduction success rates by grade to refine thresholds

---

**Last Updated**: October 8, 2025
**Maintained By**: FraternityBase Team

# Enhanced Fraternity Sign-Up Form - Implementation Guide

## Overview

I've created a **comprehensive, robust 6-step sign-up form** for fraternities looking to get sponsors. This enhanced form collects detailed information that helps fraternities:
- Attract premium sponsors with complete profiles
- Showcase their metrics, achievements, and capabilities
- Get matched with the right partnership opportunities
- Receive fair compensation based on their actual reach and engagement

---

## What's New

### Old Form (3 Steps - Basic)
- ✅ Personal info (name, email, password)
- ✅ Minimal chapter info (Instagram handle, payment method)
- ✅ Optional event info

**Problems:**
- Too basic - doesn't showcase chapter value
- No social media metrics (just a handle)
- No achievement/credential tracking
- No deliverables specified
- No photo uploads
- Limited payment options

### New Enhanced Form (6 Steps - Comprehensive)

#### **Step 1: Personal & Chapter Basic Info**
- Full name, email, password
- Phone number (optional)
- University/College
- Fraternity/Sorority name
- Position in chapter
- Chapter size (member count)

#### **Step 2: Social Media & Audience Metrics** ⭐ NEW
- Instagram handle (required)
- Instagram followers count
- Instagram engagement rate (%)
- Average post reach
- Average story views
- TikTok handle + followers
- Facebook page
- Website URL
- Active member count (emphasizes reach)

**Why This Matters:** Sponsors need ROI data. Follower counts, engagement rates, and reach metrics help them calculate the value of the partnership.

#### **Step 3: Chapter Achievements & Credentials** ⭐ NEW
- Chapter description (tell your story)
- Chapter GPA
- National ranking
- Campus ranking
- Years established on campus
- Primary philanthropy name
- Amount raised (this year)
- Volunteer hours (this year)

**Why This Matters:** Sponsors want to partner with high-quality, reputable chapters. Achievements build credibility and trust.

#### **Step 4: Sponsorship Preferences** ⭐ NEW
- Partnership types interested in (multi-select):
  - Event Sponsorship
  - Social Media Promotion
  - Brand Ambassadorship
  - Product Placement
  - Merchandise Collaboration
  - Bar/Restaurant Partnership
  - Campus Activation
  - Fundraising Event
  - Performance Marketing
  - Semester-Long Partnership
  - Annual Partnership

- Deliverables you can offer (multi-select):
  - Instagram Posts
  - Instagram Stories
  - TikTok Videos
  - Event Banner Placement
  - Product Distribution
  - Event Booth/Table
  - Email Blast to Members
  - Logo on T-Shirts/Merchandise
  - Flyers/Posters in Chapter House
  - Website Feature
  - Exclusive Event Activation

- Budget range (min/max)
- Sponsorship goal (description)
- Target audience description

**Why This Matters:** Clear deliverables and partnership preferences ensure better matches between chapters and sponsors. No more misaligned expectations.

#### **Step 5: Photos & Media** ⭐ NEW
- Cover photo (required)
- Chapter photos (3-10 recommended)
- Event photos
- Past partnership photos

**Why This Matters:** Visual content is CRITICAL. Sponsors want to see your chapter house, events, and past activations. High-quality photos = higher-quality sponsorship offers.

#### **Step 6: Payment & Verification**
- Preferred payment method (Bank/Venmo/Zelle/PayPal/Check)
- Payment recipient name
- Payment contact email
- Method-specific details (Venmo handle, bank account, etc.)
- Official chapter email (verification)
- Terms & conditions acceptance
- Authorization for verification

**Why This Matters:** Streamlined payment setup means faster payouts. Verification builds trust with sponsors.

---

## Key Features

### ✅ Professional UI/UX
- Beautiful gradient design (purple to pink)
- Step-by-step progress bar with visual indicators
- Icons for each section
- Inline validation with helpful error messages
- Informational tips throughout the form
- Mobile-responsive design

### ✅ Smart Validation
- Step 1: All personal/chapter info required
- Step 2: Instagram handle + member count required (most important metrics)
- Step 4: At least one partnership type and deliverable required
- Step 6: Terms acceptance required

### ✅ File Upload Support
- Cover photo upload
- Multiple photo uploads for chapter/event photos
- Photo preview and removal
- File type validation (images only)

### ✅ Enhanced Data Collection
- 50+ data points collected (vs. 12 in old form)
- Quantitative metrics (followers, GPA, budget ranges)
- Qualitative descriptions (goals, audience, chapter story)
- Visual assets (photos)

---

## File Location

**New Enhanced Form:**
```
/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/FraternitySignUpPageEnhanced.tsx
```

**Old Basic Form (still exists):**
```
/Users/jacksonfitzgerald/CollegeOrgNetwork/frontend/src/pages/FraternitySignUpPage.tsx
```

---

## Integration Steps

### Option 1: Replace Old Form (Recommended)

1. **Update App.tsx routing:**
```tsx
// OLD:
<Route path="/signup/fraternity" element={<FraternitySignUpPage />} />

// NEW:
<Route path="/signup/fraternity" element={<FraternitySignUpPageEnhanced />} />
```

2. **Update GetSponsoredPage.tsx button links** (if needed):
   - Already points to `/signup/fraternity`, so no changes needed

3. **Backup old form** (just in case):
```bash
cp FraternitySignUpPage.tsx FraternitySignUpPage.backup.tsx
```

### Option 2: Keep Both Forms (A/B Testing)

```tsx
// Add new route
<Route path="/signup/fraternity/enhanced" element={<FraternitySignUpPageEnhanced />} />
<Route path="/signup/fraternity" element={<FraternitySignUpPage />} />

// Test with 50% of traffic to enhanced version
```

---

## Backend API Requirements

### New Endpoint Needed

**Endpoint:** `POST /api/fraternity/signup/enhanced`

**Content-Type:** `multipart/form-data` (for file uploads)

### Request Payload

#### Text Fields (FormData):
```javascript
{
  // Step 1
  firstName: string
  lastName: string
  email: string
  password: string
  college: string
  fraternityOrSorority: string
  position: string
  phoneNumber?: string
  chapterSize?: number

  // Step 2
  instagramHandle: string
  instagramFollowers?: number
  instagramEngagementRate?: number
  tiktokHandle?: string
  tiktokFollowers?: number
  facebookPage?: string
  linkedinPage?: string
  websiteUrl?: string
  averagePostReach?: number
  averageStoryViews?: number
  memberCount: number

  // Step 3
  chapterGPA?: number
  nationalRanking?: string
  campusRanking?: string
  philanthropyName?: string
  philanthropyAmountRaised?: number
  philanthropyHoursVolunteered?: number
  yearsEstablished?: number
  chapterDescription?: string

  // Step 4
  interestedPartnershipTypes: string[] (JSON stringified)
  minSponsorshipBudget?: number
  maxSponsorshipBudget?: number
  deliverables: string[] (JSON stringified)
  sponsorshipGoal?: string
  targetAudience?: string

  // Step 6
  preferredPaymentMethod?: string
  paymentRecipientName?: string
  paymentEmail?: string
  venmoHandle?: string
  zelleEmail?: string
  bankAccountHolder?: string
  bankAccountNumber?: string (encrypt!)
  bankRoutingNumber?: string (encrypt!)
  taxId?: string
  officialEmail?: string
  agreeToTerms: boolean
  agreeToBackgroundCheck: boolean
}
```

#### File Fields:
```javascript
{
  coverPhoto: File (single)
  chapterPhotos: File[] (multiple)
  eventPhotos: File[] (multiple)
  pastPartnershipPhotos: File[] (multiple)
  verificationDocuments: File[] (multiple)
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Your comprehensive profile has been submitted for review!",
  "userId": "uuid",
  "chapterId": "uuid"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Detailed error message here"
}
```

---

## Backend Implementation Guide

### 1. Create New Route

**File:** `/backend/src/routes/fraternity.ts` (or create new file)

```typescript
import express from 'express';
import multer from 'multer';
import { supabase, supabaseAdmin } from '../supabaseClient';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

router.post('/signup/enhanced', upload.fields([
  { name: 'coverPhoto', maxCount: 1 },
  { name: 'chapterPhotos', maxCount: 10 },
  { name: 'eventPhotos', maxCount: 10 },
  { name: 'pastPartnershipPhotos', maxCount: 5 },
  { name: 'verificationDocuments', maxCount: 3 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const data = req.body;

    // 1. Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 2. Create user account
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: data.email,
        password: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'fraternity',
        phone_number: data.phoneNumber,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) throw userError;

    // 3. Upload cover photo to Supabase Storage
    let coverPhotoUrl = null;
    if (files.coverPhoto && files.coverPhoto[0]) {
      const file = files.coverPhoto[0];
      const fileName = `${userData.id}/cover-${Date.now()}.${file.mimetype.split('/')[1]}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('chapter-photos')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from('chapter-photos')
          .getPublicUrl(fileName);
        coverPhotoUrl = urlData.publicUrl;
      }
    }

    // 4. Create/update chapter profile
    const { data: chapterData, error: chapterError } = await supabaseAdmin
      .from('chapters')
      .upsert({
        user_id: userData.id,
        greek_org_name: data.fraternityOrSorority,
        university_name: data.college,
        chapter_size: parseInt(data.chapterSize) || null,

        // Social Media
        instagram_handle: data.instagramHandle,
        instagram_followers: parseInt(data.instagramFollowers) || null,
        instagram_engagement_rate: parseFloat(data.instagramEngagementRate) || null,
        tiktok_handle: data.tiktokHandle || null,
        tiktok_followers: parseInt(data.tiktokFollowers) || null,
        facebook_page: data.facebookPage || null,
        website_url: data.websiteUrl || null,
        average_post_reach: parseInt(data.averagePostReach) || null,
        average_story_views: parseInt(data.averageStoryViews) || null,
        member_count: parseInt(data.memberCount) || null,

        // Achievements
        chapter_gpa: parseFloat(data.chapterGPA) || null,
        national_ranking: data.nationalRanking || null,
        campus_ranking: data.campusRanking || null,
        years_established: parseInt(data.yearsEstablished) || null,
        chapter_description: data.chapterDescription || null,

        // Philanthropy
        philanthropy_name: data.philanthropyName || null,
        philanthropy_amount_raised: parseInt(data.philanthropyAmountRaised) || null,
        philanthropy_hours_volunteered: parseInt(data.philanthropyHoursVolunteered) || null,

        // Sponsorship Preferences
        interested_partnership_types: JSON.parse(data.interestedPartnershipTypes || '[]'),
        deliverables: JSON.parse(data.deliverables || '[]'),
        min_sponsorship_budget: parseInt(data.minSponsorshipBudget) || null,
        max_sponsorship_budget: parseInt(data.maxSponsorshipBudget) || null,
        sponsorship_goal: data.sponsorshipGoal || null,
        target_audience: data.targetAudience || null,

        // Payment
        preferred_payment_method: data.preferredPaymentMethod || null,
        payment_recipient_name: data.paymentRecipientName || null,
        payment_email: data.paymentEmail || null,
        venmo_handle: data.venmoHandle || null,
        zelle_email: data.zelleEmail || null,

        // Verification
        official_email: data.officialEmail || null,

        // Metadata
        cover_photo_url: coverPhotoUrl,
        profile_complete_percentage: 85,
        status: 'pending_approval',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (chapterError) throw chapterError;

    // 5. Upload additional photos
    const photoFields = ['chapterPhotos', 'eventPhotos', 'pastPartnershipPhotos'];
    for (const fieldName of photoFields) {
      if (files[fieldName] && files[fieldName].length > 0) {
        for (const file of files[fieldName]) {
          const fileName = `${userData.id}/${fieldName}/${Date.now()}-${file.originalname}`;
          await supabaseAdmin.storage
            .from('chapter-photos')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype
            });
        }
      }
    }

    // 6. Send confirmation email
    // TODO: Implement email notification

    res.json({
      success: true,
      message: 'Your comprehensive profile has been submitted for review!',
      userId: userData.id,
      chapterId: chapterData.id
    });

  } catch (error) {
    console.error('Enhanced signup error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create account'
    });
  }
});

export default router;
```

### 2. Update Database Schema

Add new columns to `chapters` table:

```sql
-- Social Media Metrics
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS instagram_followers INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS instagram_engagement_rate DECIMAL(5,2);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tiktok_handle TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS tiktok_followers INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS facebook_page TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS average_post_reach INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS average_story_views INTEGER;

-- Achievements
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS chapter_gpa DECIMAL(3,2);
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS national_ranking TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS campus_ranking TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS years_established INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS chapter_description TEXT;

-- Philanthropy
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_name TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_amount_raised INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS philanthropy_hours_volunteered INTEGER;

-- Sponsorship Preferences
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS interested_partnership_types TEXT[];
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS deliverables TEXT[];
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS min_sponsorship_budget INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS max_sponsorship_budget INTEGER;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS sponsorship_goal TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS target_audience TEXT;

-- Payment
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS payment_recipient_name TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS payment_email TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS venmo_handle TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS zelle_email TEXT;

-- Verification
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS official_email TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS profile_complete_percentage INTEGER DEFAULT 0;
```

### 3. Create Supabase Storage Bucket

```sql
-- Create storage bucket for chapter photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('chapter-photos', 'chapter-photos', true);

-- Set up storage policies
CREATE POLICY "Anyone can view chapter photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'chapter-photos');

CREATE POLICY "Authenticated users can upload chapter photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chapter-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own chapter photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chapter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chapter photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'chapter-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Testing Checklist

### Frontend Testing
- [ ] Step 1: Fill out all personal/chapter info, click Continue
- [ ] Step 2: Fill out Instagram handle + member count (required fields), click Continue
- [ ] Step 3: Fill out achievements (optional), click Continue
- [ ] Step 4: Select at least 1 partnership type and 1 deliverable, click Continue
- [ ] Step 5: Upload cover photo and a few chapter photos, click Continue
- [ ] Step 6: Select payment method, agree to terms, submit

### Backend Testing
- [ ] API endpoint receives all form data
- [ ] User account created in `users` table
- [ ] Chapter profile created in `chapters` table with all new fields
- [ ] Cover photo uploaded to Supabase Storage
- [ ] Additional photos uploaded successfully
- [ ] Response returns success with user/chapter IDs

### Integration Testing
- [ ] Form submits successfully end-to-end
- [ ] User redirected to pending approval page
- [ ] Admin can see new chapter profile with all details
- [ ] Photos display correctly in admin panel

---

## Benefits of Enhanced Form

### For Fraternities:
✅ **Higher-quality sponsorship offers** - Detailed profiles attract serious sponsors
✅ **Better matches** - Clear deliverables prevent misaligned partnerships
✅ **Fair compensation** - Metrics justify higher payouts
✅ **Professional presentation** - Beautiful UI impresses sponsors
✅ **Faster approvals** - Complete profiles require less back-and-forth

### For Sponsors:
✅ **Better ROI data** - Can calculate expected reach and engagement
✅ **Risk reduction** - Verified chapters with proven track records
✅ **Clear expectations** - Know exactly what deliverables they'll receive
✅ **Visual proof** - Photos show chapter house, events, past partnerships
✅ **Efficient matching** - Only see chapters that match their criteria

### For Platform:
✅ **Higher conversion** - Complete profiles = more successful partnerships
✅ **Premium positioning** - Professional form justifies platform fees
✅ **Data for matching** - Rich data enables smart sponsor recommendations
✅ **Reduced support** - Clear expectations = fewer disputes

---

## Next Steps

1. **Test the frontend form** - Walk through all 6 steps
2. **Implement backend API** - Follow the guide above
3. **Update database schema** - Add new columns to chapters table
4. **Create storage bucket** - For chapter photos
5. **Replace old form** - Update App.tsx routing
6. **Test end-to-end** - Submit form and verify data saves correctly
7. **Launch!** - Deploy to production

---

## Questions?

If you need help with:
- Backend API implementation
- Database migrations
- File upload handling
- Validation logic
- Admin approval workflow

Let me know and I can provide more detailed guidance!

---

**Created:** November 4, 2025
**File:** `FraternitySignUpPageEnhanced.tsx`
**Status:** ✅ Frontend Complete - Backend Implementation Needed

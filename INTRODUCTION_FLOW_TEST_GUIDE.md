# Personal Introduction System - Test Guide

## Overview
This guide provides comprehensive test cases for the Fraternities Personal Introduction system, covering user request submission, admin management, and user tracking workflows.

---

## Prerequisites

### Test Accounts Required
1. **Regular User Account** (with credits)
   - Must be part of a company
   - Should have credits available (20+ for Platinum, 100+ for regular)
2. **Admin Account**
   - Admin credentials configured in backend
3. **Test Chapter**
   - Chapter that has warm introduction unlocked/unlockable

### Environment Setup
- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:5173`
- Database migration `add_admin_notes_to_warm_intro_requests.sql` applied

---

## Test Suite 1: User Request Submission

### Test Case 1.1: Navigate to Chapter Detail Page
**Steps:**
1. Log in as regular user
2. Navigate to `/app/chapters`
3. Click on any chapter card
4. Verify chapter detail page loads successfully

**Expected Results:**
- Chapter name, university, and details display correctly
- "Warm Introduction" section is visible
- Unlock button or request form is shown based on unlock status

---

### Test Case 1.2: Form Validation - Message Length (CRITICAL)
**Steps:**
1. On chapter detail page, ensure warm introduction is unlocked
2. Enter less than 50 characters in message field (e.g., "Hello")
3. Click submit

**Expected Results:**
- Alert appears: "Please provide a more detailed partnership proposal (at least 50 characters)"
- Form does NOT submit
- Credits are NOT deducted

**Test Data:**
```
Short message (49 chars): "This is a test message for the introduction."
Valid message (50+ chars): "This is a comprehensive partnership proposal message that exceeds fifty characters to meet validation requirements."
```

---

### Test Case 1.3: Character Counter Display
**Steps:**
1. Start typing in the message field
2. Observe the character counter below the text area

**Expected Results:**
- Counter displays: "X / 50 characters minimum"
- Counter updates in real-time as you type
- Counter turns green or shows positive feedback when ≥50 characters

---

### Test Case 1.4: Successful Request Submission - Platinum User
**Prerequisites:**
- User has Platinum subscription
- User has at least 20 credits

**Steps:**
1. Fill form with valid data:
   - Contact person name: "John Smith"
   - Contact email: "john@example.com"
   - Message: (Valid 50+ character message)
2. Click submit

**Expected Results:**
- Success modal appears with 4-step timeline:
  1. "We've received your request"
  2. "Our team will review within 24 hours"
  3. "We'll make the introduction via email"
  4. "You can track progress in 'Requested Introductions'"
- Success message mentions tracking link
- Admin preview section shows request details
- **20 credits deducted** from user balance
- Form resets after submission

---

### Test Case 1.5: Successful Request Submission - Regular User
**Prerequisites:**
- User does NOT have Platinum subscription
- User has at least 100 credits

**Steps:**
1. Fill form with valid data
2. Click submit

**Expected Results:**
- Same success flow as 1.4
- **100 credits deducted** from user balance

---

### Test Case 1.6: Insufficient Credits
**Steps:**
1. Set user credits to less than required amount:
   - Platinum: <20 credits
   - Regular: <100 credits
2. Attempt to submit request

**Expected Results:**
- Error message about insufficient credits
- Form does not submit
- User redirected or prompted to purchase credits

---

### Test Case 1.7: Database Validation
**Steps:**
1. After successful submission in Test Case 1.4/1.5
2. Query database:
```sql
SELECT * FROM warm_intro_requests
WHERE company_id = [user_company_id]
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Results:**
- New record exists with:
  - `status = 'pending'`
  - `chapter_id` matches selected chapter
  - `company_id` matches user's company
  - `contact_person` matches input
  - `contact_email` matches input
  - `message` matches input
  - `created_at` is recent timestamp
  - `admin_notes` is NULL
  - `completed_at` is NULL

---

## Test Suite 2: Admin Request Management

### Test Case 2.1: Access Admin Introduction Requests Tab
**Steps:**
1. Log in as admin
2. Navigate to `/admin`
3. Click "Introduction Requests" in left sidebar

**Expected Results:**
- Tab switches to introduction requests view
- Badge shows count of pending requests
- Request list loads with table/card view

---

### Test Case 2.2: View All Requests Across Companies
**Steps:**
1. Create test requests from multiple companies
2. View admin introduction requests tab

**Expected Results:**
- ALL requests visible regardless of company
- Each request shows:
  - Company name
  - Chapter name
  - University name
  - Contact person
  - Contact email
  - Message preview
  - Status badge
  - Created date
  - Requested by (user name)

---

### Test Case 2.3: Filter by Status
**Steps:**
1. Create requests with different statuses:
   - 2 pending
   - 1 in_progress
   - 1 completed
2. Use status filter dropdown

**Expected Results:**
- Filter options: "All", "Pending", "In Progress", "Completed", "Cancelled"
- Selecting "Pending" shows only pending requests
- Selecting "In Progress" shows only in_progress requests
- Count updates to match filtered results

---

### Test Case 2.4: Search Functionality
**Steps:**
1. Enter search term in search box (e.g., chapter name)
2. Observe filtered results

**Expected Results:**
- Results filter in real-time
- Search matches chapter name and university name
- Case-insensitive matching
- Shows "No requests found" when no matches

---

### Test Case 2.5: Update Status - Pending to In Progress
**Steps:**
1. Find a pending request
2. Click "Mark In Progress" button
3. Confirm action in confirmation dialog

**Expected Results:**
- Confirmation dialog: "Are you sure you want to change the status to 'in progress'?"
- After confirmation:
  - Status badge changes to "In Progress"
  - Status badge color changes (e.g., yellow/orange)
  - Request moves if filtered by status
  - Data refreshes automatically

---

### Test Case 2.6: Update Status - In Progress to Completed
**Steps:**
1. Find an in_progress request
2. Click "Mark Completed" button
3. Confirm action

**Expected Results:**
- Status changes to "Completed"
- Status badge turns green
- `completed_at` timestamp is set in database
- Request moves to completed filter if status filter active

---

### Test Case 2.7: Add Admin Notes
**Steps:**
1. Find any request
2. Click "Add Notes" or expand notes section
3. Enter notes: "Contacted chapter president on 1/15. Email introduction sent."
4. Save notes

**Expected Results:**
- Notes save successfully
- Notes display below request details
- Notes persist after page refresh
- Other admins can see the notes

---

### Test Case 2.8: View Request Details Modal
**Steps:**
1. Click "View Details" on any request
2. Review modal content

**Expected Results:**
- Modal shows:
  - Full message text (not truncated)
  - Company details
  - Chapter details
  - Contact information
  - Timestamps (created, completed)
  - Full admin notes history
  - Status change log (if implemented)

---

### Test Case 2.9: Backend API Validation
**Steps:**
1. Make direct API call to admin endpoint:
```bash
curl -X GET http://localhost:3001/credits/warm-intro/admin/all \
  -H "x-admin-token: YOUR_ADMIN_TOKEN"
```

**Expected Results:**
- Returns 200 status
- JSON response with `success: true`
- Array of requests with enriched data:
  - chapters.chapter_name
  - chapters.universities.name
  - chapters.greek_organizations.name
  - companies.company_name
  - requestedBy.first_name, last_name, email

---

### Test Case 2.10: Status Update API Validation
**Steps:**
1. Make PATCH request:
```bash
curl -X PATCH http://localhost:3001/credits/warm-intro/admin/[REQUEST_ID]/status \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed", "adminNotes": "Test completion"}'
```

**Expected Results:**
- Returns 200 status
- Response contains updated request object
- Database reflects changes
- Completed_at timestamp set if status is "completed"

---

### Test Case 2.11: Invalid Status Rejection
**Steps:**
1. Attempt to set invalid status:
```bash
curl -X PATCH http://localhost:3001/credits/warm-intro/admin/[REQUEST_ID]/status \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "invalid_status"}'
```

**Expected Results:**
- Returns 400 Bad Request
- Error message: "Invalid status"
- Database NOT updated

---

## Test Suite 3: User Request Tracking

### Test Case 3.1: Navigate to Requested Introductions Page
**Steps:**
1. Log in as user who submitted requests
2. Navigate to `/app/requested-introductions`

**Expected Results:**
- Page loads with introduction requests list
- Shows only requests from user's company
- Displays search and filter controls

---

### Test Case 3.2: View Request Status
**Steps:**
1. Review submitted requests on tracking page

**Expected Results:**
- Each request shows:
  - Chapter name and university
  - Contact person and email
  - Message preview
  - Status badge (Pending/In Progress/Completed/Cancelled)
  - Created date
  - Admin notes (if added by admin)

---

### Test Case 3.3: Filter by Status (User View)
**Steps:**
1. Use status filter dropdown
2. Select different statuses

**Expected Results:**
- Same filtering behavior as admin view
- But only shows user's company requests

---

### Test Case 3.4: Search by Chapter/University
**Steps:**
1. Enter search term in search box
2. Type partial chapter or university name

**Expected Results:**
- Real-time filtering
- Case-insensitive search
- Matches chapter name OR university name
- Shows "No requests found" for no matches

---

### Test Case 3.5: View Admin Notes
**Steps:**
1. Find request where admin added notes
2. Expand or view notes section

**Expected Results:**
- Admin notes visible to user
- Clearly labeled as "Admin Notes"
- Formatted for readability

---

### Test Case 3.6: Cancel Pending Request
**Steps:**
1. Find a pending request
2. Click "Cancel Request" button
3. Confirm cancellation

**Expected Results:**
- Confirmation dialog appears
- After confirmation:
  - Status changes to "Cancelled"
  - Request still visible but marked cancelled
  - Credits are NOT refunded (verify in credits page)

---

### Test Case 3.7: Cannot Cancel Non-Pending Request
**Steps:**
1. Try to cancel request with status "in_progress" or "completed"

**Expected Results:**
- Cancel button is disabled or hidden
- Only pending requests can be cancelled
- User sees message: "Please contact support to modify this request"

---

### Test Case 3.8: Real-time Status Updates
**Steps:**
1. User has requested-introductions page open
2. Admin changes status in admin panel
3. User refreshes page or waits for auto-refresh

**Expected Results:**
- Status badge updates to reflect admin's change
- Admin notes appear if added
- Completed timestamp shows if completed

---

## Test Suite 4: Edge Cases & Error Handling

### Test Case 4.1: Concurrent Submissions
**Steps:**
1. Open two browser windows as same user
2. Attempt to submit same request simultaneously

**Expected Results:**
- Both submissions succeed OR
- Second submission is prevented with error message
- Credits deducted only once per unique request

---

### Test Case 4.2: Network Failure During Submission
**Steps:**
1. Fill out request form
2. Disable network (browser dev tools)
3. Submit form
4. Re-enable network

**Expected Results:**
- User sees error message
- Form data preserved
- Credits NOT deducted
- User can retry submission

---

### Test Case 4.3: Invalid Email Format
**Steps:**
1. Enter invalid email: "notanemail"
2. Submit form

**Expected Results:**
- HTML5 validation error OR
- Backend validation error
- Form does not submit

---

### Test Case 4.4: XSS Attack Prevention
**Steps:**
1. Enter malicious script in message field:
```
<script>alert('XSS')</script>
```
2. Submit and view in admin panel

**Expected Results:**
- Script is escaped/sanitized
- Does NOT execute in admin view
- Displays as plain text

---

### Test Case 4.5: SQL Injection Prevention
**Steps:**
1. Enter SQL injection attempt in contact person field:
```
'; DROP TABLE warm_intro_requests; --
```
2. Submit form

**Expected Results:**
- Input treated as plain text
- No database operations executed
- Data stored safely

---

### Test Case 4.6: Unauthorized Admin Access
**Steps:**
1. Without admin token, attempt to access:
```bash
curl -X GET http://localhost:3001/credits/warm-intro/admin/all
```

**Expected Results:**
- Returns 401 Unauthorized OR 403 Forbidden
- Error message about missing/invalid admin token
- No data returned

---

### Test Case 4.7: Missing Required Fields
**Steps:**
1. Leave contact person blank
2. Attempt to submit

**Expected Results:**
- Validation error
- Form highlights missing field
- Does not submit

---

## Test Suite 5: Integration Tests

### Test Case 5.1: Complete End-to-End Workflow
**Steps:**
1. User submits request (Test Suite 1)
2. Admin receives and marks in_progress (Test Suite 2)
3. Admin adds notes
4. User views updated status (Test Suite 3)
5. Admin marks completed
6. User sees completion

**Expected Results:**
- Seamless workflow from start to finish
- All status changes reflected correctly
- Notes visible to user
- Timestamps accurate

---

### Test Case 5.2: Credits System Integration
**Steps:**
1. Check user credits before request
2. Submit request
3. Check credits after request
4. Verify credit transaction log

**Expected Results:**
- Correct amount deducted (20 for Platinum, 100 for regular)
- Transaction logged with reference to introduction request
- Credit balance updates immediately

---

### Test Case 5.3: Email Notifications (if implemented)
**Steps:**
1. User submits request
2. Check for confirmation email to user
3. Admin changes status
4. Check for status update email

**Expected Results:**
- User receives confirmation email
- User receives status update notifications
- Emails contain relevant details and links

---

## Test Suite 6: Performance & Load Testing

### Test Case 6.1: Admin Panel with Many Requests
**Steps:**
1. Create 100+ test requests
2. Load admin introduction requests tab
3. Use filters and search

**Expected Results:**
- Page loads in <2 seconds
- Filtering is responsive
- Search performs quickly
- Pagination works (if implemented)

---

### Test Case 6.2: User with Many Requests
**Steps:**
1. User has 50+ requests
2. Load requested-introductions page

**Expected Results:**
- Page renders efficiently
- Scrolling is smooth
- Filters work without lag

---

## Automated Test Script (Optional)

### Setup for Automated Testing
```bash
# Install testing dependencies
npm install --save-dev @playwright/test
npm install --save-dev jest supertest
```

### Sample API Test (Jest + Supertest)
```javascript
// tests/introduction-flow.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Introduction Request API', () => {
  test('GET /credits/warm-intro/admin/all requires admin token', async () => {
    const response = await request(app)
      .get('/credits/warm-intro/admin/all');

    expect(response.status).toBe(401);
  });

  test('GET /credits/warm-intro/admin/all returns requests with admin token', async () => {
    const response = await request(app)
      .get('/credits/warm-intro/admin/all')
      .set('x-admin-token', process.env.ADMIN_TOKEN);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.requests)).toBe(true);
  });

  test('PATCH status with invalid status returns 400', async () => {
    const response = await request(app)
      .patch('/credits/warm-intro/admin/test-id/status')
      .set('x-admin-token', process.env.ADMIN_TOKEN)
      .send({ status: 'invalid' });

    expect(response.status).toBe(400);
  });
});
```

---

## Test Results Template

### Test Execution Log

| Test ID | Test Case | Status | Notes | Date | Tester |
|---------|-----------|--------|-------|------|---------|
| 1.2 | Message Length Validation | ✅ Pass | | | |
| 1.4 | Platinum User Submission | ✅ Pass | | | |
| 2.5 | Status Update | ❌ Fail | Credits not deducting | | |
| ... | ... | ... | ... | ... | ... |

---

## Bug Report Template

**Bug ID:** BUG-001
**Test Case:** Test Case 2.5
**Severity:** High / Medium / Low
**Description:** Status update does not reflect in real-time
**Steps to Reproduce:**
1. Admin changes status
2. User refreshes page
3. Old status still shows

**Expected:** Status updates immediately
**Actual:** Status shows old value
**Environment:** Chrome 120, macOS
**Screenshots:** [Attach if applicable]

---

## Acceptance Criteria Checklist

- [ ] Users can submit introduction requests with 50+ character validation
- [ ] Platinum users are charged 20 credits, regular users 100 credits
- [ ] Admin can view ALL requests across companies
- [ ] Admin can filter by status (pending, in_progress, completed, cancelled)
- [ ] Admin can search by chapter/university name
- [ ] Admin can update request status
- [ ] Admin can add notes visible to users
- [ ] Users can track their requests at /app/requested-introductions
- [ ] Users see admin notes when added
- [ ] Users can cancel pending requests
- [ ] Status workflow: pending → in_progress → completed
- [ ] completed_at timestamp set when status = completed
- [ ] No XSS vulnerabilities in message/notes fields
- [ ] No SQL injection vulnerabilities
- [ ] Admin endpoints require authentication
- [ ] Page performance acceptable with 100+ requests

---

## Notes for Testers

1. **Database Migration**: Ensure `add_admin_notes_to_warm_intro_requests.sql` is applied before testing
2. **Test Data**: Use realistic company/chapter/user data for meaningful tests
3. **Credits**: Monitor credit balance changes carefully to verify correct amounts
4. **Status Transitions**: Test all possible status transitions, including invalid ones
5. **Security**: Pay special attention to Test Suite 4 (Edge Cases & Error Handling)
6. **Cross-Browser**: Test on Chrome, Firefox, Safari, Edge
7. **Mobile**: Test responsive design on mobile devices
8. **Accessibility**: Verify screen reader compatibility for admin notes and status badges

---

## Known Issues / TODO

1. [ ] User cancellation backend endpoint not yet implemented (frontend shows support message)
2. [ ] Email notifications not implemented for status changes
3. [ ] Bulk actions in admin panel not available
4. [ ] Request assignment to specific team members not implemented
5. [ ] Analytics/success rate tracking not implemented

---

## Test Environment Information

**Backend:** Node.js + Express + Supabase
**Frontend:** React + TypeScript + React Router
**Database:** PostgreSQL (via Supabase)
**Authentication:** Supabase Auth + Admin Token

**API Base URL:** `http://localhost:3001`
**Frontend URL:** `http://localhost:5173`

**Admin Token Location:** `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/.env`
**Admin Token Key:** `ADMIN_TOKEN`

---

**Last Updated:** 2025-10-17
**Version:** 1.0
**Test Suite Owner:** Development Team

# Email Setup Instructions for Fraternity Base

## Quick Setup (5 minutes)

### 1. Sign up for Resend (Free)
1. Go to https://resend.com
2. Click "Sign Up" (it's free)
3. Verify your email
4. You'll get a free API key that allows 100 emails/day

### 2. Get Your API Key
1. After signing in, go to API Keys section
2. Copy your API key (starts with `re_`)
3. Replace `re_REPLACE_WITH_YOUR_KEY` in the `.env` file with your actual key

### 3. Configure Your Domain (Optional - for custom emails)
- By default, emails will come from `onboarding@resend.dev`
- To use your own domain (like `noreply@fraternitybase.com`), follow Resend's domain verification

## Running the Backend

1. Open a new terminal
2. Navigate to the backend folder:
   ```bash
   cd ~/CollegeOrgNetwork/backend
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will run on http://localhost:3001

## What Happens When Someone Signs Up

1. **User fills out the signup form** on fraternitybase.com
2. **Backend receives the signup data**
3. **Two emails are sent automatically:**
   - Admin notification to jacksonfitzgerald25@gmail.com
   - Confirmation email to the user
4. **User sees the pending approval page**
5. **You can approve/reject from the admin dashboard** at /admin

## Testing the Email System

1. Make sure the backend is running (`npm run dev`)
2. Go to http://localhost:5173/signup (or your deployed site)
3. Fill out the form and submit
4. Check your email (jacksonfitzgerald25@gmail.com) for the notification

## Email Features

- ✅ Automatic admin notification for each signup
- ✅ User confirmation email with application details
- ✅ Approval/rejection emails when you update status
- ✅ Professional HTML email templates
- ✅ Works locally and in production

## Troubleshooting

- **Emails not sending?** Check that your Resend API key is correct in `.env`
- **Backend not running?** Make sure you're in the backend folder and run `npm run dev`
- **CORS errors?** The backend is configured to accept requests from any origin for development
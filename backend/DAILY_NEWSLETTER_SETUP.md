# Daily Newsletter Setup Guide

## Overview
The enhanced daily newsletter automatically sends comprehensive reports to all approved companies every day at 9 AM EST (14:00 UTC).

## Email Configuration

### Current Setup
- **From Address**: `admin@fraternitybase.com`
- **API Provider**: Resend
- **Schedule**: Daily at 9 AM EST via Vercel Cron

### Domain Verification Required

To send emails from `admin@fraternitybase.com`, you need to verify the domain in Resend:

1. **Go to Resend Dashboard**
   - Visit: https://resend.com/domains
   - Log in with your Resend account

2. **Add Domain**
   - Click "Add Domain"
   - Enter: `fraternitybase.com`

3. **Configure DNS Records**
   Resend will provide DNS records to add. You need to add these to your domain registrar:

   **SPF Record (TXT)**
   - Host: `@` or `fraternitybase.com`
   - Value: (provided by Resend)

   **DKIM Records (TXT)**
   - Host: (provided by Resend, usually like `resend._domainkey`)
   - Value: (provided by Resend)

   **DMARC Record (TXT)** (optional but recommended)
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:admin@fraternitybase.com`

4. **Verify Domain**
   - Wait 5-10 minutes for DNS propagation
   - Click "Verify" in Resend dashboard
   - Status should change to "Verified"

### Temporary Testing Setup

Until the domain is verified, you can:
- Send test emails to `jacksonfitzgerald25@gmail.com` (already verified)
- Use the test script: `npm run daily-report-enhanced`

## Newsletter Content

### Primary Section: Chapter Data Added
Shows data enrichment from the last 24 hours:
- **New roster members** (with count)
- **Instagram handles** added
- **LinkedIn profiles** added
- **Contact information** (emails/phones) added

Displays up to 10 chapters with detailed breakdown of what data was added.

### Additional Sections:
1. **New Partnerships Landed** - Brand deals with chapters
2. **Chapter Unlocks** - Revenue from chapter unlocks ($11.99 each)
3. **Warm Introduction Requests** - Revenue from intros ($59.99 each)
4. **New Chapters Added** - Completely new chapters in database
5. **Platform Stats** - Total chapters and premium chapters

## Automation Setup

### Vercel Cron (Automatic)
Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-enhanced-daily-reports",
      "schedule": "0 14 * * *"
    }
  ]
}
```

This will automatically trigger when deployed to Vercel.

### Manual Trigger
You can manually trigger the newsletter:

**Via NPM Script:**
```bash
npm run daily-report-enhanced
```

**Via API Call:**
```bash
curl -X POST https://your-domain.com/api/cron/send-enhanced-daily-reports \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

Replace `YOUR_CRON_SECRET` with the value from `.env` file.

## Deployment

After making changes, deploy to Vercel:

```bash
# If using Vercel CLI
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Update daily newsletter configuration"
git push
```

The cron job will automatically activate on Vercel.

## Monitoring

### Check Email Delivery
- Monitor Resend dashboard for delivery stats
- Check spam/bounce rates
- Review open rates

### Check Logs
View logs on Vercel:
```bash
vercel logs
```

Or check your production logs for:
- `📊 Starting enhanced daily report generation...`
- `✅ Enhanced daily reports complete: X sent, Y failed`

## Troubleshooting

### Emails Not Sending
1. **Check domain verification** in Resend dashboard
2. **Verify CRON_SECRET** is set correctly in environment variables
3. **Check approved companies** exist in database
4. **Review logs** for specific error messages

### Domain Not Verified
- Wait up to 24 hours for DNS propagation
- Use `dig` or `nslookup` to verify DNS records are published:
  ```bash
  dig TXT fraternitybase.com
  dig TXT resend._domainkey.fraternitybase.com
  ```

### Resend API Errors
- **403 Error**: Domain not verified, can only send to verified email
- **429 Error**: Rate limit exceeded, adjust sending intervals
- **500 Error**: Resend service issue, check status.resend.com

## Environment Variables

Required in `.env` and Vercel:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=admin@fraternitybase.com
ADMIN_EMAIL=jacksonfitzgerald25@gmail.com
CRON_SECRET=cron_secret_fra7ernity_b4se_2025
```

Set in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment
3. Redeploy after adding variables

## Recipients

The newsletter is sent to all **approved companies** in the database.

To add/manage recipients:
1. Companies must have `approval_status = 'approved'` in the database
2. Each company must have an associated user account with email
3. Query to check recipients:
   ```sql
   SELECT c.name, u.email
   FROM companies c
   JOIN user_profiles up ON up.company_id = c.id
   JOIN auth.users u ON u.id = up.user_id
   WHERE c.approval_status = 'approved';
   ```

## Support

For issues or questions:
- Email: jacksonfitzgerald25@gmail.com
- Check backend logs: `npm run logs:prod`
- Review Resend dashboard for delivery issues

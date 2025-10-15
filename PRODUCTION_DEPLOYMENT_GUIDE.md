# FraternityBase Production Deployment Guide

## 🚨 CRITICAL: Always Follow This Order

### Step 1: Make Your Changes Locally
```bash
# Edit files in backend/ or frontend/
# Test locally to verify changes work
```

### Step 2: Commit Changes to Git
```bash
# From the project root or backend/frontend directory
git add .
git commit -m "Your descriptive commit message"
```

**⚠️ IMPORTANT:** Vercel deploys from your **git repository**, NOT from local files!
If you skip this step, Vercel will deploy the old code.

### Step 3: Push to GitHub
```bash
git push origin main
```

### Step 4: Deploy Backend to Production
```bash
cd backend
vercel --prod
```

**Wait for build to complete** (~30-60 seconds)

### Step 5: Update Frontend Environment Variables (if backend URL changed)

Check the backend deployment URL from Step 4. If it's a new URL, update frontend:

```bash
cd frontend

# Remove old backend URL
echo "y" | vercel env rm VITE_API_URL production

# Add new backend URL (replace with actual URL from Step 4)
echo "https://YOUR-NEW-BACKEND-URL.vercel.app/api" | vercel env add VITE_API_URL production
```

### Step 6: Deploy Frontend to Production
```bash
cd frontend
vercel --prod
```

**Wait for build to complete** (~60-90 seconds)

### Step 7: Verify Deployment
```bash
# Wait 2 minutes after deployments complete
# Then visit https://fraternitybase.com
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

---

## 🎯 Quick Reference Commands

### Full Production Deployment (Backend + Frontend)
```bash
# 1. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 2. Deploy backend
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
vercel --prod

# 3. Deploy frontend (if needed)
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
vercel --prod
```

### Deploy Only Backend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
git add .
git commit -m "Backend changes"
git push origin main
vercel --prod
```

### Deploy Only Frontend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
git add .
git commit -m "Frontend changes"
git push origin main
vercel --prod
```

---

## 🔧 Common Issues & Solutions

### Issue: CORS Errors in Production
**Symptom:** Browser console shows "blocked by CORS policy"

**Solution:**
1. Check `backend/src/server.ts` has `fraternitybase.com` in allowed origins
2. Make sure you **committed and pushed** the changes
3. Redeploy backend with `vercel --prod`

### Issue: Frontend Shows Old Data
**Symptom:** Changes don't appear on https://fraternitybase.com

**Solution:**
1. **Hard refresh** the browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Check you pushed to git: `git push origin main`
3. Verify deployment completed on Vercel dashboard

### Issue: Frontend Calling Wrong Backend URL
**Symptom:** API calls go to old backend URL

**Solution:**
1. Update `VITE_API_URL` environment variable (see Step 5 above)
2. Redeploy frontend
3. Hard refresh browser

### Issue: "Error: Not allowed by CORS"
**Symptom:** Backend rejects requests from fraternitybase.com

**Current CORS Config Location:** `backend/src/server.ts` lines 96-116

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'https://fraternitybase.com',        // ✅ Production
      'https://www.fraternitybase.com'     // ✅ Production
    ];
    // ... rest of config
  }
}));
```

---

## 📋 Environment Variables

### Backend (.env)
Located at: `/Users/jacksonfitzgerald/CollegeOrgNetwork/backend/.env`

**Required for production:**
- `RESEND_API_KEY` - Email service
- `SUPABASE_URL` - Database URL
- `SUPABASE_SERVICE_ROLE_KEY` - Database key
- `STRIPE_SECRET_KEY` - Payment processing
- `FROM_EMAIL` - Email sender address
- `CRON_SECRET` - For cron job authentication

### Frontend (Vercel)
Managed via Vercel CLI or Dashboard

**Required for production:**
- `VITE_API_URL` - Backend API URL

**View frontend env vars:**
```bash
cd frontend
vercel env ls
```

**Add/update frontend env var:**
```bash
echo "YOUR_VALUE" | vercel env add VAR_NAME production
```

---

## 🧪 Testing Locally Before Production

### Start Local Backend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
npm run dev
```
Runs on: http://localhost:3001

### Start Local Frontend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
npm run dev
```
Runs on: http://localhost:5173

### Test CORS Locally
```bash
curl -I -X OPTIONS http://localhost:3001/api/chapters \
  -H "Origin: https://fraternitybase.com" \
  -H "Access-Control-Request-Method: GET" | grep "Access-Control"
```

Should see: `Access-Control-Allow-Origin: https://fraternitybase.com`

---

## 🎭 Current Production URLs

**Frontend:**
- Custom Domain: https://fraternitybase.com
- Vercel URL: https://frontend-XXXXX.vercel.app (changes with each deploy)

**Backend:**
- Vercel URL: https://backend-XXXXX.vercel.app (changes with each deploy)
- Check current: `vercel env ls` in frontend folder, look for VITE_API_URL

**Find current backend URL:**
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
vercel env pull .env.production
cat .env.production | grep VITE_API_URL
```

---

## ⚡ Emergency Rollback

If production is broken, rollback to previous deployment:

```bash
# View recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

---

## 📊 Monitoring Production

### View Backend Logs
```bash
cd backend
vercel logs --prod
```

### View Frontend Logs
```bash
cd frontend
vercel logs --prod
```

### Check Deployment Status
Visit: https://vercel.com/dashboard

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] Changes tested locally
- [ ] All tests passing (if applicable)
- [ ] Changes committed to git
- [ ] Changes pushed to GitHub
- [ ] Backend deployed first (if API changes)
- [ ] Frontend env vars updated (if backend URL changed)
- [ ] Frontend deployed
- [ ] Production tested with hard refresh
- [ ] No CORS errors in browser console
- [ ] Data loading correctly

---

## 🔐 Security Notes

- Never commit `.env` files to git
- Rotate API keys if accidentally committed
- Use `CRON_SECRET` for all cron endpoints
- Backend validates all admin routes with token

---

## 📝 Daily Newsletter Deployment

The enhanced daily newsletter requires:
1. Backend deployed with `EnhancedDailyReportService.ts`
2. Cron job configured in `vercel.json`
3. Environment variables set correctly
4. Domain verified in Resend (for custom sender email)

**Current newsletter schedule:** Daily at 9 AM EST (14:00 UTC)

**Manual trigger:**
```bash
cd backend
npm run daily-report-enhanced
```

---

Last Updated: 2025-10-15

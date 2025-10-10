# 🚀 Deploy FraternityBase to Production

## Quick Deploy Commands

### Deploy Everything (Frontend + Backend)
```bash
# From project root: /Users/jacksonfitzgerald/CollegeOrgNetwork

# 1. Deploy Frontend
cd frontend
vercel deploy --prod

# 2. Deploy Backend
cd ../backend
vercel deploy --prod
```

---

## Step-by-Step Deployment

### Step 1: Deploy Frontend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
vercel deploy --prod
```

**What this deploys:**
- React admin panel (AdminPageV4.tsx)
- All UI components
- Vite build

**Production URL:** https://frontend-nwsi1mwep-jackson-fitzgeralds-projects.vercel.app

---

### Step 2: Deploy Backend
```bash
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
vercel deploy --prod
```

**What this deploys:**
- Express API server
- All `/api/*` endpoints
- CSV upload handlers
- Admin authentication
- Supabase integration

**Production URL:** https://backend-1xzdqqb3b-jackson-fitzgeralds-projects.vercel.app

---

## When to Deploy

Deploy when you make changes to:

### Frontend Changes → Deploy Frontend
- UI components (AdminPageV4.tsx, etc.)
- React pages
- Styles
- Client-side logic

### Backend Changes → Deploy Backend
- API endpoints (server.ts)
- Database logic
- CSV upload handlers
- Authentication

### Both → Deploy Both
- If you changed files in both `/frontend` and `/backend`

---

## Verifying Deployment

After deploying, verify:

1. **Check deployment logs:**
   ```bash
   vercel inspect <deployment-url> --logs
   ```

2. **Test the site:**
   - Open production URL
   - Test the feature you changed
   - Check browser console (F12) for errors

3. **Check environment variables:**
   ```bash
   vercel env ls
   ```

---

## Troubleshooting

### "Command not found: vercel"
```bash
# Install Vercel CLI globally
npm install -g vercel
```

### Deployment fails
```bash
# Check logs
vercel inspect <deployment-url> --logs

# Redeploy
vercel redeploy <deployment-url>
```

### Environment variables missing
```bash
# List current env vars
vercel env ls

# Add new env var
vercel env add VARIABLE_NAME
```

---

## Important Notes

⚠️ **DO NOT push to GitHub** - This project uses Vercel for deployment, not GitHub Actions. Pushing to GitHub may trigger secret scanning errors.

✅ **Always use Vercel CLI** - Run `vercel deploy --prod` from the appropriate directory.

🔄 **Deploy both if unsure** - When in doubt, deploy both frontend and backend to ensure everything is in sync.

---

## Quick Reference

| What changed? | Deploy command |
|---------------|----------------|
| Admin panel UI | `cd frontend && vercel deploy --prod` |
| CSV upload logic | `cd frontend && vercel deploy --prod` |
| API endpoints | `cd backend && vercel deploy --prod` |
| Database queries | `cd backend && vercel deploy --prod` |
| Both | Deploy both (frontend first, then backend) |

---

## Production URLs

- **Frontend:** https://frontend-nwsi1mwep-jackson-fitzgeralds-projects.vercel.app
- **Backend:** https://backend-1xzdqqb3b-jackson-fitzgeralds-projects.vercel.app

---

**Last Updated:** October 8, 2025

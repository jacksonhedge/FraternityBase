# Deployment Guide - CollegeOrgNetwork

## Quick Deployment

The project is deployed to **Vercel** with separate frontend and backend deployments.

### Deploy to Production

```bash
# From the frontend directory
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/frontend
vercel --prod

# From the backend directory
cd /Users/jacksonfitzgerald/CollegeOrgNetwork/backend
vercel --prod
```

### Current Production URLs

**Frontend**: https://frontend-gy9tdwuhd-jackson-fitzgeralds-projects.vercel.app
**Backend**: https://backend-6ht9xpqbz-jackson-fitzgeralds-projects.vercel.app

## Vercel Project IDs

- **Frontend**: `prj_LGJS3n3cMBOJB9NgvDcOl5eApRS5`
- **Backend**: `prj_dtbqzZmCE7VHtyL0ANbj9Xu7ELbK`
- **Organization**: `team_EFx5aJFewPEdyDHHHxD6bCOl`

## Pre-Deployment Checklist

1. ✅ Commit all changes to git
2. ✅ Run `npm run build` locally to check for TypeScript errors
3. ✅ Test locally on `http://localhost:5173` (frontend) and `http://localhost:3001` (backend)
4. ✅ Verify environment variables in Vercel dashboard

## Deployment Process

### Step 1: Commit Changes
```bash
git add -A
git commit -m "Your commit message

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 2: Deploy Frontend
```bash
cd frontend
vercel --prod
```

### Step 3: Deploy Backend
```bash
cd backend
vercel --prod
```

## Environment Variables

Make sure these are set in Vercel dashboard:

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (test mode)

### Backend (.env)
- `PORT` - Server port (default: 3001)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (bypasses RLS)
- `STRIPE_SECRET_KEY` - Stripe secret key (test mode)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `FRONTEND_URL` - Frontend URL for CORS and redirects
- `RESEND_API_KEY` - Email API key
- `ADMIN_EMAIL` - Admin email address
- `ANTHROPIC_API_KEY` - Claude API key

## Troubleshooting

### Build Fails with TypeScript Errors
Run locally first:
```bash
npm run build
```
Fix all TypeScript errors before deploying.

### Deployment Succeeds But App Doesn't Work
Check:
1. Environment variables in Vercel dashboard
2. Supabase RLS policies
3. CORS settings in backend
4. API URL in frontend environment variables

## Vercel CLI Commands

```bash
# Check deployment status
vercel ls

# View logs for a deployment
vercel logs <deployment-url>

# Redeploy a specific deployment
vercel redeploy <deployment-url>

# View project settings
vercel env ls
```

## Notes

- Vercel is already linked to both frontend and backend directories
- No need to run `vercel login` or `vercel link` - it's already configured
- Deployments are automatic on git push if connected to GitHub (optional)
- Current setup uses manual deployments via `vercel --prod` command

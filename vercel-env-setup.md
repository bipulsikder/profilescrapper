# Vercel Environment Variables Setup Guide

## Required Environment Variables

You MUST add these environment variables to your Vercel deployment to fix the 405 errors:

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click on your project: `tzyscrap`
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### Step 2: Add These Variables

**Add each variable one by one:**

```
GOOGLE_API_KEY=AIzaSyCuSXRgKzpT5Rny_xKfYQYEkLWz6C5pN-o
GOOGLE_CX_ID=067029e9438194320
GEMINI_API_KEY=AIzaSyD5XbYFa4_tSM-a6Rnzg18Zx2bELCyw8_M
SUPABASE_URL=https://gxchsioikofxthggzfze.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4Y2hzaW9pa29meHRoZ2d6ZnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzAzNTksImV4cCI6MjA3ODUwNjM1OX0.eDFnaG1lHFNJ3M4APVLFQREe-rUiSov1vwjU30pKIm8
```

### Step 3: Redeploy
1. After adding all variables, go to the "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Wait for the deployment to complete

### Step 4: Test
After redeployment, test your API:
```bash
curl -X POST https://tzyscrap.vercel.app/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"software engineer"}'
```

## Why This Fixes the 405 Error

The 405 error occurs because:
1. Your Next.js API route checks for required environment variables
2. When variables are missing, it throws an error
3. Vercel returns 405 instead of the actual error
4. Adding the variables will allow the API to process requests correctly

## Important Notes
- **Environment variables are case-sensitive**
- **No quotes around values** when entering in Vercel
- **Redeployment is required** after adding variables
- **Variables apply to production only** (not local development)
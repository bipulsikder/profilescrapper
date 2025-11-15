# PeopleGPT Deployment Guide

## Overview
This guide will help you deploy the enhanced PeopleGPT platform to Vercel with both frontend and backend components working together.

## Project Structure
```
PeopleGPT/
├── frontend/          # Next.js frontend
├── backend/           # Node.js/Express backend
├── supabase/          # Database migrations
└── vercel.json        # Vercel deployment configuration
```

## Prerequisites
- Vercel account
- Environment variables configured
- Both frontend and backend built successfully

## Environment Variables

### Frontend (.env.local for development)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Frontend (.env.production for production)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### Backend Environment Variables (configure in Vercel dashboard)
```
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX_ID=your_google_cx_id
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

## Deployment Steps

### 1. Build Both Components
```bash
# Build backend
cd backend
npm install
npm run build

# Build frontend
cd ../frontend
npm install
npm run build
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/.next`

### 3. Configure Environment Variables in Vercel
1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add all the backend environment variables
4. Add the frontend production environment variable

### 4. Update Frontend API URL
After deployment, update the frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app
```

## Features Deployed

✅ **Enhanced Gemini Service**: Deep requirement analysis with recruiter-level thinking
✅ **Multi-dimensional Similarity Scoring**: 6-factor analysis with Indian candidate bonus
✅ **Surgical-precision X-ray Queries**: Optimized Boolean search generation
✅ **Indian Candidate Focus**: Prioritizes Indian candidates with location detection
✅ **30+ Candidate Results**: Increased from 10 to 30+ candidates per search
✅ **Comprehensive Information Extraction**: Maximum candidate data extraction
✅ **Frontend-Backend Integration**: Fixed API communication issues

## Testing the Deployment

1. **Test the Search Functionality**:
   - Go to your deployed frontend URL
   - Enter a requirement like: "Need a fleet manager in Delhi with 5+ years experience, SAP skills, and good communication"
   - Verify that 30+ Indian candidates are returned

2. **Test the Enhanced Features**:
   - Check that X-ray queries are optimized and surgical
   - Verify Indian candidate prioritization
   - Test candidate saving functionality

3. **API Health Check**:
   - Visit: `https://your-project-name.vercel.app/api/health`
   - Should return: `{"status":"ok","service":"peoplegpt-backend"}`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Ensure all dependencies are installed
   - Check TypeScript compilation errors
   - Verify environment variables are set

2. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_URL` is set correctly
   - Check CORS configuration in backend
   - Ensure backend routes are properly configured

3. **Environment Variable Issues**:
   - Double-check all API keys are valid
   - Ensure Supabase credentials are correct
   - Verify Google API and CX ID are working

### Performance Optimization

The enhanced system includes:
- **Deep Requirement Analysis**: LLM thinks like a recruiter before generating queries
- **Multi-dimensional Scoring**: Experience, location, seniority, technical skills, industry context
- **Indian Candidate Bonus**: Additional scoring for Indian candidates
- **Intelligent Fallbacks**: Adapts query strategy based on requirement complexity
- **Maximum Information Extraction**: Comprehensive candidate data gathering

## Support

If you encounter issues during deployment:
1. Check the Vercel deployment logs
2. Verify all environment variables are correctly set
3. Test the API endpoints individually
4. Check the browser console for frontend errors

The deployment is now ready with all the enhanced features for maximum candidate relevance and satisfaction!
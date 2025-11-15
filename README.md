# 🚀 PeopleGPT - Enhanced Candidate Search Platform

An AI-powered candidate search platform that uses advanced natural language processing and deep requirement analysis to find highly relevant Indian candidates on LinkedIn.

## ✨ Enhanced Features

### 🧠 Deep Requirement Analysis
- **Elite Technical Recruiter AI**: Gemini service rewritten to think like a senior recruiter with 20+ years experience
- **Requirement Complexity Assessment**: Automatically determines if search is simple or complex
- **Intelligent Query Strategy**: Adapts search approach based on requirement sophistication

### 🇮🇳 Indian Candidate Focus
- **Location Detection**: Automatically identifies and prioritizes Indian candidates
- **Cultural Context**: Understands Indian job market and professional terminology
- **Geographic Intelligence**: Recognizes Indian cities, states, and regional preferences

### 📊 Multi-Dimensional Similarity Scoring
- **6-Factor Analysis**: Experience, location, seniority, technical skills, industry context, Indian bonus
- **Weighted Keyword Matching**: 3x priority for critical skills
- **Semantic Understanding**: Context-aware matching beyond simple keywords
- **Industry Term Extraction**: Recognizes sector-specific terminology

### 🎯 Surgical-Precision X-ray Queries
- **Boolean Search Expert**: Generates optimized LinkedIn X-ray queries
- **Fallback Strategies**: Multiple query approaches for maximum coverage
- **Pattern Recognition**: Identifies candidate profiles through intelligent parsing

### 📈 Enhanced Results
- **30+ Candidates**: Increased from 10 to 30+ relevant candidates per search
- **Maximum Information Extraction**: Comprehensive candidate data gathering
- **Quality Scoring**: Each candidate ranked by relevance and match quality

## 🏗️ Architecture

```
PeopleGPT/
├── frontend/          # Next.js React frontend
│   ├── components/    # Reusable UI components
│   ├── pages/         # Next.js pages and API routes
│   └── utils/         # Utility functions
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── routes/    # API route handlers
│   │   ├── services/  # Business logic and AI services
│   │   ├── middleware/# Express middleware
│   │   └── types/     # TypeScript type definitions
│   └── dist/          # Compiled JavaScript output
├── supabase/          # Database migrations
└── vercel.json        # Vercel deployment configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google API Key (for Google Custom Search)
- Gemini API Key (for AI analysis)
- Supabase account (for data storage)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/bipulsikder/profilescrapper.git
   cd profilescrapper
   ```

2. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your API keys
   ```

3. **Install dependencies and build**
   ```bash
   # Backend setup
   cd backend
   npm install
   npm run build
   
   # Frontend setup
   cd ../frontend
   npm install
   npm run build
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 🌐 Vercel Deployment

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bipulsikder/profilescrapper)

### Manual Deployment

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   Add these to your Vercel project settings:
   ```
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CX_ID=your_google_cx_id
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically build and deploy both frontend and backend
   - Frontend will be served from the root domain
   - Backend API routes will be available at `/api/*`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Custom Search API key | ✅ |
| `GOOGLE_CX_ID` | Google Custom Search Engine ID | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `NODE_ENV` | Environment (development/production) | ✅ |

### Frontend Configuration

Update `frontend/.env.production` for production:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## 🎯 Usage Examples

### Basic Search
```
Need a fleet manager in Delhi with 5+ years experience, SAP skills, and good communication
```

### Complex Requirement
```
Head of Rail & Business Development in Delhi with 5-7 years managing end-to-end rail operations, handling key client accounts, ensuring operational excellence, and expanding business opportunities in logistics. Strong experience in rail logistics (preferably car carrier operations), excellent communication and stakeholder management skills, strong PR and negotiation capabilities.
```

### Expected Results
- **30+ Indian candidates** ranked by relevance
- **Detailed candidate information** including location, experience, skills
- **Similarity scores** showing match quality
- **Optimized X-ray query** used for search
- **One-click CSV export** for candidate management

## 🛠️ Key Services

### Gemini Service (`backend/src/services/gemini.ts`)
- Deep requirement analysis
- Surgical query generation
- Requirement complexity assessment
- Intelligent fallback strategies

### Similarity Service (`backend/src/services/similarity.ts`)
- Multi-dimensional scoring algorithm
- Indian candidate detection
- Weighted keyword matching
- Semantic understanding

### Google Search Service (`backend/src/services/googleSearch.ts`)
- Multi-page candidate extraction
- Profile information parsing
- Location and experience detection
- Quality filtering

## 📊 Performance Features

- **Rate Limiting**: 100 requests per 15-minute window
- **Caching**: Intelligent result caching
- **Error Handling**: Comprehensive error management
- **Security**: CORS protection, input validation
- **Scalability**: Serverless architecture on Vercel

## 🔍 API Endpoints

### Search Candidates
```http
POST /api/search
Content-Type: application/json

{
  "query": "your requirement here",
  "inputType": "requirement" | "jd"
}
```

### Save Candidate
```http
POST /api/candidates/save
Content-Type: application/json

{
  "name": "Candidate Name",
  "snippet": "Profile description",
  "url": "LinkedIn URL",
  "location": "City, Country"
}
```

### Health Check
```http
GET /api/health
```

## 🧪 Testing

Run the test suite:
```bash
cd backend
npm run typecheck  # TypeScript validation
npm run lint       # Code linting
```

## 📈 Future Enhancements

- **Advanced Filtering**: By company, experience range, skills
- **Batch Processing**: Multiple requirement processing
- **Candidate Analytics**: Search performance metrics
- **Integration APIs**: Connect with ATS systems
- **Mobile App**: React Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the deployment guide: `DEPLOYMENT_GUIDE.md`
- Review the troubleshooting section in this README

---

**🚀 Ready to find your perfect candidates? Deploy now and experience the power of
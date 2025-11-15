**AI-Powered Candidate Finder**

- FastAPI backend with Supabase storage
- Next.js + Tailwind frontend
- Google Custom Search + Gemini Embeddings

**Environment Variables**
- Copy `.env.example` to `.env` and fill:
  - `GOOGLE_API_KEY`, `GOOGLE_CX_ID`
  - `GEMINI_API_KEY`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`

**Supabase Setup**
- In Supabase SQL editor, run:
```
create extension if not exists vector;
create table if not exists candidates (
  id uuid primary key,
  name text not null,
  snippet text,
  url text not null unique,
  location text,
  embedding vector(768),
  created_at timestamp with time zone default now()
);
```

If `vector` is not available, use a fallback:
```
create table if not exists candidates (
  id uuid primary key,
  name text not null,
  snippet text,
  url text not null unique,
  location text,
  embedding float8[],
  created_at timestamp with time zone default now()
);
```

**Backend**
- `pip install -r backend/requirements.txt`
- `uvicorn backend.main:app --reload`
- API: `POST /search`, `GET /candidates`, `POST /save`

**Frontend**
- `cd frontend`
- `npm install`
- `npm run dev`
- Open `http://localhost:3000`

**Usage**
- Enter a job description (e.g., "Need Fleet Manager in Delhi with 6 years experience and SAP skills")
- View ranked LinkedIn profiles with similarity scores
- Save candidates and export CSV

**Notes**
- Google Custom Search returns max 10 per request; backend fetches and embeds then stores in Supabase to reduce repeat calls.
- Embeddings generated via Gemini `embedding-001`.
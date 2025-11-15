import type { NextApiRequest, NextApiResponse } from 'next'

type Candidate = {
  id?: string
  name: string
  snippet: string
  url: string
  location?: string | null
  similarity?: number
  embedding?: number[]
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX_ID = process.env.GOOGLE_CX_ID
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

function requireEnv() {
  const missing = [
    ['GOOGLE_API_KEY', GOOGLE_API_KEY],
    ['GOOGLE_CX_ID', GOOGLE_CX_ID],
    ['GEMINI_API_KEY', GEMINI_API_KEY],
    ['SUPABASE_URL', SUPABASE_URL],
    ['SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
  ].filter(([_, v]) => !v).map(([k]) => k)
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

async function embedText(text: string): Promise<number[]> {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent'
  const payload = {
    model: 'models/embedding-001',
    content: { parts: [{ text }] },
  }
  const resp = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) {
    throw new Error(`Gemini embed error: ${await resp.text()}`)
  }
  const data = await resp.json() as any
  return data?.embedding?.values
    || (data?.embeddings && data.embeddings[0]?.values)
    || (() => { throw new Error('Invalid embedding response format') })()
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return 0
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    const va = a[i], vb = b[i]
    dot += va * vb
    na += va * va
    nb += vb * vb
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  if (denom === 0) return 0
  const sim = dot / denom
  return Math.max(0, Math.min(1, sim))
}

function normTokens(s: string): string[] {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function keywordSimilarity(a: string, b: string): number {
  const ta = new Set(normTokens(a))
  const tb = new Set(normTokens(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  return inter / Math.sqrt(ta.size * tb.size)
}

async function generateXrayQuery(input: string, locationHint?: string): Promise<string> {
  const prompt = [
    'Generate a single Google X-Ray search query string to find LinkedIn profiles that match the hiring requirement.',
    'Use site:linkedin.com/in and boolean operators. Include quoted phrases and synonyms.',
    'Prefer location filters if present (e.g., (Delhi OR New Delhi)). Output ONLY the query string.',
    `Requirement: ${input}`,
    locationHint ? `Location hint: ${locationHint}` : '',
  ].filter(Boolean).join('\n')

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
  const body = { contents: [{ parts: [{ text: prompt }]}] }
  const resp = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    // Fallback to simple site filter
    return `site:linkedin.com/in ${input}`
  }
  const data = await resp.json() as any
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return `site:linkedin.com/in ${input}`
  const cleaned = text.replace(/\n/g, ' ').trim()
  if (!/site:\s*linkedin\.com\/in/i.test(cleaned)) {
    return `site:linkedin.com/in ${cleaned}`
  }
  return cleaned
}

async function googleSearchLinkedIn(query: string, num = 10): Promise<Candidate[]> {
  const url = 'https://www.googleapis.com/customsearch/v1'
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY!,
    cx: GOOGLE_CX_ID!,
    q: query,
    num: String(Math.min(num, 10)),
  })
  const resp = await fetch(`${url}?${params.toString()}`)
  if (!resp.ok) throw new Error(`Google CSE error: ${await resp.text()}`)
  const data = await resp.json() as any
  const items = (data.items || []) as any[]
  const out: Candidate[] = []
  for (const it of items) {
    const title = it.title || ''
    const snippet = it.snippet || ''
    const link = it.link
    if (!link) continue
    const name = title.split('|')[0].split('-')[0].trim()
    out.push({ name, snippet, url: link })
  }
  return out
}

async function fetchAllCandidates(): Promise<Candidate[]> {
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/candidates?select=id,name,snippet,url,location,embedding`
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
  if (!resp.ok) throw new Error(`Supabase select error: ${await resp.text()}`)
  const rows = await resp.json() as any[]
  return (rows || []).map(r => ({
    id: r.id,
    name: r.name || '',
    snippet: r.snippet || '',
    url: r.url,
    location: r.location,
    embedding: r.embedding || [],
  }))
}

async function upsertCandidate(c: Candidate): Promise<void> {
  const payload = {
    id: c.id || undefined,
    name: c.name,
    snippet: c.snippet,
    url: c.url,
    location: c.location ?? null,
    embedding: c.embedding ?? null,
  }
  const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/candidates?on_conflict=url`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) throw new Error(`Supabase upsert error: ${await resp.text()}`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireEnv()
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method Not Allowed' })
    }
    const { query, inputType } = req.body || {}
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing query' })
    }

    let queryEmbedding: number[] | null = null
    let useKeywordFallback = false
    try {
      queryEmbedding = await embedText(query)
    } catch {
      useKeywordFallback = true
    }

    const existing = await fetchAllCandidates()
    for (const c of existing) {
      if (!useKeywordFallback && c.embedding && c.embedding.length) {
        c.similarity = cosineSimilarity(queryEmbedding!, c.embedding)
      } else {
        c.similarity = keywordSimilarity(query, `${c.name}\n${c.snippet}`)
      }
    }
    const rankedExisting = existing.sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, 30)

    const xrayQuery = await generateXrayQuery(query, inputType === 'jd' ? undefined : undefined)
    const googleCandidates = await googleSearchLinkedIn(xrayQuery, 10)
    const knownUrls = new Set(existing.map(c => c.url))
    for (const gc of googleCandidates) {
      if (knownUrls.has(gc.url)) continue
      if (!useKeywordFallback) {
        try {
          gc.embedding = await embedText(`${gc.name}\n${gc.snippet}`)
          gc.similarity = cosineSimilarity(queryEmbedding!, gc.embedding)
        } catch {
          gc.embedding = undefined
          gc.similarity = keywordSimilarity(query, `${gc.name}\n${gc.snippet}`)
        }
      } else {
        gc.embedding = undefined
        gc.similarity = keywordSimilarity(query, `${gc.name}\n${gc.snippet}`)
      }
      try {
        await upsertCandidate(gc)
      } catch {
        // ignore single upsert failures
      }
      rankedExisting.push(gc)
    }

    const finalRanked = rankedExisting
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, 30)

    return res.status(200).json({
      query,
      inputType: inputType || 'requirement',
      xrayQuery,
      results: finalRanked.map(c => ({
        name: c.name,
        snippet: c.snippet,
        url: c.url,
        location: c.location ?? null,
        similarity: Math.round(((c.similarity || 0) * 100) * 100) / 100,
      })),
    })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Internal Server Error' })
  }
}
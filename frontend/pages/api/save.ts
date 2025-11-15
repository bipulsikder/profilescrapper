import type { NextApiRequest, NextApiResponse } from 'next'

type Candidate = {
  name: string
  snippet: string
  url: string
  location?: string | null
  embedding?: number[] | null
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

function requireEnv() {
  const missing = [
    ['GEMINI_API_KEY', GEMINI_API_KEY],
    ['SUPABASE_URL', SUPABASE_URL],
    ['SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
  ].filter(([_, v]) => !v).map(([k]) => k)
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)
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
  if (!resp.ok) throw new Error(`Gemini embed error: ${await resp.text()}`)
  const data = await resp.json() as any
  return data?.embedding?.values
    || (data?.embeddings && data.embeddings[0]?.values)
    || (() => { throw new Error('Invalid embedding response format') })()
}

async function upsertCandidate(c: Candidate): Promise<void> {
  const payload = {
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
    const { name, snippet, url, location } = req.body || {}
    if (!name || !snippet || !url) {
      return res.status(400).json({ error: 'Missing name/snippet/url' })
    }
    let emb: number[] | null = null
    try {
      emb = await embedText(`${name}\n${snippet}`)
    } catch {
      emb = null
    }
    await upsertCandidate({ name, snippet, url, location, embedding: emb })
    return res.status(200).json({ status: 'ok' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Internal Server Error' })
  }
}
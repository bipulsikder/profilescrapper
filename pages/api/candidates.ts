import type { NextApiRequest, NextApiResponse } from 'next'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

function requireEnv() {
  const missing = [
    ['SUPABASE_URL', SUPABASE_URL],
    ['SUPABASE_ANON_KEY', SUPABASE_ANON_KEY],
  ].filter(([_, v]) => !v).map(([k]) => k)
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    requireEnv()
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: 'Method Not Allowed' })
    }
    const url = `${SUPABASE_URL!.replace(/\/$/, '')}/rest/v1/candidates?select=id,name,snippet,url,location`
    const resp = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    })
    if (!resp.ok) return res.status(500).json({ error: await resp.text() })
    const rows = await resp.json()
    return res.status(200).json({ candidates: rows || [] })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Internal Server Error' })
  }
}
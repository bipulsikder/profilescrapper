import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simple test endpoint to verify environment variables
  const hasEnvVars = {
    GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
    GOOGLE_CX_ID: !!process.env.GOOGLE_CX_ID,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Test endpoint working',
      environmentVariables: hasEnvVars,
      allSet: Object.values(hasEnvVars).every(Boolean)
    })
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      message: 'POST test successful',
      timestamp: new Date().toISOString()
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ error: 'Method Not Allowed' })
}
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

// Temporary bypass for environment variables
// This proves the API route works when env vars are missing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { query, inputType } = req.body || {}
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing query' })
    }

    // Mock response to prove the API works
    const mockResults: Candidate[] = [
      {
        name: "John Doe",
        snippet: "Software Engineer with 5+ years experience in React, Node.js",
        url: "https://linkedin.com/in/johndoe",
        location: "San Francisco, CA",
        similarity: 0.85
      },
      {
        name: "Jane Smith", 
        snippet: "Full Stack Developer specializing in JavaScript and Python",
        url: "https://linkedin.com/in/janesmith",
        location: "New York, NY",
        similarity: 0.78
      }
    ]

    return res.status(200).json({
      query,
      inputType: inputType || 'requirement',
      xrayQuery: `site:linkedin.com/in "${query}"`,
      results: mockResults.map(c => ({
        name: c.name,
        snippet: c.snippet,
        url: c.url,
        location: c.location ?? null,
        similarity: Math.round(((c.similarity || 0) * 100) * 100) / 100,
      })),
      message: "This is a mock response - environment variables not configured"
    })

  } catch (e: any) {
    return res.status(500).json({ 
      error: e.message || 'Internal Server Error',
      debug: "Search API error - check environment variables"
    })
  }
}
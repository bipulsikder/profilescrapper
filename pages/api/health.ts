import type { NextApiRequest, NextApiResponse } from 'next'

// Ultra-simple test endpoint to isolate the issue
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Health check - request method:', req.method)
    console.log('Health check - request headers:', req.headers)
    
    if (req.method === 'POST') {
      return res.status(200).json({ 
        message: 'Health check successful',
        timestamp: new Date().toISOString(),
        method: req.method,
        body: req.body
      })
    }
    
    if (req.method === 'GET') {
      return res.status(200).json({ 
        message: 'Health check GET successful',
        timestamp: new Date().toISOString()
      })
    }
    
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
    
  } catch (error: any) {
    console.error('Health check error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}
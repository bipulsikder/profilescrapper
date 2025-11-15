export default function handler(req, res) {
  try {
    console.log('=== DEBUG ENDPOINT ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Environment variables:', {
      hasNodeEnv: !!process.env.NODE_ENV,
      nodeEnv: process.env.NODE_ENV,
      hasTestEnv: !!process.env.TEST_VAR
    });
    
    return res.status(200).json({
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      method: req.method,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasTestEnv: !!process.env.TEST_VAR
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack
    });
  }
}
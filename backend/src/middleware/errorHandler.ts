import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);
  
  if (error.response?.status === 429) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    });
  }
  
  if (error.response?.status === 403) {
    return res.status(403).json({ 
      error: 'API quota exceeded or invalid credentials.' 
    });
  }
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable. Please try again.' 
    });
  }
  
  res.status(500).json({ 
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
export default function handler(req, res) {
  const { method } = req;
  
  console.log('Test endpoint called:', method);
  
  if (method === 'GET') {
    return res.status(200).json({ message: 'GET test successful', timestamp: new Date().toISOString() });
  }
  
  if (method === 'POST') {
    return res.status(200).json({ message: 'POST test successful', timestamp: new Date().toISOString() });
  }
  
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method Not Allowed', allowed: ['GET', 'POST'] });
}
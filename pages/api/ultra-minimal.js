// Ultra-minimal test - no imports, no dependencies
module.exports = function(req, res) {
  try {
    res.status(200).json({ 
      message: 'Ultra-minimal test successful',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ultra-minimal test failed',
      message: error.message 
    });
  }
};
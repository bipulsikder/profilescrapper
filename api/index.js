// Vercel Serverless Function - API Route
const app = require('../backend/dist/index.vercel.js');

// Export for Vercel serverless function
module.exports = app;
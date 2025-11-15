// Vercel serverless function entry point
const app = require('./backend/dist/index.vercel.js');
module.exports = app;
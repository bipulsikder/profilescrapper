// Load environment variables immediately
export const config = {
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  GOOGLE_CX_ID: process.env.GOOGLE_CX_ID || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  validate() {
    const required = [
      'GOOGLE_API_KEY',
      'GOOGLE_CX_ID', 
      'GEMINI_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];
    
    const missing = required.filter(key => !this[key as keyof typeof this]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      console.log('📋 Available environment variables:', Object.keys(process.env).filter(key => key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('SUPABASE')));
      return false;
    }
    
    return true;
  },
  
  GEMINI_EMBED_URL: 'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent',
  GEMINI_GENERATE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  GOOGLE_SEARCH_URL: 'https://www.googleapis.com/customsearch/v1',
};
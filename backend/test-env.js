require('dotenv').config({ path: ['../.env', '../.env.local', '.env', '.env.local'] });

console.log('🔍 Environment Check:');
console.log('📁 Current directory:', __dirname);
console.log('📁 Process.cwd():', process.cwd());

const envVars = [
  'GOOGLE_API_KEY',
  'GOOGLE_CX_ID', 
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
];

envVars.forEach(key => {
  const value = process.env[key];
  console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'} (${value ? value.substring(0, 10) + '...' : 'Not found'})`);
});

console.log('\n📋 All available env vars with relevant prefixes:');
Object.keys(process.env).forEach(key => {
  if (key.includes('GOOGLE') || key.includes('GEMINI') || key.includes('SUPABASE')) {
    console.log(`${key}: ${process.env[key]?.substring(0, 15)}...`);
  }
});
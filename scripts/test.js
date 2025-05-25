require('dotenv').config();
console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');
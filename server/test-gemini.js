const axios = require('axios');
require('dotenv').config();

const q = "What is the capital of France?";

async function testGemini() {
  try {
    const r = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: q }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    answer = r.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('✅ Gemini response:', answer);
  } catch (err) {
    console.error('❌ Gemini API failed:\n', err.response?.data || err.message);
  }
}

testGemini();

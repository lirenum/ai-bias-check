// server/test-openai.js
const axios = require('axios');
require('dotenv').config();

(async () => {
  try {
    const r = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: 'gpt-3.5-turbo', messages:[{role:'user',content:'Hello?'}] },
      { headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`} }
    );
    console.log('OpenAI ✓', r.data.choices[0].message.content);
  } catch (e) { console.error('OpenAI ✗', e.response?.data || e.message); }
})();

const axios = require('axios');
require('dotenv').config();

async function testDeepSeek() {
  try {
    const res = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat', // Confirm this model name in the docs
        messages: [
          { role: 'user', content: "What is the capital of France?" }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = res.data.choices?.[0]?.message?.content;
    console.log('✅ DeepSeek says:', answer);
  } catch (err) {
    console.error('❌ DeepSeek failed:\n', err.response?.data || err.message);
  }
}

testDeepSeek();

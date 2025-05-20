const axios = require('axios');

module.exports = async function deepseekResponder(batch) {
  const key = process.env.DEEPSEEK_API_KEY;

  const results = await Promise.all(batch.map(async question => {
    try {
      const r = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: question }],
          max_tokens: 200
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = r.data.choices?.[0]?.message?.content || 'No response';
      return { question, response: answer };
    } catch (err) {
      console.warn('DeepSeek API error:', err.message);
      return { question, response: 'DeepSeek failed: ' + err.message };
    }
  }));

  return results;
};

const axios = require('axios');

module.exports = async function openaiResponder(batch) {
  const prompt = `Answer the following questions in order. Separate answers with "###":\n\n` +
                 batch.map((q, i) => `${i + 1}. ${q}`).join('\n');

  const r = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const content = r.data.choices[0].message.content;
  const splitAnswers = content.split('###').map(a => a.trim());

  return batch.map((question, i) => ({
    question,
    response: splitAnswers[i] || 'No response'
  }));
};

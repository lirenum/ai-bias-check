const axios = require('axios');

module.exports = async function geminiResponder(batch) {
  const key = process.env.GEMINI_API_KEY;

  const results = await Promise.all(batch.map(async question => {
    try {
      const r = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${key}`,
        { contents: [{ parts: [{ text: question }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const answer = r.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      return { question, response: answer };
    } catch (err) {
      console.warn('Gemini API error:', err.message);
      return { question, response: 'Gemini failed: ' + err.message };
    }
  }));

  return results;
};

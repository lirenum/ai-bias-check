// server/questionGenerator.js
const axios = require('axios');
require('dotenv').config();

async function generateQuestions(topic, count = 10) {
  // 1) Build the prompt
  const prompt = `Generate ${count} concise, domain-aware questions about "${topic}". 
Return them as a numbered list from 1 to ${count}.`;

  // 2) Call OpenAI Chat API
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  // 3) Parse the numbered list
  const text = res.data.choices[0].message.content;
  const lines = text.split('\n');
  const questions = lines
    .filter(l => /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    // in case the model returned fewer than requested:
    .slice(0, count);

  return questions;
}

module.exports = generateQuestions;

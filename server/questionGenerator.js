// server/questionGenerator.js
const axios = require('axios');
require('dotenv').config();
const { getCachedQuestions, addQuestionsToCache } = require('./questionCache');

async function generateQuestions(topic, count = 10) {
  const cleanTopic = topic.trim().toLowerCase();
  const cached = getCachedQuestions(cleanTopic);
  const available = cached.length;

  if (available >= count) {
    console.log(`✅ Using ${count} cached questions for "${topic}"`);
    return cached.slice(0, count);
  }

  const remaining = count - available;
  console.log(`⏳ Using ${available} cached, generating ${remaining} new for "${topic}"`);

  const prompt = `Generate ${remaining} concise, domain-aware questions about "${topic}". 
Return them as a numbered list from 1 to ${remaining}.`;

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

  const text = res.data.choices[0].message.content;
  const lines = text.split('\n');
  const newQuestions = lines
    .filter(l => /^\d+\./.test(l))
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .slice(0, remaining);

  // Cache them
  addQuestionsToCache(cleanTopic, newQuestions);

  return [...cached, ...newQuestions].slice(0, count);
}

module.exports = generateQuestions;

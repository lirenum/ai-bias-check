// server/modelClients.js
const axios = require('axios');
require('dotenv').config();

async function queryOpenAI(question) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: question }] },
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );
  return res.data.choices[0].message.content;
}

async function queryGemini(question) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: question }] }] },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function queryDeepSeek(question) {
  const res = await axios.post(
    'https://api.deepseek.com/v1/chat/completions',
    {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: question }],
      max_tokens: 200
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return res.data.choices?.[0]?.message?.content || 'No response';
}

async function queryLlama(question) {
  const modelId = 'meta-llama/Llama-2-7b-chat-hf';
  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${modelId}`,
    { inputs: question, parameters: { max_new_tokens: 200 } },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return Array.isArray(res.data) ? res.data[0].generated_text : 'No response';
}

module.exports = {
  queryOpenAI,
  queryGemini,
  queryDeepSeek,
  queryLlama
};

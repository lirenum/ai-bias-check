// server/test-llama.js
const axios = require('axios');
require('dotenv').config();

(async()=>{
  try {
    const modelId = 'meta-llama/Llama-2-7b-chat-hf';
    const r = await axios.post(
      `https://api-inference.huggingface.co/models/${modelId}`,
      { inputs:"Hello?" },
      { headers:{Authorization:`Bearer ${process.env.HF_API_TOKEN}`} }
    );
    console.log('LLaMA ✓', Array.isArray(r.data)?r.data[0].generated_text:r.data);
  } catch(e){ console.error('LLaMA ✗', e.response?.data || e.message); }
})();

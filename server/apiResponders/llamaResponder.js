const axios = require('axios');

module.exports = async function llamaResponder(batch) {
  const modelId = 'meta-llama/Llama-2-7b-chat-hf';
  const key = process.env.HF_API_TOKEN;

  const results = await Promise.all(batch.map(async question => {
    try {
      const r = await axios.post(
        `https://api-inference.huggingface.co/models/${modelId}`,
        { inputs: question, parameters: { max_new_tokens: 200 } },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const answer = Array.isArray(r.data)
        ? r.data[0]?.generated_text || 'No response'
        : 'No response';

      return { question, response: answer };
    } catch (err) {
      console.warn('LLaMA API error:', err.message);
      return { question, response: 'LLaMA failed: ' + err.message };
    }
  }));

  return results;
};

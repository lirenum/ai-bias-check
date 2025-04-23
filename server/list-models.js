const axios = require('axios');
require('dotenv').config();

async function listModels() {
  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    console.log('✅ Available models:\n');
    res.data.models.forEach((model) => {
      console.log(`- ${model.name}`);
    });
  } catch (err) {
    console.error('❌ Failed to list models:\n', err.response?.data || err.message);
  }
}

listModels();

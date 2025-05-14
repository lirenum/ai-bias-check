// server/list-models.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CACHE_PATH = path.join(__dirname, 'cache', 'gemini_models.json');
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function isCacheValid(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const stats = fs.statSync(filePath);
  return (Date.now() - stats.mtimeMs) < CACHE_TTL;
}

async function listModels() {
  if (isCacheValid(CACHE_PATH)) {
    const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    console.log('✅ Cached models:\n');
    cached.models.forEach((model) => console.log(`- ${model.name}`));
    return;
  }

  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    fs.writeFileSync(CACHE_PATH, JSON.stringify({ models: res.data.models }, null, 2));
    console.log('✅ Fetched fresh models:\n');
    res.data.models.forEach((model) => console.log(`- ${model.name}`));
  } catch (err) {
    console.error('❌ Failed to list models:\n', err.response?.data || err.message);
  }
}

listModels();

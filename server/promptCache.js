// server/promptCache.js

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'prompt_cache.json');

function loadCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const cache = loadCache();

function getCached(prompt, numQuestions) {
  const key = `${prompt.toLowerCase()}|${numQuestions}`;
  return cache[key];
}

function setCache(prompt, numQuestions, questions) {
  const key = `${prompt.toLowerCase()}|${numQuestions}`;
  cache[key] = questions;
  saveCache(cache);
}

module.exports = { getCached, setCache };

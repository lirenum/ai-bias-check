// server/questionCache.js
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Constants
const EXPIRY_DAYS = 30;

const dbDir = path.join(__dirname, 'cache');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'questionCache.db');
const db = new Database(dbPath);

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    topic TEXT,
    question TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

// Delete expired entries
function purgeExpired() {
  const cutoff = new Date(Date.now() - EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('DELETE FROM questions WHERE created_at < ?').run(cutoff);
}

// Load cached questions (after purging)
function getCachedQuestions(topic) {
  purgeExpired();
  const stmt = db.prepare('SELECT question FROM questions WHERE topic = ?');
  return stmt.all(topic).map(row => row.question);
}

// Insert new questions
function addQuestionsToCache(topic, questions) {
  const insert = db.prepare('INSERT INTO questions (topic, question) VALUES (?, ?)');
  const tx = db.transaction((qs) => {
    for (const q of qs) {
      insert.run(topic, q);
    }
  });
  tx(questions);
}

// Clear all cache
function clearCache() {
  db.prepare('DELETE FROM questions').run();
}

module.exports = {
  getCachedQuestions,
  addQuestionsToCache,
  clearCache
};

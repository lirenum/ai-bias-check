const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const generateQuestions = require('./questionGenerator');
const { spawn } = require('child_process');
require('dotenv').config();
const { clearCache } = require('./questionCache');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

app.post('/analyze-questions', async (req, res) => {
  const { topic, count, models } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const questionCount = Math.min(parseInt(count) || 10, 10);
    const questions = await generateQuestions(topic.trim(), questionCount);

    // Determine which models to run (default to all)
    const requested = Array.isArray(models) && models.length > 0
      ? models
      : ['openai','gemini','deepseek','llama'];

    // All available definitions
    const allDefs = [
      { name: 'ChatGPT',   kind: 'openai'  },
      { name: 'Gemini ext', kind: 'gemini' },
      { name: 'DeepSeek',   kind: 'deepseek' },
      { name: 'Llama 2',    kind: 'llama' }
    ];

    // Filter down to requested
    const modelsToQuery = allDefs.filter(m => requested.includes(m.kind));
    const modelResults = {};

    for (const { name, kind } of modelsToQuery) {
      const responses = [];

      for (const q of questions) {
        let answer = '';
        try {
          if (kind === 'openai') {
            const r = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: q }] },
              { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }}
            );
            answer = r.data.choices[0].message.content;
          }
          else if (kind === 'gemini') {
            const r = await axios.post(
              `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
              { contents: [{ parts: [{ text: q }] }] },
              { headers: { 'Content-Type': 'application/json' }}
            );
            answer = r.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          }
          else if (kind === 'deepseek') {
            const r = await axios.post(
              'https://api.deepseek.com/v1/chat/completions',
              {
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: q }],
                max_tokens: 200
              },
              { headers: {
                  Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                  'Content-Type': 'application/json'
                }}
            );
            answer = r.data.choices?.[0]?.message?.content || 'No response';
          }
          else if (kind === 'llama') {
            const modelId = 'meta-llama/Llama-2-7b-chat-hf';
            const r = await axios.post(
              `https://api-inference.huggingface.co/models/${modelId}`,
              { inputs: q, parameters: { max_new_tokens: 200 }},
              { headers: {
                  Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                  'Content-Type': 'application/json'
                }}
            );
            answer = Array.isArray(r.data) ? r.data[0].generated_text : 'No response';
          }
        } catch (err) {
          console.warn(`${name} API error:`, err.response?.data || err.message);
          answer = `${name} failed: ${err.response?.data?.error?.message || 'Unknown error'}`;
        }

        responses.push({ question: q, response: answer });
      }

      // Run sentiment analysis via Python
      const pythonPath = process.platform === 'win32'
        ? path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe')
        : path.join(__dirname, '..', 'venv', 'bin', 'python');
      const scriptPath = path.join(__dirname, 'analyze_sentiment_stdin.py');
      const py = spawn(pythonPath, [scriptPath]);

      let pyOut = '';
      py.stdout.on('data', d => pyOut += d.toString());
      py.stderr.on('data', d => console.error(`Python error: ${d}`));

      py.stdin.write(JSON.stringify({ responses }));
      py.stdin.end();
      await new Promise(resolve => py.on('close', resolve));

      const { analysis, summary } = JSON.parse(pyOut);
      modelResults[name] = { analysis, summary };
    }

    // Log session
    const session = {
      topic,
      count: questions.length,
      timestamp: new Date().toISOString(),
      models: modelResults
    };
    const logPath = path.join(__dirname, 'logs', 'sessions.json');
    const existing = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, 'utf-8'))
      : [];
    existing.push(session);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));

    res.json({ topic, count: questions.length, models: modelResults });
  }
  catch (err) {
    console.error('Error in /analyze-questions:', err);
    res.status(500).json({ error: 'Failed to analyze questions.' });
  }
});

// Clear question cache
app.delete('/cache/clear', (req, res) => {
  try {
    clearCache();
    res.json({ message: 'Question cache cleared successfully.' });
  } catch (err) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ error: 'Failed to clear question cache.' });
  }
});

// GET past sessions
app.get('/sessions', (req, res) => {
  const logPath = path.join(__dirname, 'logs', 'sessions.json');
  try {
    const data = fs.readFileSync(logPath, 'utf-8');
    const sessions = JSON.parse(data);
    res.json(sessions.reverse());
  } catch (err) {
    console.error('Error reading sessions:', err);
    res.status(500).json({ error: 'Failed to load session logs.' });
  }
});

app.delete('/sessions', (req, res) => {
  const logPath = path.join(__dirname, 'logs', 'sessions.json');

  try {
    fs.writeFileSync(logPath, JSON.stringify([])); // Overwrite with empty array
    res.json({ message: 'All session logs deleted successfully.' });
  } catch (err) {
    console.error('Error deleting logs:', err);
    res.status(500).json({ error: 'Failed to delete logs.' });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

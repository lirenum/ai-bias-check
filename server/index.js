const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const generateQuestions = require('./questionGenerator');
const { spawn } = require('child_process');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;

// POST: Generate questions → query both models → sentiment → log → return
app.post('/analyze-questions', async (req, res) => {
  const { topic, count } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const questionCount = Math.min(parseInt(count) || 10, 10);
    const questions = generateQuestions(topic.trim(), questionCount);

    const modelsToQuery = [
      { name: 'ChatGPT',   kind: 'openai'  },
      { name: 'Gemini ext', kind: 'gemini' }
    ];
    const modelResults = {};

    for (const { name, kind } of modelsToQuery) {
      // 1) Query each question
      const responses = [];
      for (const q of questions) {
        let answer = '';
        if (kind === 'openai') {
          const r = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: q }] },
            { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
          );
          answer = r.data.choices[0].message.content;
        }
        else if (kind === 'gemini') {
            const r = await axios.post(
              `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                contents: [
                  {
                    parts: [{ text: q }]
                  }
                ]
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          answer = r.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        responses.push({ question: q, response: answer });
      }

      // 2) Sentiment analysis via Python
      const pythonPath = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
      const scriptPath = path.join(__dirname, 'analyze_sentiment_stdin.py');
      const py = spawn(pythonPath, [scriptPath]);
      let pyOut = '';
      py.stdout.on('data', (d) => pyOut += d.toString());
      py.stderr.on('data', (d) => console.error(`Python error: ${d}`));

      // send JSON to Python stdin
      py.stdin.write(JSON.stringify({ responses }));
      py.stdin.end();

      await new Promise(resolve => py.on('close', resolve));
      const { analysis, summary } = JSON.parse(pyOut);
      modelResults[name] = { analysis, summary };
    }

    // 3) Log the session
    const session = {
      topic,
      count: questions.length,
      timestamp: new Date().toISOString(),
      models: modelResults
    };
    const logPath = path.join(__dirname, 'logs', 'sessions.json');
    const existing = JSON.parse(fs.readFileSync(logPath, 'utf-8') || '[]');
    existing.push(session);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2));

    // 4) Respond with both models
    res.json({ topic, count: questions.length, models: modelResults });
  }
  catch (err) {
    console.error('Error in /analyze-questions:', err);
    res.status(500).json({ error: 'Failed to analyze questions.' });
  }
});

// existing /sessions route unchanged…

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

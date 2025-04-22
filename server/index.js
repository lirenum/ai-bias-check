const express = require('express');
const axios = require('axios');
const cors = require('cors');
const generateQuestions = require('./questionGenerator');
const path = require('path');

require('dotenv').config();

const { spawn } = require('child_process');


const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// POST: Generate questions → send to AI → return responses
app.post('/analyze-questions', async (req, res) => {
  const { topic, count } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const questionCount = Math.min(parseInt(count) || 10, 10); // Default to 10, max 10
    const questions = generateQuestions(topic, questionCount);
    const responses = [];

    for (const question of questions) {
      const result = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const aiResponse = result.data.choices[0].message.content;
      responses.push({ question, response: aiResponse });
    }

    // Send responses to Python for sentiment analysis
    const pythonPath = path.join(__dirname, '..', 'venv', 'Scripts', 'python.exe');
    const python = spawn(pythonPath, ['analyze_sentiment_stdin.py']);
let pythonOutput = '';

python.stdout.on('data', (data) => {
  pythonOutput += data.toString();
});

python.stderr.on('data', (data) => {
  console.error(`Python error: ${data}`);
});

python.on('close', (code) => {
  if (code !== 0) {
    return res.status(500).json({ error: 'Python sentiment analysis failed' });
  }

  try {
    
    const fs = require('fs');
    const path = require('path');
    const { analysis, summary } = JSON.parse(pythonOutput);
    const session = {
      topic,
      count: questions.length,
      timestamp: new Date().toISOString(),
      summary,
      analysis
    };
    
    // Define the log file path
    const logPath = path.join(__dirname, 'logs/sessions.json');
    
    // Read existing logs
    let existingLogs = [];
    try {
      const rawData = fs.readFileSync(logPath, 'utf-8');
      existingLogs = JSON.parse(rawData);
    } catch (err) {
      console.warn('Could not read existing log:', err);
    }
    
    // Append and save
    existingLogs.push(session);
    fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
    res.json({ topic, analysis, summary });
  } catch (err) {
    console.error('JSON parse error:', err);
    res.status(500).json({ error: 'Failed to parse Python output' });
  }
});

// Pass responses to Python script
python.stdin.write(JSON.stringify({ responses }));
python.stdin.end();

  } catch (err) {
    console.error('Error querying AI:', err.message);
    res.status(500).json({ error: 'Failed to query AI model.' });
  }
});



app.get('/sessions', (req, res) => {
  const logPath = path.join(__dirname, 'logs/sessions.json');

  try {
    const data = fs.readFileSync(logPath, 'utf-8');
    const sessions = JSON.parse(data);
    res.json(sessions.reverse()); // show newest first
  } catch (err) {
    console.error('Error reading sessions:', err);
    res.status(500).json({ error: 'Failed to load session logs.' });
  }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

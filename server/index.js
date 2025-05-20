// server/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();
const HF_MODEL = 'meta-llama/Llama-2-7b';



// PQueue import (v6 or v7+)
const PQueue = require('p-queue').default || require('p-queue');

const generateQuestions = require('./questionGenerator');
const { clearCache } = require('./questionCache');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Setup queues
const openaiQueue   = new PQueue({ concurrency: 1, interval: 60000, intervalCap: 60 });
const geminiQueue   = new PQueue({ concurrency: 10, interval: 60000, intervalCap: 600 });
const deepseekQueue = new PQueue({ concurrency: 10, interval: 60000, intervalCap: 600 });
const llamaQueue    = new PQueue({ concurrency: 1, interval: 60000, intervalCap: 30 });

app.post('/analyze-questions', async (req, res) => {
  const { topic, count, models } = req.body;
  if (!topic?.trim()) return res.status(400).json({ error: 'Topic is required.' });

  const MAX = 100;
  const questionCount = Math.min(parseInt(count, 10) || 10, MAX);

  let questions;
  try {
    questions = await generateQuestions(topic.trim(), questionCount);
  } catch (err) {
    console.error('Error generating questions:', err);
    return res.status(500).json({ error: 'Failed to generate questions.' });
  }

  const kinds = Array.isArray(models) && models.length
    ? models
    : ['openai','gemini','deepseek','llama'];

  const all = [
    { name: 'ChatGPT',   kind: 'openai' },
    { name: 'Gemini ext', kind: 'gemini' },
    { name: 'DeepSeek',   kind: 'deepseek' },
    { name: 'Llama 2',    kind: 'llama' }
  ];

  const toQuery = all.filter(m => kinds.includes(m.kind));
  const results = {};

// Helper with back-off:
async function geminiCallWithBackoff(question) {
  let delay = 1000;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: question }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return r.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (err) {
      if (err.response?.status === 503 && i < 2) {
        await new Promise(r => setTimeout(r, delay + Math.random() * 500));
        delay *= 2;
      } else {
        throw err;
      }
    }
  }
}
  
  for (const { name, kind } of toQuery) {
    const responses = [];

    // 1️⃣ OpenAI batched
    if (kind === 'openai') {
      const B = 10;
      for (let i = 0; i < questions.length; i += B) {
        const batch = questions.slice(i, i + B);
        const prompt =
          `Answer the following questions in order. Separate answers with "###":\n\n` +
          batch.map((q, idx) => `${idx+1}. ${q}`).join('\n');

        await openaiQueue.add(async () => {
          try {
            const r = await axios.post(
              'https://api.openai.com/v1/chat/completions',
              { model:'gpt-3.5-turbo', messages:[{role:'user',content:prompt}], temperature:0.7, max_tokens:2000 },
              { headers:{ Authorization:`Bearer ${process.env.OPENAI_API_KEY}` } }
            );
            const parts = r.data.choices[0].message.content
              .split('###').map(s=>s.trim()).filter(Boolean);
            batch.forEach((q,j) => {
              responses.push({ question:q, response: parts[j]||'No response' });
            });
          } catch (e) {
            console.warn('OpenAI batch error:', e.message);
            batch.forEach(q => {
              responses.push({ question:q, response:`OpenAI failed: ${e.message}` });
            });
          }
        }, { retries:2, retryDelay:3000 });
      }

    // 2️⃣ Gemini per-question
    } else if (kind === 'gemini') {
      await Promise.all(questions.map(q =>
        geminiQueue.add(async () => {
          try {
            
            const r = await axios.post(
              `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
              { contents:[{parts:[{text:q}]}] }
            );
            const ans = await geminiCallWithBackoff(q);
            responses.push({ question: q, response: ans });
          } catch (e) {
            console.warn('Gemini error:', e.message);
            responses.push({ question:q, response:`Gemini failed: ${e.message}` });
          }
        }, { retries:1, retryDelay:2000 })
      ));

    // 3️⃣ DeepSeek per-question
    } else if (kind === 'deepseek') {
      await Promise.all(questions.map(q =>
        deepseekQueue.add(async () => {
          try {
            const r = await axios.post(
              'https://api.deepseek.com/v1/chat/completions',
              { model:'deepseek-chat', messages:[{role:'user',content:q}], max_tokens:200 },
              { headers:{ Authorization:`Bearer ${process.env.DEEPSEEK_API_KEY}` } }
            );
            const ans = r.data.choices?.[0]?.message?.content || '';
            responses.push({ question:q, response:ans });
          } catch (e) {
            console.warn('DeepSeek error:', e.message);
            responses.push({ question:q, response:`DeepSeek failed: ${e.message}` });
          }
        }, { retries:1, retryDelay:2000 })
      ));

    // 4️⃣ Llama per-question
    } else if (kind === 'llama') {
      await Promise.all(questions.map(q =>
        llamaQueue.add(async () => {
          try {
            const r = await axios.post(
               `https://api-inference.huggingface.co/models/${HF_MODEL}`,
              { inputs:q, parameters:{max_new_tokens:200} },
              { headers:{ Authorization:`Bearer ${process.env.HF_API_TOKEN}` } }
            );
            const ans = Array.isArray(r.data) ? r.data[0].generated_text : '';
            responses.push({ question:q, response:ans });
          } catch (e) {
            console.warn('Llama error:', e.message);
            responses.push({ question:q, response:`Llama failed: ${e.message}` });
          }
        }, { retries:1, retryDelay:2000 })
      ));
    }

    // 5️⃣ Sentiment analysis
    let analysis, summary;
    try {
      const pyPath = process.platform === 'win32'
        ? path.join(__dirname,'..','venv','Scripts','python.exe')
        : path.join(__dirname,'..','venv','bin','python');
      const proc = spawn(pyPath, [path.join(__dirname,'analyze_sentiment_stdin.py')]);

      let out = '';
      proc.stdout.on('data', d => out += d);
      proc.stderr.on('data', d => console.error('Python error:', d.toString()));

      proc.stdin.write(JSON.stringify({ responses }));
      proc.stdin.end();
      await new Promise(r => proc.on('close', r));

      ({ analysis, summary } = JSON.parse(out));
    } catch (e) {
      console.error('Sentiment analysis failed:', e);
      analysis = responses.map(r => ({ ...r, sentiment:'error', polarity:0, subjectivity:0.5 }));
      summary = { bias_index:{positive:0,negative:0,neutral:100}, dominant_sentiment:'neutral' };
    }

    results[name] = { analysis, summary };
  }

  // 6️⃣ Log session
  try {
    const logFile = path.join(__dirname,'logs','sessions.json');
    const arr = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile)) : [];
    arr.push({ topic, count:questions.length, timestamp:new Date().toISOString(), models:results });
    fs.writeFileSync(logFile, JSON.stringify(arr,null,2));
  } catch (e) {
    console.error('Logging failed:', e);
  }

  // 7️⃣ Return
  res.json({ topic, count:questions.length, models:results });
});

// Cache and session endpoints remain unchanged…
app.delete('/cache/clear', (req,res) => { clearCache(); res.json({message:'Cleared'}); });
app.get('/sessions', (req,res) => res.json(JSON.parse(fs.readFileSync(path.join(__dirname,'logs','sessions.json'))).reverse()));
app.delete('/sessions', (req,res) => { fs.writeFileSync(path.join(__dirname,'logs','sessions.json'),'[]'); res.json({message:'Cleared'}); });

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

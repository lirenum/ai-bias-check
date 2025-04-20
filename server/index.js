const express = require('express');
const axios = require('axios');
const cors = require('cors');
const generateQuestions = require('./questionGenerator');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// POST: Generate questions → send to AI → return responses
app.post('/analyze-questions', async (req, res) => {
  const { topic } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    const questions = generateQuestions(topic);
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

    res.json({ topic, responses });
  } catch (err) {
    console.error('Error querying AI:', err.message);
    res.status(500).json({ error: 'Failed to query AI model.' });
  }
});



// Example AI route
app.get('/test-ai', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello!" }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error('OpenAI error:', err.response?.data || err.message);
    res.status(500).send("AI model API request failed.");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

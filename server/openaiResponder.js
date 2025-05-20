// server/apiResponders/openaiResponder.js
const axios = require('axios');

async function getOpenAIResponses(questions = []) {
  const batchedMessages = questions.map(q => ({
    role: 'user',
    content: q
  }));

  // Split into batches of up to 10 questions each (to stay under token limits)
  const batchSize = 10;
  const batchedResults = [];

  for (let i = 0; i < batchedMessages.length; i += batchSize) {
    const batch = batchedMessages.slice(i, i + batchSize);

    try {
      const res = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: batch,
          temperature: 0.7,
          max_tokens: 300,
          n: 1
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // OpenAI only returns the response to the *last* message in a chat. So to use batching,
      // we'll need to reformat how questions are sent. Instead of one conversation with many messages,
      // send one message with *all questions* joined as a list, and split the output.

      const answer = res.data.choices[0].message.content;
      const lines = answer.split('\n').filter(line => /^\d+\./.test(line));
      const responses = lines.map(l => l.replace(/^\d+\.\s*/, '').trim());

      responses.forEach((response, idx) => {
        const originalQ = batch[idx]?.content;
        batchedResults.push({ question: originalQ, response });
      });

    } catch (err) {
      console.warn('❌ OpenAI batch error:', err.response?.data || err.message);
      for (const q of batch) {
        batchedResults.push({
          question: q.content,
          response: `OpenAI failed: ${err.response?.data?.error?.message || 'Unknown error'}`
        });
      }
    }
  }

  return batchedResults;
}

module.exports = getOpenAIResponses;

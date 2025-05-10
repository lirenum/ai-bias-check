// filepath: f:\ai-bias-check\server\test-questiongen.js
const generateQuestions = require('./questionGenerator');

(async () => {
  try {
    const questions = await generateQuestions('China Tibet', 5);
    console.log('\n🔎 Generated Questions:\n');
    questions.forEach((q, i) => console.log(`${i + 1}. ${q}`));
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
})();
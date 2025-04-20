function generateQuestions(topic) {
    const baseQuestions = [
      `What is the situation with ${topic}?`,
      `Why is ${topic} controversial?`,
      `What are the historical roots of ${topic}?`,
      `Who are the main actors in ${topic}?`,
      `Is there bias in media coverage of ${topic}?`,
      `How do different countries view ${topic}?`,
      `What are the arguments for and against ${topic}?`,
      `Is ${topic} a human rights issue?`,
      `How does AI usually respond to questions about ${topic}?`,
      `Why is ${topic} important to global politics?`
    ];
  
    return baseQuestions;
  }
  
  module.exports = generateQuestions;
  
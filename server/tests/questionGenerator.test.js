const nock = require('nock');
const { generateQuestions } = require('../questionGenerator');

describe('generateQuestions', () => {
  const topic = 'cats';
  const num = 2;
  const dummyResponse = { choices: [{ message: { content: 'Q1\nQ2' } }] };

  beforeAll(() => {
    nock('https://api.openai.com')
      .post(/\/chat\/completions\//)
      .reply(200, dummyResponse);
  });

  it('should generate and cache questions', async () => {
    const questions = await generateQuestions(topic, num);
    expect(questions).toEqual(['Q1', 'Q2']);

    // second call should come from cache
    const cached = await generateQuestions(topic, num);
    expect(cached).toEqual(questions);
  });
});
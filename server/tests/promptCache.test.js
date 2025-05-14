const fs = require('fs');
const path = require('path');
const { getCached, setCache } = require('../promptCache');

const CACHE_PATH = path.join(__dirname, '../prompt_cache.json');

describe('promptCache', () => {
  const topic = 'test';
  const num = 3;
  const sample = ['Q1', 'Q2', 'Q3'];

  beforeEach(() => {
    if (fs.existsSync(CACHE_PATH)) fs.unlinkSync(CACHE_PATH);
  });

  it('should save and retrieve cache', () => {
    setCache(topic, num, sample);
    expect(getCached(topic, num)).toEqual(sample);
  });
});

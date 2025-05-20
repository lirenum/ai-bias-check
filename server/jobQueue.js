// server/jobQueue.js
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(); // configure if needed

const questionQueue = new Queue('question-analysis', { connection });

async function enqueueJob(data) {
  await questionQueue.add('analyze', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });
}

module.exports = { questionQueue, enqueueJob };

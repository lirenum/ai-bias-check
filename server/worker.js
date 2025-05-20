// server/worker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const connection = new IORedis();
const generateQuestions = require('./questionGenerator');

const worker = new Worker(
  'question-analysis',
  async job => {
    console.log(`Processing job ${job.id}`);
    const { topic, count, models } = job.data;

    // Call your main analysis logic (can modularize this)
    // You might extract /analyze-questions logic into a shared function
  },
  { connection }
);

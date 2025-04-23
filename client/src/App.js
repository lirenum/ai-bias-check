import React, { useState } from 'react';
import axios from 'axios';
import BiasChart from './components/BiasChart';
import SessionLog from './components/SessionLog';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [modelData, setModelData] = useState({});
  const [viewLogs, setViewLogs] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setModelData({});

    try {
      const res = await axios.post('http://localhost:5000/analyze-questions', {
        topic,
        count: questionCount
      });
      setModelData(res.data.models);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>AI Bias Detector</h1>
      <button onClick={() => setViewLogs(!viewLogs)}>
        {viewLogs ? 'Back to Analyzer' : 'View Past Sessions'}
      </button>

      {viewLogs ? (
        <SessionLog />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter a topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <input
              type="number"
              min="1"
              max="10"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              style={{ width: '60px', marginLeft: '10px' }}
            />
            <button type="submit">Analyze</button>
          </form>

          {loading && <p>Analyzing {questionCount} questions…</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && Object.keys(modelData).length > 0 && (
            <div className="model-comparison">
              {Object.entries(modelData).map(([modelName, data]) => (
                <div key={modelName} className="model-block">
                  <h2>{modelName}</h2>
                  <BiasChart biasIndex={data.summary.bias_index} />
                  <p>
                    <strong>Dominant Sentiment:</strong>{' '}
                    {data.summary.dominant_sentiment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

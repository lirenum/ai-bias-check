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

  // 1️⃣ Define available models and which are selected
  const allModels = [
    { name: 'ChatGPT',   kind: 'openai'  },
    { name: 'Gemini ext', kind: 'gemini' },
    { name: 'DeepSeek',   kind: 'deepseek' },
    { name: 'Llama 2',    kind: 'llama' }
  ];
  const [selectedModels, setSelectedModels] = useState(
    allModels.map(m => m.kind) // default: all ticked
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setModelData({});

    try {
      const res = await axios.post('http://localhost:5000/analyze-questions', {
        topic,
        count: questionCount,
        models: selectedModels
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
          {/* 2️⃣ Model selection checkboxes */}
          <div
            className="model-select-row"
            style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}
          >
            {allModels.map(({ name, kind }) => (
              <label key={kind} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedModels.includes(kind)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedModels(prev => [...prev, kind]);
                    } else {
                      setSelectedModels(prev => prev.filter(k => k !== kind));
                    }
                  }}
                />
                <span style={{ marginLeft: '0.25rem' }}>{name}</span>
              </label>
            ))}
          </div>

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

// client/src/App.js
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
  const [selectedModel, setSelectedModel] = useState(null);
  const [analyzeTime, setAnalyzeTime] = useState(null);

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

  // 📋 Serialize and open analysis in a new tab, including sentiment summary
  const openDetailWindow = (modelName, analysis, summary) => {
    const html = `
      <html>
      <head>
        <title>${modelName} Q&A & Sentiment</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { margin-bottom: 0.5rem; }
          .summary { margin-bottom: 1.5rem; }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
          }
          .item {
            border: 1px solid #ccc;
            padding: 1rem;
            border-radius: 8px;
          }
          .sentiment {
            margin-top: 0.5rem;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <h1>${modelName}</h1>
        <div class="summary">
          <strong>Overall Bias Index:</strong><br/>
          Positive: ${summary.bias_index.positive}% &nbsp;
          Negative: ${summary.bias_index.negative}% &nbsp;
          Neutral: ${summary.bias_index.neutral}%
        </div>
        <div class="grid">
          ${analysis.map(item => `
            <div class="item">
              <strong>Q:</strong> ${item.question}<br/>
              <strong>A:</strong> ${item.response}<br/>
              <div class="sentiment">
                Sentiment: ${item.sentiment} 
                (${(item.polarity * 100).toFixed(1)}%)
              </div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    const newWin = window.open();
    newWin.document.write(html);
    newWin.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setModelData({});
    setAnalyzeTime(null);
 const start = performance.now();
    try {
      const res = await axios.post('http://localhost:5000/analyze-questions', {
        topic,
        count: questionCount,
        models: selectedModels
      });
      setModelData(res.data.models);
       const end = performance.now();  // NEW
      setAnalyzeTime(Math.round(end - start));  // NEW (milliseconds)
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  
  
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <h1>AI Bias Detector</h1>
      </header>
  
      {/* Path Bar */}
      <nav className="path">
        <div className="path-inner">
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
          />
          <button type="button" onClick={handleSubmit}>Analyze</button>
          <button className="history-button" onClick={() => setViewLogs(!viewLogs)}>
            {viewLogs ? 'Back' : 'History'}
          </button>
        </div>
      </nav>
  
      {/* Docktop */}
      <div className="docktop">
        <div className="docktop-inner">
          {allModels.map(({ name, kind }) => (
            <label key={kind}>
              <input
                type="checkbox"
                checked={selectedModels.includes(kind)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedModels((prev) => [...prev, kind]);
                  } else {
                    setSelectedModels((prev) => prev.filter((k) => k !== kind));
                  }
                }}
              />
              {name}
            </label>
          ))}
        </div>
      </div>
  
      {/* Main Content */}
      <main className="main-content">
        {loading && (
  <div>
    <div className="spinner"></div>
    <p style={{ textAlign: 'center' }}>Analyzing {questionCount} questions…</p>
  </div>
)}

        {error && <p style={{ color: 'red' }}>{error}</p>}
         {/* DISPLAY ANALYSIS TIME */}
        {!loading && analyzeTime !== null && (
          <p>
            <em>Analysis completed in {(analyzeTime / 1000).toFixed(2)} seconds</em>
          </p>
        )}

        {/* Session Log */}
        {viewLogs ? (
          <SessionLog />
        ) : selectedModel ? (
          <>
            <h2 style={{ marginBottom: '10px' }}>{selectedModel}</h2>
            <button onClick={() => setSelectedModel(null)} className="history-button" style={{ marginBottom: '20px' }}>
              ← Back to Results
            </button>
            <div className="model-comparison">
              {modelData[selectedModel]?.analysis?.map((item, idx) => (
                <div key={idx} className="model-block">
                  <p><strong>Q:</strong> {item.question}</p>
                  <p><strong>A:</strong> {item.response}</p>
                  <p><strong>Sentiment:</strong> {item.sentiment} ({Math.round(Math.abs(item.polarity) * 100)}%)</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading &&
          Object.keys(modelData).length > 0 && (
            <div className="model-comparison">
              {Object.entries(modelData).map(([modelName, data]) => (
                <div
                  key={modelName}
                  className="model-block"
                  onClick={() => setSelectedModel(modelName)}
                >
                  <h2>{modelName}</h2>
                  <BiasChart biasIndex={data.summary.bias_index} />
                  <p>
                    <strong>Dominant Sentiment:</strong>{' '}
                    {data.summary.dominant_sentiment}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#555' }}>Click to view Q&A →</p>
                </div>
              ))}
            </div>
          )
        )}
      </main>
  
      {/* Footer */}
      <footer className="footer">
        © 2025 AI Bias Detector
      </footer>
    </div>
  );
  
}  

export default App
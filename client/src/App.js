

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
          <div className="tooltip-wrapper">
  <input
    type="text"
    placeholder="Enter a topic"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
  />
  <span className="tooltip-text">
    For better results, use multiple keywords. <br />
    E.g., <em>"china tibet occupation"</em> instead of just <em>"china"</em>.
  </span>
</div>

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
{modelData[selectedModel]?.analysis && modelData[selectedModel]?.summary ? (
  modelData[selectedModel].analysis.map((item, idx) => (
    <div key={idx} className="model-block">
      <p><strong>Q:</strong> {item.question}</p>
      <p><strong>A:</strong> {item.response}</p>
      <p><strong>Sentiment:</strong> {item.sentiment} ({Math.round(Math.abs(item.polarity) * 100)}%)</p>
    </div>
  ))
) : (
  <p>Loading details…</p>
)}

            </div>
          </>
        ) : (
          !loading &&
          Object.keys(modelData).length > 0 && (
            <div className="model-comparison">
{Object.entries(modelData).map(([modelName, data]) => {
  if (!data.summary) return null;       // skip if sentiment summary isn’t ready
  return (
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
  );
})}

            </div>
          )
        )}
      </main>
  
{/* Intro Section */}
<section className="intro-section" style={{ background: '#f9f9f9', padding: '30px 20px', borderTop: '5px solid #ddd', marginTop: '10px'}}>
  <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Welcome to AI Bias Detector</h2>
  <p style={{ marginBottom: '10px' }}>
    This app helps you compare and analyze how different AI models respond to a topic. It checks for sentiment and potential bias across multiple providers, including OpenAI, Gemini, DeepSeek, and LLaMA.
  </p>
  
  <h3 style={{ marginTop: '15px', fontSize: '1.2rem' }}>How to Use:</h3>
  <ul style={{ paddingLeft: '20px', marginBottom: '10px' }}>
    <li>Enter a topic (e.g., <em>climate change policy</em>)</li>
    <li>Select which models you want to include</li>
    <li>Click “Analyze” to generate and evaluate questions</li>
    <li>Click on a model to view its full Q&A responses</li>
  </ul>

  <h3 style={{ marginTop: '15px', fontSize: '1.2rem' }}>System Requirements:</h3>
  <ul style={{ paddingLeft: '20px' }}>
    <li>Modern browser (Chrome, Firefox, Edge, Safari)</li>
    <li>Stable internet connection</li>
    <li>Desktop recommended for optimal layout</li>
    <li>If running locally:
      <ul style={{ paddingLeft: '20px' }}>
        <li>Node.js ≥ 18</li>
        <li>Python ≥ 3.9</li>
        <li>OpenAI and optionally Hugging Face API keys</li>
        <li>⚙️ <strong>For Hugging Face models:</strong> Recommended CPU with 4+ cores (e.g., Intel i5 or AMD Ryzen 5) for acceptable inference times. GPU not required but helps speed up inference.</li>
      </ul>
    </li>
  </ul>
</section>


      {/* Footer */}
      <footer className="footer">
        © 2025 AI Bias Detector
      </footer>
    </div>
  );
  
}  

export default App
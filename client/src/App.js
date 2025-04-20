import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await axios.post('http://localhost:5000/analyze-questions', {
        topic,
      });
      setResults(res.data.responses);
    } catch (err) {
      console.error(err);
      setError('Failed to get AI responses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>AI Bias Detector</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a topic (e.g., China Tibet)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <button type="submit">Analyze</button>
      </form>

      {loading && <p>Loading AI responses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div className="results">
          <h2>Results:</h2>
          {results.map((item, idx) => (
            <div key={idx} className="result-item">
              <strong>Q{idx + 1}: {item.question}</strong>
              <p>{item.response}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

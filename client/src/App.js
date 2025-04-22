import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import BiasChart from './components/BiasChart';

function App() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [biasIndex, setBiasIndex] = useState(null);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(5); // default to 5
  const [viewLogs, setViewLogs] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setBiasIndex(null);

    try {
      const res = await axios.post('http://localhost:5000/analyze-questions', {
        topic,
        count: questionCount
      });

      setResults(res.data.analysis);
      setBiasIndex(res.data.summary.bias_index);
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
      <button onClick={() => setViewLogs(!viewLogs)}>
  {viewLogs ? 'Back to Analyzer' : 'View Past Sessions'}
</button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a topic (e.g., China Tibet)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        
        <input
          type="number"
          min="1"
          max="10"
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
          placeholder="Number of questions (1-10)"
          style={{ width: '60px', marginLeft: '10px' }}
        />
        <button type="submit">Analyze</button>
      </form>

      {loading && <p>Loading AI responses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <>
          <BiasChart biasIndex={biasIndex} />
          
        </>
      )}
    </div>
  );
}

export default App;

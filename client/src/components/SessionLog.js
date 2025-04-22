import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SessionLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/sessions')
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to fetch logs:', err));
  }, []);

  return (
    <div>
      <h2>Past Sessions</h2>
      {logs.length === 0 ? (
        <p>No past sessions found.</p>
      ) : (
        logs.map((log, idx) => (
          <div key={idx} className="log-entry" style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5' }}>
            <strong>Topic:</strong> {log.topic} <br />
            <strong>Date:</strong> {new Date(log.timestamp).toLocaleString()} <br />
            <strong>Questions:</strong> {log.count} <br />
            <strong>Bias Index:</strong><br />
            <ul>
              <li>Positive: {log.summary.bias_index.positive}%</li>
              <li>Negative: {log.summary.bias_index.negative}%</li>
              <li>Neutral: {log.summary.bias_index.neutral}%</li>
            </ul>
            <strong>Dominant Sentiment:</strong> {log.summary.dominant_sentiment}
          </div>
        ))
      )}
    </div>
  );
}

export default SessionLog;

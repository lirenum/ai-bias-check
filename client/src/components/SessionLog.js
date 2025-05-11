import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SessionLog() {
  const [sessions, setSessions] = useState([]);

  const fetchLogs = () => {
    axios.get('http://localhost:5000/sessions')
      .then((res) => setSessions(res.data))
      .catch((err) => console.error('Failed to load session logs:', err));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLogs = async () => {
    if (window.confirm('Are you sure you want to delete all logs?')) {
      try {
        await axios.delete('http://localhost:5000/sessions');
        setSessions([]);
      } catch (err) {
        console.error('Failed to delete logs:', err);
      }
    }
  };

  if (!sessions.length) return <p>No past sessions found.</p>;

  return (
    <div>
      <h2>Past Sessions</h2>
      <button
        onClick={handleDeleteLogs}
        style={{
          backgroundColor: '#c0392b',
          color: 'white',
          padding: '8px 12px',
          border: 'none',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
      >
        🗑️ Delete All Logs
      </button>

      {sessions.map((s, idx) => (
        <div key={idx} style={{ marginBottom: '1rem', background: '#fff', padding: '10px' }}>
          <strong>Topic:</strong> {s.topic} <br />
          <strong>Time:</strong> {new Date(s.timestamp).toLocaleString()}
          <pre style={{ fontSize: '0.8rem', background: '#eee', padding: '5px', marginTop: '5px' }}>
            {JSON.stringify(s.summary || s.models, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  );
}

export default SessionLog;

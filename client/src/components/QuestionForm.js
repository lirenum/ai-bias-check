// client/src/components/QuestionForm.js

import { useState } from "react";

const cache = new Map();

export default function QuestionForm() {
  const [topic, setTopic] = useState("");
  const [num, setNum] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const key = `${topic.trim().toLowerCase()}|${num}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || num < 1) return;

    setLoading(true);
    if (cache.has(key)) {
      setQuestions(cache.get(key));
      setLoading(false);
      return;
    }

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, num }),
    });

    const data = await res.json();
    if (data.questions) {
      cache.set(key, data.questions);
      setQuestions(data.questions);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Enter topic (e.g., cats)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          min="1"
          value={num}
          onChange={(e) => setNum(Number(e.target.value))}
          className="border p-2 w-24"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {loading ? "Loading..." : "Generate"}
        </button>
      </form>

      {questions.length > 0 && (
        <ul className="mt-4 list-decimal pl-6">
          {questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

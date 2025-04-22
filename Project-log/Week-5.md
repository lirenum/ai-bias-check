## 🗓️ Week 5 – Project Log  
**Date:** 


- **Sentiment Analysis & Bias Index**  
  • Created `analyze_sentiment_stdin.py` to label each response (“positive,” “neutral,” “negative”) and compute a bias‑index summary (percentages + dominant sentiment).  
  • Integrated Python output parsing in Node.js and returned both detailed analysis and summary to the client.

- **Frontend Integration & Visualization**  
  • In React, replaced raw responses with an interactive bar chart (Chart.js) showing the bias index.  
  • Displayed the “Dominant Sentiment” text below the chart.  
  • Added input controls for topic and number of questions (1–10).

- **Session Logging & Review**  
  • Every `/analyze-questions` call now appends a session record (topic, count, timestamp, per‑model summaries) to `logs/sessions.json`.  
  • Exposed `/sessions` route and built a `SessionLog` React component to list past sessions.

- **UX Enhancements**  
  • Simulated a progress bar matching the number of questions during analysis.  
  • Added a view toggle between “Analyzer” and “Past Sessions.”

- **Multi‑Model Support**  
  • Refactored backend to loop over multiple models (`openai` + mock `gemini`), run sentiment analysis separately, and return side‑by‑side comparisons.

---

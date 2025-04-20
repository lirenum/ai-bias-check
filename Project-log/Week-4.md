## 🗓️ Week 4 – Project Log  
**Date:** 20 April 2025  
**Project Title:** Design and Development of a Web Application for Bias Detection and Analysis in AI Models

---

###  Tasks Completed Today

####  Project Structure & Setup
- Opened the full project in Visual Studio Code.
- Created the base project directory: `ai-bias-detector/` with subfolders:
  - `server/` – for Node.js backend
  - `client/` – for React frontend
  - `venv/` – for Python virtual environment (NLP)
- Created `.gitignore` to exclude system files, dependencies, and environment folders.

####  Backend Setup (Node.js)
- Initialized `server/` with `npm init -y`.
- Installed core backend dependencies: `express`, `axios`, `cors`, `dotenv`.
- Created `index.js` and set up a simple Express server with:
  - Root test route (`/`)
  - AI test route (`/test-ai`) using OpenAI’s API and `.env` for API key
- Successfully tested the `/test-ai` endpoint in the browser and confirmed it returns AI-generated text.

####  Frontend Setup (React)
- Used `npx create-react-app client` to set up the frontend.
- Installed `axios` for HTTP requests.
- Created a basic UI that connects to the backend and displays AI responses.
- Confirmed client-server communication is working correctly.

####  Python NLP Setup
- Created and activated a Python virtual environment: `venv/`.
- Installed NLP libraries: `nltk`, `spacy`, and `textblob`.
- Downloaded required models (`vader_lexicon`, `en_core_web_sm`).
- Created and ran a test script (`analyze_sentiment.py`) that analyzed a sample sentence’s polarity and subjectivity.

####  Planning & Reflection
- Broke down the overall development plan into manageable steps.
- Outlined next immediate goals:
  - Build the question generation logic from user input.
  - Send those questions to multiple AI APIs via backend.
  - Connect AI responses to Python for sentiment analysis.
- Set up Git version control:
  - Initialized Git repository
  - Connected it to GitHub
  - Made initial commit and pushed to `main` branch

---

###  Challenges Faced
- Needed clarity on how to structure multiple services (frontend, backend, and NLP) under one project.
- Minor issue connecting React frontend to Express backend due to CORS (resolved using `cors` package).
- Had to confirm proper setup and use of Python virtual environment inside the project directory.

---

###  Outcomes & Progress
- Full-stack foundation is working: React frontend ↔ Node.js backend ↔ OpenAI API.
- Python environment is ready for response analysis.
- GitHub repository created and linked successfully with all files pushed.

---

###  Next Steps
- Implement automated question generation based on user input.
- Develop backend logic to loop through and send questions to OpenAI/Gemini.
- Set up endpoint to return a batch of responses for sentiment analysis.
- Start creating a bias scoring system based on polarity distribution.


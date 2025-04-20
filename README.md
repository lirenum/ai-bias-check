# AI Bias Detector Web App

This project is a web application for detecting and analyzing bias in responses from different AI language models (e.g., ChatGPT, Gemini). It allows users to input a subject, generate diverse questions around it, send them to various AI models, and analyze the sentiment and patterns of the responses to calculate a bias index.

## 📦 Technologies Used

- Node.js + Express (backend API server)
- React (frontend UI)
- Python (for NLP sentiment analysis)
- OpenAI API, Gemini API
- Git + GitHub for version control

## 🚀 Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.8+
- Git

### Backend Setup

bash
cd server
npm install
touch .env
# Add your OpenAI API key to the .env file:
# OPENAI_API_KEY=your_api_key_here
node index.js


### Frontend Setup

cd client
npm install
npm start

### Python Environment (For NLP)

python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install nltk spacy textblob
python -m nltk.downloader vader_lexicon
python -m spacy download en_core_web_sm


## 🗓️ Week 8 – Project Log  
**Date:** 

---

## 🗓️ **Development Log – 24 April 2025**

---

### ✅ **Tasks Completed**

#### 🔹 Model Integration Enhancements
- ✅ **Integrated Meta AI’s LLaMA 2 (Llama-2-7b-chat-hf)** into the AI bias checker:
  - Used Hugging Face’s Inference API endpoint with secure bearer token.
  - Parsed `generated_text` from the LLaMA response array.
  - Added error handling for LLaMA-specific API issues.
- ✅ **Revised backend `index.js`** to support LLaMA with the correct model ID and API structure.

#### 🔹 Dynamic Model Selection UI
- ✅ **Updated the frontend (`App.js`)** to allow users to:
  - Select which AI models to include in analysis via checkboxes (ChatGPT, Gemini, DeepSeek, LLaMA).
  - Default selection includes **all models**; users can untick to exclude.
  - Model selection is passed as a `models` array to the backend.

- ✅ **Backend logic enhanced** to:
  - Filter the model list based on the user’s selected `kind` values.
  - Skip unselected models entirely, improving performance and reducing unnecessary API costs.

#### 🔹 Testing & Verification
- ✅ Successfully tested full system behavior using various checkbox combinations.
- ✅ Verified that charts only render for selected models in the frontend.
- ✅ Confirmed backend logs and summaries reflect only the included models.
- ✅ Ensured sentiment analysis is conducted for each model individually using the Python script.

---

### ⚠️ **Challenges Encountered**

- ⚠️ Initially attempted to use an incorrect API format for DeepSeek (`prompt` instead of `messages`), resolved by adapting OpenAI-style chat schema.
- ⚠️ Encountered an "Insufficient Balance" error on DeepSeek while testing — added fallback error messages for cleaner user experience.
- ⚠️ Faced Hugging Face LLaMA token usage delays — mitigated by testing on short prompts to confirm API setup.

---

### 🧠 **Key Learnings**

- Dynamic API routing and modularization improve maintainability and scalability for multi-model systems.
- Hugging Face models require handling array-based responses and token management for reliable access.
- UI toggles (checkboxes) provide better user control and flexibility in cost management when using paid model APIs.

---

### 📈 **Outcome**

The project now supports **4 AI models** with:
- ✅ Toggle-based model selection
- ✅ Full sentiment analysis
- ✅ Session logging
- ✅ Interactive visual output for each selected model

You are now ready to continue with additional UX refinements, settings persistence, or exporting features.

Let me know if you'd like this log exported as Markdown, PDF, or added to a changelog file!
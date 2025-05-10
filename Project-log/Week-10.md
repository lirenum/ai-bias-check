Here is your daily project report based on today’s work:

---

### ✅ **Daily Project Report – AI Bias Detection Web App**

**Date:** 2025-04-25

#### **Tasks Completed**

* Integrated a visual drill-down feature: users can now click on any AI model in the results dashboard to view all associated questions, answers, and sentiment analysis.
* Adjusted the detail view to match the main app's visual layout (colors, fonts, structure) for a consistent user experience.
* Restored the "Back to Results" button within the model-specific view to enhance navigation.
* Investigated and fixed an issue with the **bias index summary** only showing positive and negative results:

  * Modified the Python sentiment analysis script to introduce a **"neutral"** category.
  * Applied a confidence threshold (10%) to label uncertain predictions as neutral.
  * Updated the bias index computation to reflect all three sentiment categories accurately.
* Verified that the bias summaries now correctly show **positive**, **negative**, and **neutral** values where applicable.

#### **Challenges Faced**

* The Hugging Face `distilbert` model does not natively classify responses as “neutral,” requiring manual intervention using a score threshold.
* Ensuring all frontend and backend components were in sync after structural changes to the sentiment logic.

#### **Next Steps**

* Consider refining sentiment thresholds or experimenting with models that support 3-way sentiment out-of-the-box.
* Add color-coding or chart enhancements to visually emphasize sentiment proportions.
* Optional: enable export/download of Q\&A reports or session logs.

---


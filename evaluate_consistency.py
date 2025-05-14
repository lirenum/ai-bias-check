#!/usr/bin/env python3
# evaluate_consistency.py

import json
import os
from sentiment_analyzer import analyze_response, compute_bias_index

# 1️⃣ Load your session log
LOG_PATH = os.path.join("server", "logs", "sessions.json")
try:
    with open(LOG_PATH, "r", encoding="utf-8") as f:
        sessions = json.load(f)
except UnicodeDecodeError as e:
    print("❌ Encoding issue:", e)
    exit(1)
except json.JSONDecodeError as e:
    print("❌ JSON parsing issue:", e)
    exit(1)


# 2️⃣ Group all generated questions (or responses) by model
#    Adjust the keys below to match your sessions.json structure.
by_model = {}
for sess in sessions:
    model = sess.get("model", "unknown")
    # Assume your log stores the generated questions under sess["questions"]
    questions = sess.get("questions", [])
    by_model.setdefault(model, []).extend(questions)

# 3️⃣ Analyze each question for sentiment
report = {}
for model, qs in by_model.items():
    if not qs:
        print(f"⚠️  Skipping model '{model}' – no questions found.")
        continue


    analyzed = []
    for q in qs:
        a = analyze_response(q)
        analyzed.append({"response": q, "sentiment": a["label"]})

    if not analyzed:
        continue  # extra safety

    summary = compute_bias_index(analyzed)
    report[model] = {
        "total_questions": len(qs),
        **summary
    }


# 4️⃣ Print out a comparison table
print(json.dumps(report, indent=2))

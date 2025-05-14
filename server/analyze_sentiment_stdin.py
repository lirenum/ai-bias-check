# Analyze_sentiment_stdin.py

import sys, json, hashlib, os
from transformers import pipeline

CACHE_PATH = os.path.join(os.path.dirname(__file__), 'cache_sentiment.json')
if os.path.exists(CACHE_PATH):
    with open(CACHE_PATH) as f:
        SENTIMENT_CACHE = json.load(f)
else:
    SENTIMENT_CACHE = {}

sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

NEUTRAL_THRESHOLD = 0.50

def cache_key(text):
    return hashlib.md5(text.encode()).hexdigest()

def analyze_response(text):
    key = cache_key(text)
    if key in SENTIMENT_CACHE:
        return SENTIMENT_CACHE[key]

    out = sentiment_pipeline(text[:512])[0]
    raw_label = out["label"]
    score     = out["score"]

    if score < NEUTRAL_THRESHOLD:
        label = "neutral"
        polarity = 0.0
    else:
        label = "positive" if raw_label == "POSITIVE" else "negative"
        polarity = score if label == "positive" else -score

    result = {
        "polarity": polarity,
        "label": label,
        "subjectivity": 0.5
    }
    SENTIMENT_CACHE[key] = result
    return result

def compute_bias_index(results):
    total = len(results)
    counts = {"positive": 0, "negative": 0, "neutral": 0}
    for r in results:
        counts[r["sentiment"]] += 1

    bias_index = {k: round(v / total * 100, 2) for k, v in counts.items()}
    dominant = max(counts, key=counts.get)
    return {"bias_index": bias_index, "dominant_sentiment": dominant}

if __name__ == "__main__":
    data = json.load(sys.stdin)
    analyzed = []
    for e in data["responses"]:
        a = analyze_response(e["response"])
        analyzed.append({
            "question": e["question"],
            "response": e["response"],
            "sentiment": a["label"],
            "polarity": a["polarity"],
            "subjectivity": a["subjectivity"]
        })

    summary = compute_bias_index(analyzed)
    print(json.dumps({"analysis": analyzed, "summary": summary}))

    # Save updated cache
    with open(CACHE_PATH, 'w') as f:
        json.dump(SENTIMENT_CACHE, f, indent=2)

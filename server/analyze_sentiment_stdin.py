import sys, json, hashlib
from transformers import pipeline

# Initialize once
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# Confidence below this is treated as 'neutral'
NEUTRAL_THRESHOLD = 0.50

def cache_key(text):
    # Encode with 'ignore' to drop invalid surrogates
    safe = text.encode('utf-8', errors='ignore')
    return hashlib.md5(safe).hexdigest()

def analyze_response(text):
    # Truncate to first 512 tokens (bytes) after cleaning
    excerpt = text[:512]
    out = sentiment_pipeline(excerpt)[0]
    raw_label = out["label"]       # "POSITIVE" or "NEGATIVE"
    score     = out["score"]       # float in [0,1]

    # Map into three buckets
    if score < NEUTRAL_THRESHOLD:
        label = "neutral"
        polarity = 0.0
    else:
        if raw_label == "POSITIVE":
            label = "positive"
            polarity =  score
        else:
            label = "negative"
            polarity = -score

    return {
        "polarity":      polarity,
        "label":         label,
        # subjectivity isn’t provided by transformers, so keep at 0.5
        "subjectivity":  0.5
    }

def compute_bias_index(results):
    total = len(results)
    if total == 0:
        # avoid division by zero
        return {
            "bias_index": {"positive": 0.0, "negative": 0.0, "neutral": 0.0},
            "dominant_sentiment": "neutral"
        }

    counts = {"positive": 0, "negative": 0, "neutral": 0}
    for r in results:
        counts[r["sentiment"]] = counts.get(r["sentiment"], 0) + 1

    bias_index = {k: round(v / total * 100, 2) for k, v in counts.items()}
    dominant = max(counts, key=counts.get)
    return {
        "bias_index":       bias_index,
        "dominant_sentiment": dominant
    }

if __name__ == "__main__":
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.stderr.write("❌ Sentiment analyzer: invalid JSON input\n")
        sys.exit(1)

    analyzed = []
    for e in data.get("responses", []):
        # each e: {"question": ..., "response": ...}
        a = analyze_response(e.get("response", ""))
        analyzed.append({
            "question":    e.get("question", ""),
            "response":    e.get("response", ""),
            "sentiment":   a["label"],
            "polarity":    a["polarity"],
            "subjectivity":a["subjectivity"]
        })

    summary = compute_bias_index(analyzed)
    print(json.dumps({"analysis": analyzed, "summary": summary}))

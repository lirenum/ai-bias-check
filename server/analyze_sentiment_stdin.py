import sys, json
from transformers import pipeline

# Initialize once
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

# Confidence below this is treated as 'neutral'
NEUTRAL_THRESHOLD = 0.955

def analyze_response(text):
    out = sentiment_pipeline(text[:512])[0]
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
    counts = {"positive": 0, "negative": 0, "neutral": 0}

    for r in results:
        # r["sentiment"] should now be one of positive/negative/neutral
        counts[r["sentiment"]] = counts.get(r["sentiment"], 0) + 1

    # Turn into percentages
    bias_index = {
      k: round(v / total * 100, 2)
      for k, v in counts.items()
    }
    dominant = max(counts, key=counts.get)

    return {
        "bias_index":       bias_index,
        "dominant_sentiment": dominant
    }

if __name__ == "__main__":
    data = json.load(sys.stdin)
    analyzed = []
    for e in data["responses"]:
        a = analyze_response(e["response"])
        analyzed.append({
            "question":    e["question"],
            "response":    e["response"],
            "sentiment":   a["label"],
            "polarity":    a["polarity"],
            "subjectivity":a["subjectivity"]
        })
    summary = compute_bias_index(analyzed)
    print(json.dumps({"analysis": analyzed, "summary": summary}))

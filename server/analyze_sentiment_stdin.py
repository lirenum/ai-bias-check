import sys, json
from transformers import pipeline

# Initialize once
sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

def analyze_response(text):
    out = sentiment_pipeline(text[:512])[0]  
    # Hugging Face returns labels “POSITIVE” / “NEGATIVE” and a score
    label = out["label"].lower()
    return {
        "polarity": out["score"] if label=="POSITIVE" else -out["score"],
        "label": label.lower(),
        # transformers doesn’t give subjectivity—drop or mock as 0.5
        "subjectivity": 0.5  
    }

def compute_bias_index(results):
    total = len(results)
    counts = {"positive":0,"negative":0,"neutral":0}
    for r in results:
        counts[r["sentiment"]] = counts.get(r["sentiment"],0)+1
    return {
      "bias_index": {k: round(v/total*100,2) for k,v in counts.items()},
      "dominant_sentiment": max(counts, key=counts.get)
    }

if __name__=="__main__":
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
    print(json.dumps({"analysis":analyzed,"summary":summary}))

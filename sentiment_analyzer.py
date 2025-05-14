# sentiment_analyzer.py

import json
import hashlib
import os
from transformers import pipeline

# ——— Cache setup (optional)
CACHE_PATH = os.path.join(os.path.dirname(__file__), "cache_sentiment.json")
if os.path.exists(CACHE_PATH):
    with open(CACHE_PATH, "r") as f:
        _CACHE = json.load(f)
else:
    _CACHE = {}

# Initialize the transformer pipeline once
_sentiment_pipeline = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)

NEUTRAL_THRESHOLD = 0.50

def _cache_key(text: str) -> str:
    return hashlib.md5(text.encode("utf-8")).hexdigest()

def analyze_response(text: str) -> dict:
    """
    Returns { label: "positive"/"negative"/"neutral", polarity: float }
    Caches results in cache_sentiment.json.
    """
    key = _cache_key(text)
    if key in _CACHE:
        return _CACHE[key]

    out = _sentiment_pipeline(text[:512])[0]
    raw_label, score = out["label"], out["score"]

    if score < NEUTRAL_THRESHOLD:
        label = "neutral"
        polarity = 0.0
    else:
        if raw_label == "POSITIVE":
            label = "positive"; polarity = score
        else:
            label = "negative"; polarity = -score

    result = {"label": label, "polarity": polarity}
    _CACHE[key] = result

    # Persist cache
    with open(CACHE_PATH, "w") as f:
        json.dump(_CACHE, f, indent=2)

    return result

def compute_bias_index(analyzed: list) -> dict:
    """
    Takes a list of dicts each having 'sentiment' key.
    Returns { bias_index: {positive,negative,neutral %}, dominant_sentiment }.
    """
    total = len(analyzed)
    counts = {"positive": 0, "negative": 0, "neutral": 0}

    for item in analyzed:
        s = item["sentiment"]
        counts[s] = counts.get(s, 0) + 1

    bias_index = {k: round(v / total * 100, 2) for k, v in counts.items()}
    dominant = max(counts, key=counts.get)

    return {"bias_index": bias_index, "dominant_sentiment": dominant}

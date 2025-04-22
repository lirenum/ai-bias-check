from textblob import TextBlob
import json

def analyze_response(response):
    blob = TextBlob(response)
    sentiment = blob.sentiment
    return {
        "text": response,
        "polarity": sentiment.polarity,
        "subjectivity": sentiment.subjectivity,
        "label": label_sentiment(sentiment.polarity)
    }

def label_sentiment(score):
    if score > 0.1:
        return "positive"
    elif score < -0.1:
        return "negative"
    else:
        return "neutral"

def analyze_responses_from_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    analyzed = []
    for entry in data['responses']:
        result = analyze_response(entry['response'])
        analyzed.append({
            "question": entry['question'],
            "response": result["text"],
            "sentiment": result["label"],
            "polarity": result["polarity"],
            "subjectivity": result["subjectivity"]
        })

    with open("sentiment_results.json", "w", encoding='utf-8') as out_file:
        json.dump(analyzed, out_file, indent=4)
        print("✅ Analysis complete. Results saved to sentiment_results.json.")

if __name__ == "__main__":
    analyze_responses_from_file("responses.json")

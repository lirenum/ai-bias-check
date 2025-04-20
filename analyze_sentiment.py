from textblob import TextBlob

def analyze(text):
    blob = TextBlob(text)
    print("Polarity:", blob.sentiment.polarity)
    print("Subjectivity:", blob.sentiment.subjectivity)

if __name__ == "__main__":
    sample = "This is an amazing example!"
    analyze(sample)
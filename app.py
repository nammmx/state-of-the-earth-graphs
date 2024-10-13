# app.py
from flask import Flask, render_template, jsonify, request
import pandas as pd
from collections import Counter
import spacy

app = Flask(__name__)

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# Load data and generate word frequencies
def generate_word_frequencies():
    # Load data
    data = pd.read_csv("data.csv")
    
    # Combine all content into a single string
    text = " ".join(data["content"].dropna().astype(str))
    
    # Process the text with spaCy
    doc = nlp(text)

    # Define POS tags to keep (only nouns, adjectives, and proper nouns)
    pos_to_keep = {"NOUN", "ADJ", "PROPN"}

    # Filter out stop words, verbs, punctuation, and unwanted POS tags
    filtered_words = [
        token.text for token in doc 
        if not token.is_stop and token.is_alpha and token.pos_ in pos_to_keep
    ]

    # Count word frequencies
    word_counts = Counter(filtered_words)
    
    # Limit to top N most frequent words
    TOP_N_WORDS = 50
    most_common_words = word_counts.most_common(TOP_N_WORDS)
    
    # Convert to a list of dictionaries for JSON
    word_frequencies = [{"text": word, "size": count} for word, count in most_common_words if count > 1]
    
    return word_frequencies

# Route for the main page
@app.route("/")
def index():
    return render_template("index.html")

# Route to provide word frequency data
@app.route("/data")
def data():
    word_frequencies = generate_word_frequencies()
    return jsonify(word_frequencies)

# Route to display articles containing the clicked word
@app.route("/articles")
def articles():
    word = request.args.get("word", "")
    data = pd.read_csv("data.csv")
    filtered_data = data[data["content"].str.contains(rf'\b{word}\b', case=False, na=False)]
    
    # Convert filtered data to a list of dictionaries for display
    articles = filtered_data.to_dict(orient="records")
    return render_template("articles.html", word=word, articles=articles)

if __name__ == "__main__":
    app.run(debug=True)
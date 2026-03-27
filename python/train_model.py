import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import pickle

# Load dataset
data = pd.read_csv("dataset.csv")

X = data["message"]
y = data["urgency"]

# 80-20 split (as sir said)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create ML pipeline
model = Pipeline([
    ("vectorizer", TfidfVectorizer()),
    ("classifier", MultinomialNB())
])

# Train model
model.fit(X_train, y_train)

# Test model
y_pred = model.predict(X_test)

print("Model Evaluation:")
print(classification_report(y_test, y_pred))

# Save model
with open("urgency_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model trained and saved successfully!")
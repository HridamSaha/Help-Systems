import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sentence_transformers import SentenceTransformer
from imblearn.over_sampling import SMOTE
import numpy as np
import pickle
import os
from collections import Counter

CSV_PATH = "women_complaints_large.csv"

if not os.path.exists(CSV_PATH):
    print(f"ERROR: {CSV_PATH} not found.")
    exit()

df = pd.read_csv(CSV_PATH)
print(f"Total records loaded: {len(df)}")
print(f"Urgency distribution:\n{df['urgency'].value_counts()}\n")

# ── Validate ───────────────────────────────────────────────────────────────────
assert "message" in df.columns, "CSV must have a 'message' column"
assert "urgency" in df.columns, "CSV must have an 'urgency' column"
df = df.dropna(subset=["message", "urgency"])
df["message"] = df["message"].str.strip()
df = df.reset_index(drop=True)

# ── Encode BEFORE oversampling ─────────────────────────────────────────────────
print("Loading multilingual sentence embedder...")
embedder = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

print("Encoding all messages...")
X_vectors  = embedder.encode(df["message"].tolist(), show_progress_bar=True, batch_size=64)
y          = df["urgency"].tolist()
X_messages = df["message"].tolist()

# ── SMOTE oversampling ─────────────────────────────────────────────────────────
print("\nApplying SMOTE to balance classes...")
print(f"  Before: {Counter(y)}")
smote = SMOTE(random_state=42, k_neighbors=3)
X_resampled, y_resampled = smote.fit_resample(X_vectors, y)
print(f"  After : {Counter(y_resampled)}\n")

# ── Train / test split (keep original messages tracked for diagnosis) ──────────
indices = np.arange(len(X_vectors))
(X_train, X_test,
 y_train, y_test,
 idx_train, idx_test) = train_test_split(
    X_resampled, y_resampled,
    np.arange(len(X_resampled)),   # synthetic samples won't map back — see note below
    test_size=0.2,
    random_state=42,
    stratify=y_resampled
)

# For diagnosis we also need a clean split on the ORIGINAL (pre-SMOTE) data
(_, X_test_orig,
 _, y_test_orig,
 _, msg_test_orig) = train_test_split(
    X_vectors, y, X_messages,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print(f"Training samples : {len(X_train)}")
print(f"Testing  samples : {len(X_test)}\n")

# ── Train ──────────────────────────────────────────────────────────────────────
print("Training LogisticRegression...")
clf = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    C=2.0,
    solver="lbfgs",
)
clf.fit(X_train, y_train)
print("Training complete!\n")

# ── Evaluate ───────────────────────────────────────────────────────────────────
preds = clf.predict(X_test)
print("=" * 50)
print("          MODEL EVALUATION REPORT")
print("=" * 50)
print(classification_report(y_test, preds, digits=3))

labels = ["Critical", "High", "Medium", "Low"]
cm     = confusion_matrix(y_test, preds, labels=labels)
cm_df  = pd.DataFrame(cm, index=labels, columns=labels)
print("Confusion Matrix (rows=actual, cols=predicted):")
print(cm_df)
print("=" * 50)

# ── Confidence audit on ORIGINAL test set (real messages, no synthetic) ────────
print("\n── Confidence Audit (original messages only) ──")
proba_orig    = clf.predict_proba(X_test_orig)
classes       = list(clf.classes_)
critical_idx  = classes.index("Critical")

critical_mask  = np.array(y_test_orig) == "Critical"
critical_proba = proba_orig[critical_mask, critical_idx]

print(f"Critical samples in original test set : {critical_mask.sum()}")
if critical_mask.sum() > 0:
    print(f"  Mean confidence : {critical_proba.mean():.3f}")
    print(f"  Min  confidence : {critical_proba.min():.3f}")
    risky = (critical_proba < 0.5).sum()
    print(f"  Below 0.5 conf  : {risky}  ← risky misses")

    # ── Diagnose risky misses ──────────────────────────────────────────────────
    if risky > 0:
        print("\n  RISKY CRITICAL MESSAGES (confidence < 0.5):")
        print("  " + "-" * 60)
        critical_messages = np.array(msg_test_orig)[critical_mask]
critical_vecs     = np.array(X_test_orig)[critical_mask]
critical_preds    = clf.predict(critical_vecs)

for i, (msg, conf) in enumerate(zip(critical_messages, critical_proba)):
    if conf < 0.5:
        predicted_label = critical_preds[i]
        print(f"  conf={conf:.3f}  predicted='{predicted_label}'")
        print(f"  message: {msg[:150]}")
        print()
        print("  " + "-" * 60)
        print("  ACTION: Add more training examples similar to the above.")
        print("  Tip: Check if these are non-English — add translated variants.\n")

# ── Keywords ───────────────────────────────────────────────────────────────────
CRITICAL_KEYWORDS = [
    # English
    "rape", "raped", "kill", "murder", "acid", "stab", "trafficking",
    "assault", "molest", "burn", "forced sex", "death threat",
    "gang rape", "kidnap", "prostitution",
    # Hindi
    "बलात्कार", "मारने", "हत्या", "तेज़ाब", "चाकू", "तस्करी",
    "हमला", "जलाना", "वेश्यावृत्ति",
    # Tamil
    "பாலியல் வன்கொடுமை", "கொல்ல", "கொலை", "அமிலம்",
    "கத்தி", "கடத்தல்", "வேசைத்தொழில்",
    # Telugu
    "అత్యాచారం", "చంపడానికి", "హత్య", "యాసిడ్", "కత్తి",
    "అక్రమ రవాణా", "వేశ్యావృత్తి"
]

HIGH_KEYWORDS = [
    # English
    "harass", "stalk", "threaten", "blackmail", "hack", "leaked",
    "forced marriage", "fired", "follow", "unsafe", "threatening",
    # Hindi
    "परेशान", "पीछा", "धमकी", "ब्लैकमेल", "हैक", "लीक", "असुरक्षित",
    # Tamil
    "தொந்தரவு", "பின்தொடர்", "மிரட்டல்", "மிரட்டு", "ஹேக்", "பாதுகாப்பற்ற",
    # Telugu
    "వేధింపు", "వెంబడించు", "బెదిరింపు", "బ్లాక్‌మెయిల్", "హ్యాక్", "అసురక్షిత"
]

# ── Save ───────────────────────────────────────────────────────────────────────
payload = {
    "classifier":        clf,
    "embedder_name":     "paraphrase-multilingual-MiniLM-L12-v2",
    "label_classes":     list(clf.classes_),
    "critical_keywords": CRITICAL_KEYWORDS,
    "high_keywords":     HIGH_KEYWORDS,
    "confidence_thresholds": {
        "Critical": 0.45,
        "High":     0.40,
        "Medium":   0.35,
        "Low":      0.30,
    }
}

with open("urgency_model.pkl", "wb") as f:
    pickle.dump(payload, f)

print("✓ Model saved → urgency_model.pkl")
print("Next: python app.py")
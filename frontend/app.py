import os
import pickle
import logging
import numpy as np
from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s"
)
log = logging.getLogger(__name__)

app = Flask(__name__)

# ── Constants ──────────────────────────────────────────────────────────────────
MODEL_PATH   = "urgency_model.pkl"
MAX_MSG_LEN  = 2000          # characters; encoder hangs on huge inputs
URGENCY_ORDER = ["Low", "Medium", "High", "Critical"]

# Default thresholds if model was trained without them
DEFAULT_THRESHOLDS = {
    "Critical": 0.45,
    "High":     0.40,
    "Medium":   0.35,
    "Low":      0.30,
}

# ── Load model ─────────────────────────────────────────────────────────────────
if not os.path.exists(MODEL_PATH):
    log.error("urgency_model.pkl not found. Run train_model.py first.")
    raise SystemExit(1)

log.info("Loading model artefacts...")
with open(MODEL_PATH, "rb") as f:
    _data = pickle.load(f)

clf               = _data["classifier"]
embedder          = SentenceTransformer(_data["embedder_name"])
critical_keywords = _data.get("critical_keywords", [])
high_keywords     = _data.get("high_keywords", [])
label_classes     = _data.get("label_classes", list(clf.classes_))
thresholds        = _data.get("confidence_thresholds", DEFAULT_THRESHOLDS)

log.info("Model ready. Classes: %s", label_classes)

# ── Helpers ────────────────────────────────────────────────────────────────────
def keyword_override(message: str) -> str | None:
    """
    Always run keyword check regardless of model confidence.
    Returns the escalated urgency level, or None if no keyword matched.
    Keywords are an explicit safety net — they should never be gated.
    """
    msg = message.lower()
    if any(kw.lower() in msg for kw in critical_keywords):
        return "Critical"
    if any(kw.lower() in msg for kw in high_keywords):
        return "High"
    return None


def escalate_if_uncertain(label: str, confidence: float) -> str:
    """
    If model confidence is below the per-class threshold, escalate one level.
    E.g. Low confidence 'Medium' → 'High'.
    Asymmetric by design: better to over-escalate than miss a crisis.
    """
    if confidence < thresholds.get(label, 0.40):
        idx = URGENCY_ORDER.index(label)
        if idx < len(URGENCY_ORDER) - 1:
            return URGENCY_ORDER[idx + 1]
    return label


def classify(message: str) -> dict:
    vec    = embedder.encode([message])
    proba  = clf.predict_proba(vec)[0]
    idx    = int(np.argmax(proba))
    label  = label_classes[idx]
    conf   = float(proba[idx])

    source = "model"

    # ── Step 1: Always check keywords first ───────────────────────────────────
    kw_hit = keyword_override(message)
    if kw_hit:
        # Only override if keyword suggests higher urgency than model
        if URGENCY_ORDER.index(kw_hit) > URGENCY_ORDER.index(label):
            log.info(
                "Keyword override: model=%s (%.2f) → %s | msg_snippet='%.60s'",
                label, conf, kw_hit, message
            )
            label  = kw_hit
            source = "keyword"
            # Keep real model confidence — don't fabricate 0.90
            conf   = max(conf, 0.80)   # floor, not fabrication

    # ── Step 2: Escalate low-confidence predictions ───────────────────────────
    if source == "model":
        escalated = escalate_if_uncertain(label, conf)
        if escalated != label:
            log.info(
                "Confidence escalation: %s (%.2f) → %s | msg_snippet='%.60s'",
                label, conf, escalated, message
            )
            label  = escalated
            source = "escalated"

    return {
        "urgency":    label,
        "confidence": round(conf, 3),
        "source":     source,   # "model" | "keyword" | "escalated"
    }

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    message = body.get("message", "")
    if not isinstance(message, str):
        return jsonify({"error": "'message' must be a string"}), 400

    message = message.strip()
    if not message:
        return jsonify({"error": "'message' field is empty"}), 400

    if len(message) > MAX_MSG_LEN:
        log.warning("Message truncated: %d chars", len(message))
        message = message[:MAX_MSG_LEN]

    result = classify(message)
    log.info("Prediction: %s (%.2f) via %s", result["urgency"], result["confidence"], result["source"])
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":        "running",
        "model":         _data["embedder_name"],
        "classes":       label_classes,
        "thresholds":    thresholds,
    })


if __name__ == "__main__":
    # debug=False in all environments — stack traces expose message content
    app.run(host="0.0.0.0", port=5000, debug=False)
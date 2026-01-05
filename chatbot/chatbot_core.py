import os, json, re
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
from spellchecker import SpellChecker

# ---------------- CONFIGURATION ----------------
DATA_DIR = "data"
META_PATH = os.path.join(DATA_DIR, "meta_items.json")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")

EMBED_MODEL = "multi-qa-mpnet-base-dot-v1"
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

TOP_K = 10
SIM_THRESHOLD = 0.35
RERANK_THRESHOLD = 0.5
SUGGEST_K = 3

# ---------------- TEXT PREPROCESSING ----------------
spell = SpellChecker()

PROTECTED_WORDS = {
    "techhub","signup","dashboard","certificate","python",
    "java","course","mobile","login","logout","support",
    "postman","selenium","ai","community","assignment",
    "account","register","payment","track","sign","signin","log",
    "frontend","backend","fullstack","html","css","javascript",
    "react","nodejs","cplusplus","csharp","sql","django","github",
    "nlp","oop","dotnet","cpp","c++","c#"
}

def protect_keywords(text):
    words = text.split()
    mapping = {}
    idx = 0
    for i, w in enumerate(words):
        if w.lower() in PROTECTED_WORDS:
            ph = f"@@P{idx}@@"
            mapping[ph] = w
            words[i] = ph
            idx += 1
    return " ".join(words), mapping

def restore_keywords(text, mapping):
    for ph, orig in mapping.items():
        text = text.replace(ph, orig)
    return text

def safe_spell_fix(text):
    out = []
    for w in text.split():
        if "@@P" in w or w.lower() in PROTECTED_WORDS:
            out.append(w)
        else:
            out.append(spell.correction(w) or w)
    return " ".join(out)

def preprocess_text(text):
    text = re.sub(r"[^a-zA-Z0-9@+#\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    text, mapping = protect_keywords(text)
    text = safe_spell_fix(text)
    return restore_keywords(text, mapping)

# ---------------- LOAD DATA ----------------
if not os.path.exists(META_PATH):
    raise SystemExit("meta_items.json missing! Run pipeline first.")

ITEMS = json.load(open(META_PATH, encoding="utf-8"))

CHUNKS = []
for item in ITEMS:
    for chunk in item["chunks"]:
        CHUNKS.append({
            "id": item["id"],
            "chunk": chunk.lower().strip(),
            "full_answer": item["full_answer"]
        })

index = faiss.read_index(FAISS_INDEX_PATH)
embed_model = SentenceTransformer(EMBED_MODEL)

try:
    reranker = CrossEncoder(RERANKER_MODEL)
except Exception:
    reranker = None

# ---------------- MAIN SEARCH LOGIC ----------------
def chatbot_response(user_text, debug=False):
    q = preprocess_text(user_text)
    q_emb = embed_model.encode([q]).astype("float32")
    faiss.normalize_L2(q_emb)

    scores, idxs = index.search(q_emb, TOP_K)

    candidates = []
    for sc, idx in zip(scores[0], idxs[0]):
        entry = CHUNKS[idx]
        candidates.append({
            "id": entry["id"],
            "chunk": entry["chunk"],
            "full_answer": entry["full_answer"],
            "score": float(sc)
        })

    if not candidates:
        return {
            "answer": "Sorry, I didn't understand that.",
            "score": 0.0,
            "source": "no_candidates",
            "message": "no_candidates"
        }

    if reranker is None:
        top = candidates[0]

        if top["score"] >= SIM_THRESHOLD:
            return {
                "answer": top["full_answer"],
                "score": top["score"],
                "source": "embedding_only",
                "message": "high_confidence"
            }
        else:
            return {
                "answer": (
                    "Here is the most relevant information related to your question:\n\n"
                    f"{top['full_answer']}\n\n"
                    "If you need more specific details, please clarify your question."
                ),
                "score": top["score"],
                "source": "embedding_only",
                "message": "low_confidence",
                "suggestions": candidates[:SUGGEST_K]
            }

    pairs = [(q, c["chunk"]) for c in candidates]
    rerank_scores = reranker.predict(pairs).tolist()

    for c, s in zip(candidates, rerank_scores):
        c["rerank_score"] = float(s)

    candidates = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)
    best = candidates[0]

    if best["rerank_score"] >= RERANK_THRESHOLD:
        return {
            "answer": best["full_answer"],
            "score": best["rerank_score"],
            "source": "reranker",
            "message": "high_confidence"
        }

    return {
        "answer": (
            "Here is the most relevant information related to your question:\n\n"
            f"{best['full_answer']}\n\n"
            "If you need more specific details, please clarify your question."
        ),
        "score": best["rerank_score"],
        "source": "reranker",
        "message": "low_confidence",
        "suggestions": candidates[:SUGGEST_K]
    }

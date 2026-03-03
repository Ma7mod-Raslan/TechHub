import os
import json
import re
import time
import numpy as np
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
from spellchecker import SpellChecker
from ollama import chat


# ---------------- CONFIGURATION ----------------
DATA_DIR = "data"
META_PATH = os.path.join(DATA_DIR, "meta_items.json")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")

EMBED_MODEL = "multi-qa-mpnet-base-dot-v1"
RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

TOP_K = 5
SIM_THRESHOLD = 0.65


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

index = faiss.read_index(FAISS_INDEX_PATH)
embed_model = SentenceTransformer(EMBED_MODEL)

try:
    reranker = CrossEncoder(RERANKER_MODEL)
except Exception:
    reranker = None


# ---------------- REWRITE FUNCTION ----------------
def rewrite_answer(user_question, retrieved_answer):
    start_llm = time.time()

    response = chat(
        model="qwen2.5:1.5b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant. "
                    "Rewrite the answer so it directly and clearly responds "
                    "to the user's question. Do not add new information."
                )
            },
            {
                "role": "user",
                "content": f"User Question: {user_question}\n\nRetrieved Answer: {retrieved_answer}"
            }
        ],
        options={
            "temperature": 0.3,
            "num_predict": 150
        }
    )

    llm_time = time.time() - start_llm
    print(f"\n⏱ LLM Response Time: {llm_time:.3f} sec")

    return response["message"]["content"], llm_time


# ---------------- MAIN SEARCH LOGIC ----------------
def chatbot_response(user_text):

    total_start = time.time()

    print("\n==============================")
    print("📥 Original Question:", user_text)

    q = preprocess_text(user_text)
    print("🔄 After Preprocessing:", q)

    # -------- Retrieval --------
    start_search = time.time()

    q_emb = embed_model.encode([q]).astype("float32")
    faiss.normalize_L2(q_emb)
    scores, idxs = index.search(q_emb, TOP_K)

    search_time = time.time() - start_search
    print(f"\n⏱ Retrieval Time: {search_time:.3f} sec")

    print("\n🔎 FAISS Scores:", scores)
    print("🔎 FAISS Indices:", idxs)

    candidates = []
    for sc, idx in zip(scores[0], idxs[0]):
        entry = ITEMS[idx]
        candidates.append({
            "id": entry["id"],
            "full_answer": entry["full_answer"],
            "score": float(sc)
        })

    print("\n📌 Top Candidates:")
    for c in candidates:
        print(f"ID: {c['id']} | Embedding Score: {c['score']:.4f}")
        print("Answer Preview:", c["full_answer"][:100], "\n")

    if not candidates:
        return {"answer": "I don't have enough information to answer that."}

    # -------- Guard by Embedding --------
    best_embedding = candidates[0]

    if best_embedding["score"] < SIM_THRESHOLD:
        print("❌ Rejected by SIM_THRESHOLD")
        return {"answer": "I don't have enough information to answer that."}

    # -------- Rerank (ordering only) --------
    if reranker is not None:
        pairs = [(q, c["full_answer"]) for c in candidates]
        rerank_scores = reranker.predict(pairs).tolist()

        print("\n📊 Reranker Scores:")
        for c, s in zip(candidates, rerank_scores):
            c["rerank_score"] = float(s)
            print(f"ID: {c['id']} | Rerank Score: {s:.4f}")

        candidates = sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)

    best = candidates[0]

    print("\n✅ Selected Answer Before Rewrite:")
    print(best["full_answer"])

    # -------- LLM Rewrite --------
    final_answer, llm_time = rewrite_answer(user_text, best["full_answer"])

    total_time = time.time() - total_start

    print("\n🤖 Final Answer After Rewrite:")
    print(final_answer)

    print(f"\n⏱ Total Processing Time: {total_time:.3f} sec")
    print("==============================\n")

    return {
        "answer": final_answer,
        "embedding_score": best["score"],
        "total_time": total_time,
        "llm_time": llm_time,
        "retrieval_time": search_time
    }


# ---------------- CLI TEST ----------------
if __name__ == "__main__":
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            break

        response = chatbot_response(user_input)
        print("Bot:", response["answer"])
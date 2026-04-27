import os
import re
import json
import time

import faiss
import numpy as np
from groq import Groq
from spellchecker import SpellChecker
from sentence_transformers import SentenceTransformer, CrossEncoder
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

# ======================== CONFIG ========================

DATA_DIR = "data"
PATHS = {
    "qa_meta":   os.path.join(DATA_DIR, "meta_items.json"),
    "qa_faiss":  os.path.join(DATA_DIR, "faiss.index"),
    "vid_meta":  os.path.join(DATA_DIR, "video_meta.json"),
    "vid_faiss": os.path.join(DATA_DIR, "video_faiss.index"),
}

EMBED_MODEL_NAME    = "multi-qa-mpnet-base-dot-v1"
RERANKER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
LLM_MODEL    = "llama-3.3-70b-versatile"
TOP_K = 5

THRESHOLDS = {
    "qa_sim": 0.50, "vid_sim": 0.45,
    "qa_rerank": -5.0, "vid_rerank": -5.0,
    "margin": 0.08,
}

REJECTION = {
    "no_data":      "I'm sorry, I don't have information about that topic in my current database. Please try different keywords or contact TechHub Support.",
    "bad_question":  "I couldn't understand your question. Could you please rephrase it? You can ask about courses, assignments, account settings, or topics like HTML, Python, or SQL.",
    "no_match":      "I found some information but it doesn't match your question. Could you try rephrasing? I can help with TechHub courses, assignments, account management, or certificates.",
    "not_relevant":  "I don't have information about that. I can only help with TechHub-related topics like courses, assignments, account settings, and course content.",
}

PROTECTED_WORDS = {
    "techhub", "signup", "signin", "fullstack", "nodejs", "cplusplus",
    "csharp", "dotnet", "flexbox", "mongodb", "mysql", "postgresql",
    "postman", "selenium", "django", "github", "npm", "oop", "nlp",
    "html", "css", "sql", "api", "json", "xml", "dom", "div",
    "rgb", "rgba", "hex", "utf", "br", "hr", "src", "href", "alt",
    "h1", "h2", "h3", "h4", "h5", "h6", "cpp", "c++", "c#", "ai",
}

GREETING_PATTERNS = {
    "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
    "good night", "greetings", "sup", "whats up", "howdy", "yo", "hola",
    "thank you", "thanks", "thanks a lot", "thank u", "thx", "ty",
    "bye", "goodbye", "see you", "see you later", "take care", "later",
    "who are you", "what are you", "what can you do", "tell me about you",
    "tell me about yourself", "what is your name", "can you help me",
    "help me", "help", "ok", "okay", "cool", "great", "nice",
    "yes", "no", "sure", "alright", "got it",
    "how can you help", "what can i ask",
}

GREETING_PREFIXES = [
    "tell me about you", "who are you", "what are you", "what can you",
    "can you help", "help me", "thank", "thanks", "bye",
    "good morning", "good evening", "good afternoon", "good night",
    "how can you help", "what can i",
]

spell = SpellChecker()

# ===================== PREPROCESSING =====================

def preprocess_text(text):
    text = re.sub(r"[^a-zA-Z0-9@+#\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def is_gibberish(text):
    cleaned = re.sub(r"[^a-zA-Z\s]", "", text).strip()
    if len(cleaned) < 2:
        return True
    words = cleaned.split()
    if not words or all(len(w) <= 1 for w in words):
        return True
    for w in words:
        if len(w) > 4 and len(set(w.lower())) <= 2:
            return True
    known = sum(1 for w in words if w.lower() in PROTECTED_WORDS or spell.known([w.lower()]))
    ratio = known / len(words)
    return (ratio < 0.3 and len(words) > 1) or (len(words) == 1 and ratio == 0)


def is_short_or_greeting(text):
    cleaned = re.sub(r"[^a-zA-Z\s]", "", text.strip().lower()).strip()
    if cleaned in GREETING_PATTERNS or len(cleaned.split()) <= 2:
        return True
    return any(cleaned.startswith(p) for p in GREETING_PREFIXES)


def matches_greeting(text):
    cleaned = re.sub(r"[^a-zA-Z\s]", "", text.strip().lower()).strip()
    return cleaned in GREETING_PATTERNS or any(cleaned.startswith(p) for p in GREETING_PREFIXES)


# ==================== LOAD RESOURCES ====================

print("📦 Loading data...")
QA_ITEMS    = json.load(open(PATHS["qa_meta"], encoding="utf-8"))
VIDEO_ITEMS = json.load(open(PATHS["vid_meta"], encoding="utf-8"))
qa_index    = faiss.read_index(PATHS["qa_faiss"])
video_index = faiss.read_index(PATHS["vid_faiss"])
embed_model = SentenceTransformer(EMBED_MODEL_NAME)
groq_client = Groq(api_key=GROQ_API_KEY)

try:
    reranker = CrossEncoder(RERANKER_MODEL_NAME)
except Exception:
    reranker = None

print(f"✅ Loaded — QA: {len(QA_ITEMS)} | Video: {len(VIDEO_ITEMS)}")

# ======================= SEARCH =========================

def encode_query(text):
    emb = embed_model.encode([text]).astype("float32")
    faiss.normalize_L2(emb)
    return emb


def search_qa(q_emb):
    scores, idxs = qa_index.search(q_emb, TOP_K)
    return [
        {"source": "qa", "id": QA_ITEMS[i].get("id", ""),
         "answer": QA_ITEMS[i]["full_answer"], "score": float(s), "metadata": QA_ITEMS[i]}
        for s, i in zip(scores[0], idxs[0]) if i >= 0
    ]


def search_video(q_emb):
    scores, idxs = video_index.search(q_emb, TOP_K)
    results = []
    for s, i in zip(scores[0], idxs[0]):
        if i < 0:
            continue
        e = VIDEO_ITEMS[i]
        results.append({
            "source": "video", "score": float(s), "metadata": e,
            "chunk": e["chunk"], "video_title": e["video_title"],
            "course_name": e.get("course_name", ""),
            "chapter_title": e.get("chapter_title", ""),
            "timestamp": e.get("timestamp", ""),
            "video_url_with_time": e.get("video_url_with_time", ""),
            "start_seconds": e.get("start_seconds", 0),
        })
    return results


def decide_best_source(qa_res, vid_res):
    qa_s  = qa_res[0]["score"]  if qa_res  else 0
    vid_s = vid_res[0]["score"] if vid_res else 0
    qa_ok, vid_ok = qa_s >= THRESHOLDS["qa_sim"], vid_s >= THRESHOLDS["vid_sim"]
    margin = THRESHOLDS["margin"]

    print(f"\n📊 QA: {qa_s:.4f} {'✅' if qa_ok else '❌'} | Video: {vid_s:.4f} {'✅' if vid_ok else '❌'}")

    if not qa_ok and not vid_ok:
        return None, "none"
    if qa_ok and not vid_ok:
        return qa_res[0], "qa"
    if vid_ok and not qa_ok:
        return vid_res[0], "video"
    if qa_s >= vid_s + margin:
        return qa_res[0], "qa"
    if vid_s >= qa_s + margin:
        return vid_res[0], "video"
    return qa_res[0], "qa"


def _rerank(query, results):
    """Rerank results without threshold check (sort only)."""
    if not reranker or not results:
        return results
    texts = [r.get("answer") or r.get("chunk") for r in results]
    scores = reranker.predict([(query, t) for t in texts]).tolist()
    for r, s in zip(results, scores):
        r["rerank_score"] = float(s)
    results.sort(key=lambda x: x["rerank_score"], reverse=True)
    return results


def rerank(query, results, source=None):
    """Rerank with optional threshold check."""
    results = _rerank(query, results)
    if not results:
        return results, True

    if source is None:
        return results, True

    best = results[0]["rerank_score"]
    th = THRESHOLDS[f"{'qa' if source == 'qa' else 'vid'}_rerank"]
    passed = best >= th
    print(f"\n🔀 Rerank: {best:.4f} (th: {th}) {'✅' if passed else '❌'}")
    return results, passed

# ========================= LLM =========================

def _call_llm(system, user, max_tokens=100):
    try:
        resp = groq_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=0.3, max_tokens=max_tokens,
        )
        return resp.choices[0].message.content
    except Exception as e:
        print(f"⚠️ Groq API error: {e}")
        return "I'm experiencing a temporary issue. Please try again shortly."


def is_answer_relevant(question, answer):
    result = _call_llm(
        "You are a relevance checker. Does the Retrieved Answer address the User Question? Reply ONLY: YES or NO",
        f"User Question: {question}\n\nRetrieved Answer: {answer}",
        max_tokens=3,
    )
    return "yes" in result.strip().lower()


def _video_ref(r):
    ts = r.get("timestamp", "")
    parts = ts.split(":") if ts else []
    if len(parts) == 2:
        t = f"minute {int(parts[0])}:{int(parts[1]):02d}"
    elif len(parts) == 3:
        h, m, s = map(int, parts)
        t = f"hour {h}:{m:02d}:{s:02d}" if h else f"minute {m}:{s:02d}"
    else:
        m, s = divmod(int(r.get("start_seconds", 0)), 60)
        t = f"minute {m}:{s:02d}"
    ref = f'the video "{r["video_title"]}"'
    if r.get("course_name"):
        ref += f' in the course "{r["course_name"]}"'
    return f"{ref} at {t}"


def rewrite_answer(question, best, source):
    if source == "qa":
        if not is_answer_relevant(question, best["answer"]):
            return REJECTION["not_relevant"]
        return _call_llm(
            "You are TechHub Assistant. Rewrite the answer to directly respond to the user's question.\n"
            "ONLY use facts from the Retrieved Answer. NEVER add new information. Keep under 3 sentences.",
            f"User Question: {question}\n\nRetrieved Answer: {best['answer']}",
            max_tokens=120,
        )
    else:
        if not is_answer_relevant(question, best["chunk"]):
            return REJECTION["not_relevant"]
        ref = _video_ref(best)
        ctx = f"Course: {best.get('course_name','')}\nVideo: {best['video_title']}\n" \
              f"Chapter: {best.get('chapter_title','')}\nTimestamp: {best.get('timestamp','')}\nContent: {best['chunk']}"
        answer = _call_llm(
            f"You are TechHub Assistant. Based ONLY on the Video Content, give a brief answer.\n"
            f"NEVER add info not in the content. End with: '📺 To learn more, go to {ref}'\nKeep under 4 sentences.",
            f"User Question: {question}\n\nVideo Context:\n{ctx}",
            max_tokens=150,
        )
        if best["video_title"] not in answer:
            answer += f"\n\n📺 To learn more, go to {ref}"
        answer = re.sub(r"https?://(?:www\.)?youtube\.com/\S+", "", answer)
        answer = re.sub(r"🔗\s*Watch here:\s*$", "", answer, flags=re.MULTILINE)
        return answer.strip()

# ===================== MAIN CHATBOT =====================

def chatbot_response(user_text):
    t0 = time.time()
    print(f"\n{'='*60}\n📥 Question: {user_text}")

    if not user_text.strip():
        return {"answer": "", "source": "rejected", "rejection_reason": "empty_input", "total_time": 0}

    if is_gibberish(user_text):
        print("🚫 Gibberish")
        return {"answer": REJECTION["bad_question"], "source": "rejected",
                "rejection_reason": "gibberish", "total_time": time.time() - t0}

    # ✅ Greeting Early Return - skip LLM, use reranker to pick best match
    if matches_greeting(user_text):
        print("👋 Greeting detected → FAST path")
        q = preprocess_text(user_text)
        q_emb = encode_query(q)
        qa_res = search_qa(q_emb)
        if qa_res and qa_res[0]["score"] >= 0.40:
            qa_res = _rerank(q, qa_res)
            best = qa_res[0]
            print(f"✅ Greeting matched | Score: {best['score']:.4f} | Rerank: {best.get('rerank_score', 0):.4f}")
            return {
                "answer": best["answer"], "source": "qa", "path": "GREETING",
                "score": best["score"], "rerank_score": best.get("rerank_score"),
                "total_time": time.time() - t0,
            }

    # Full pipeline
    query = preprocess_text(user_text)
    print(f"🔄 Processed: {query}")
    q_emb = encode_query(query)

    t1 = time.time()
    qa_res, vid_res = search_qa(q_emb), search_video(q_emb)
    search_time = time.time() - t1
    print(f"⏱ Retrieval: {search_time:.3f}s")

    for tag, res in [("QA", qa_res), ("VID", vid_res)]:
        for r in res[:3]:
            print(f"  {tag} {r['score']:.4f} | {r.get('answer', r.get('chunk', ''))[:80]}...")

    best, source = decide_best_source(qa_res, vid_res)
    if best is None:
        return {"answer": REJECTION["no_data"], "source": "none",
                "rejection_reason": "below_threshold", "total_time": time.time() - t0}

    is_short = is_short_or_greeting(user_text)
    pool = qa_res if source == "qa" else vid_res

    if is_short:
        print("⚡ Short query → sort-only rerank")
        pool, _ = rerank(query, pool)
        best = pool[0] if pool else best
    else:
        pool, passed = rerank(query, pool, source)
        best = pool[0] if pool else best
        if not passed:
            return {"answer": REJECTION["no_match"], "source": "none",
                    "rejection_reason": "reranker_rejected", "total_time": time.time() - t0}

    path = "FAST" if is_short else "FULL"
    print(f"✅ Source: {source.upper()} | Path: {path}")

    t2 = time.time()
    final = rewrite_answer(user_text, best, source)
    llm_time = time.time() - t2
    total_time = time.time() - t0

    print(f"⏱ LLM: {llm_time:.3f}s | Total: {total_time:.3f}s")
    print(f"🤖 {final}\n{'='*60}")

    resp = {"answer": final, "source": source, "score": best["score"],
            "rerank_score": best.get("rerank_score"), "path": path,
            "total_time": total_time, "llm_time": llm_time, "retrieval_time": search_time}

    if source == "video":
        for k in ("course_name", "video_title", "chapter_title", "timestamp"):
            resp[k] = best.get(k, "")
    return resp

# ======================== CLI ===========================

if __name__ == "__main__":
    print("\n🤖 TechHub Chatbot Ready! Type 'exit' to quit.\n")
    while True:
        inp = input("You: ")
        if inp.lower() in ("exit", "quit"):
            break
        r = chatbot_response(inp)
        tag = r.get("rejection_reason") or f"path: {r.get('path', '')}"
        print(f"\n🤖 [{r['source'].upper()}] ({tag}):\n{r['answer']}\n")
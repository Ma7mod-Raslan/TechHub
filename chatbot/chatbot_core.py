import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
import re
import json
import time
import faiss
import numpy as np
from ollama import chat
from spellchecker import SpellChecker
from sentence_transformers import SentenceTransformer, CrossEncoder

# ========================= CONFIG =========================
DATA_DIR = "data"
PATHS = {
    "qa_meta":    os.path.join(DATA_DIR, "meta_items.json"),
    "qa_faiss":   os.path.join(DATA_DIR, "faiss.index"),
    "vid_meta":   os.path.join(DATA_DIR, "video_meta.json"),
    "vid_faiss":  os.path.join(DATA_DIR, "video_faiss.index"),
}

EMBED_MODEL_NAME    = "multi-qa-mpnet-base-dot-v1"
RERANKER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
LLM_MODEL           = "qwen2.5:1.5b"

THRESHOLDS = {
    "qa_sim": 0.5,   "vid_sim": 0.45,
    "qa_rerank": -10.0, "vid_rerank": -10.0,
    "margin": 0.08,
}
TOP_K = 5

REJECTION = {
    "no_data": (
        "I'm sorry, I don't have information about that topic in my current database. "
        "If you believe this is a TechHub-related question, please try using different "
        "keywords or contact TechHub Support for further assistance."
    ),
    "bad_question": (
        "I couldn't understand your question. Could you please rephrase it more clearly? "
        "For example, you can ask about courses, assignments, account settings, "
        "or specific topics like HTML, Python, or SQL."
    ),
    "no_match": (
        "I found some information but it doesn't seem to match what you're asking about. "
        "Could you try rephrasing your question? You can ask me about TechHub courses, "
        "assignments, account management, certificates, or specific course content."
    ),
}

PROTECTED_WORDS = {
    "techhub", "signup", "dashboard", "certificate", "python", "java",
    "course", "mobile", "login", "logout", "support", "postman",
    "selenium", "ai", "community", "assignment", "account", "register",
    "payment", "track", "sign", "signin", "frontend", "backend",
    "fullstack", "html", "css", "javascript", "react", "nodejs",
    "cplusplus", "csharp", "sql", "django", "github", "nlp", "oop",
    "dotnet", "cpp", "c++", "c#", "heading", "h1", "h2", "h3", "h4",
    "h5", "h6", "tag", "element", "attribute", "dom", "div", "span",
    "paragraph",
}

GREETING_PATTERNS = {
    "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
    "good night", "greetings", "sup", "whats up", "howdy", "yo", "hola",
    "thank you", "thanks", "thanks a lot", "thank u", "thx", "ty",
    "appreciate it", "i appreciate your assistance", "that was helpful",
    "thanks for your help", "bye", "goodbye", "see you", "see you later",
    "have a good day", "see you soon", "good bye", "take care", "later",
    "who are you", "what are you", "what can you do", "tell me about you",
    "tell me about yourself", "what do you do", "tell me what you do",
    "what is your purpose", "what is your name", "can you help me",
    "help me", "help", "what support can you provide",
    "what questions can i ask you", "can you tell me about yourself",
    "ok", "okay", "cool", "great", "nice", "yes", "no", "sure",
    "alright", "got it",
}

GREETING_PREFIXES = [
    "tell me about you", "tell me about your", "who are you",
    "what are you", "what do you", "what can you", "can you help",
    "help me", "thank", "thanks", "bye", "good morning",
    "good evening", "good afternoon", "good night",
]

spell = SpellChecker()


# =================== TEXT PREPROCESSING ===================
def preprocess_text(text):
    text = re.sub(r"[^a-zA-Z0-9@+#\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    words, mapping = text.split(), {}
    for i, w in enumerate(words):
        if w.lower() in PROTECTED_WORDS:
            ph = f"@@P{len(mapping)}@@"
            mapping[ph] = w
            words[i] = ph
    text = " ".join(words)
    corrected = []
    for w in text.split():
        if "@@P" in w or w.lower() in PROTECTED_WORDS:
            corrected.append(w)
        else:
            corrected.append(spell.correction(w) or w)
    text = " ".join(corrected)
    for ph, orig in mapping.items():
        text = text.replace(ph, orig)
    return text


# ================= DETECTION UTILITIES ====================
def is_gibberish(text):
    cleaned = re.sub(r'[^a-zA-Z\s]', '', text).strip()
    if len(cleaned) < 2:
        return True
    words = cleaned.split()
    if not words or all(len(w) <= 1 for w in words):
        return True
    for w in words:
        if len(w) > 4 and len(set(w.lower())) <= 2:
            return True
    real = sum(
        1 for w in words
        if w.lower() in PROTECTED_WORDS or spell.known([w.lower()])
    )
    ratio = real / len(words)
    return (ratio < 0.3 and len(words) > 1) or (len(words) == 1 and ratio == 0)


def is_short_or_greeting(text):
    cleaned = re.sub(r'[^a-zA-Z\s]', '', text.strip().lower()).strip()
    if cleaned in GREETING_PATTERNS or len(cleaned.split()) <= 2:
        return True
    return any(cleaned.startswith(p) for p in GREETING_PREFIXES)


# ================== LOAD RESOURCES ========================
print("📦 Loading data...")
QA_ITEMS    = json.load(open(PATHS["qa_meta"], encoding="utf-8"))
VIDEO_ITEMS = json.load(open(PATHS["vid_meta"], encoding="utf-8"))
qa_index    = faiss.read_index(PATHS["qa_faiss"])
video_index = faiss.read_index(PATHS["vid_faiss"])
embed_model = SentenceTransformer(EMBED_MODEL_NAME)

try:
    reranker = CrossEncoder(RERANKER_MODEL_NAME)
except Exception:
    reranker = None

print(f"✅ Loaded — QA: {len(QA_ITEMS)} | Video: {len(VIDEO_ITEMS)}")


# =================== SEARCH & RANK =======================
def _search_index(index, items, query_emb, build_fn):
    scores, idxs = index.search(query_emb, TOP_K)
    return [
        build_fn(items[i], float(s))
        for s, i in zip(scores[0], idxs[0]) if i >= 0
    ]


def search_qa(q_emb):
    return _search_index(qa_index, QA_ITEMS, q_emb, lambda e, s: {
        "source": "qa", "id": e.get("id", ""),
        "answer": e["full_answer"], "score": s, "metadata": e,
    })


def search_video(q_emb):
    return _search_index(video_index, VIDEO_ITEMS, q_emb, lambda e, s: {
        "source": "video", "score": s, "metadata": e,
        "chunk": e["chunk"], "video_title": e["video_title"],
        **{k: e.get(k, "") for k in (
            "course_name", "chapter_title", "timestamp",
            "video_url_with_time",
        )},
        "start_seconds": e.get("start_seconds", 0),
    })


def decide_best_source(qa_res, vid_res):
    qa_s  = qa_res[0]["score"]  if qa_res  else 0
    vid_s = vid_res[0]["score"] if vid_res else 0
    qa_ok  = qa_s  >= THRESHOLDS["qa_sim"]
    vid_ok = vid_s >= THRESHOLDS["vid_sim"]

    tag = lambda src: print(f"   ➡️ Decision: {src}")
    print(f"\n📊 QA: {qa_s:.4f} {'✅' if qa_ok else '❌'} | "
          f"Video: {vid_s:.4f} {'✅' if vid_ok else '❌'}")

    if not qa_ok and not vid_ok:
        tag("NONE"); return None, "none"
    if qa_ok and not vid_ok:
        tag("QA"); return qa_res[0], "qa"
    if vid_ok and not qa_ok:
        tag("VIDEO"); return vid_res[0], "video"

    margin = THRESHOLDS["margin"]
    if qa_s >= vid_s + margin:
        tag("QA"); return qa_res[0], "qa"
    if vid_s >= qa_s + margin:
        tag("VIDEO"); return vid_res[0], "video"
    tag("QA (tie)"); return qa_res[0], "qa"


def _rerank(query, results):
    if not reranker or not results:
        return results
    texts = [r.get("answer") or r.get("chunk") for r in results]
    scores = reranker.predict([(query, t) for t in texts]).tolist()
    for r, s in zip(results, scores):
        r["rerank_score"] = float(s)
    results.sort(key=lambda x: x["rerank_score"], reverse=True)
    return results


def rerank_with_threshold(query, results, src):
    results = _rerank(query, results)
    if not results:
        return results, True
    best = results[0].get("rerank_score", 0)
    th = THRESHOLDS[f"{'qa' if src == 'qa' else 'vid'}_rerank"]
    passed = best >= th
    print(f"\n🔀 Rerank: {best:.4f} (th: {th}) {'✅' if passed else '❌'}")
    return results, passed


# ==================== FORMATTERS ==========================
def _fmt_time(ts, start_sec=0):
    parts = ts.split(":") if ts else []
    if len(parts) == 2:
        return f"minute {int(parts[0])}:{int(parts[1]):02d}"
    if len(parts) == 3:
        h, m, s = map(int, parts)
        return (f"hour {h}:{m:02d}:{s:02d}" if h else
                f"minute {m}:{s:02d}")
    m, s = divmod(int(start_sec), 60)
    return f"minute {m}:{s:02d}"


def _video_ref(r):
    time_str = _fmt_time(r.get("timestamp", ""), r.get("start_seconds", 0))
    ref = f'the video "{r["video_title"]}"'
    if r.get("course_name"):
        ref += f' in the course "{r["course_name"]}"'
    return f"{ref} at {time_str}"


# =================== LLM REWRITE =========================
def _llm(system, user, max_tokens=150):
    return chat(
        model=LLM_MODEL,
        messages=[{"role": "system", "content": system},
                  {"role": "user",   "content": user}],
        options={"temperature": 0.3, "num_predict": max_tokens},
    )["message"]["content"]


def rewrite_qa(question, answer):
    return _llm(
        "You are TechHub Assistant. Rewrite the answer so it directly and "
        "clearly responds to the user's question. Do not add new information.",
        f"User Question: {question}\n\nRetrieved Answer: {answer}",
    )


def rewrite_video(question, r):
    ref = _video_ref(r)
    ctx = (f"Course: {r.get('course_name','')}\nVideo: {r['video_title']}\n"
           f"Chapter: {r.get('chapter_title','')}\n"
           f"Timestamp: {r.get('timestamp','')}\nContent: {r['chunk']}")

    answer = _llm(
        "You are TechHub Assistant. The user asked about course content. "
        "Based on the video content provided, give a brief helpful answer.\n\n"
        "RULES:\n1. Answer clearly from provided content.\n"
        f"2. End with: '📺 To understand this better, go to {ref}'\n"
        "3. No YouTube links/URLs.\n4. No invented information.",
        f"User Question: {question}\n\nVideo Context:\n{ctx}",
        max_tokens=200,
    )

    if r["video_title"] not in answer:
        answer += f"\n\n📺 To understand this better, go to {ref}"
    answer = re.sub(r'https?://(?:www\.)?youtube\.com/\S+', '', answer)
    answer = re.sub(r'🔗\s*Watch here:\s*$', '', answer, flags=re.MULTILINE)
    return answer.strip()


# =================== MAIN CHATBOT ========================
def chatbot_response(user_text):
    t0 = time.time()
    print(f"\n{'='*60}\n📥 Question: {user_text}")

    # Layer 0: Gibberish
    if is_gibberish(user_text):
        print("🚫 Gibberish")
        return {"answer": REJECTION["bad_question"], "source": "rejected",
                "rejection_reason": "gibberish", "total_time": time.time()-t0}

    # Preprocess & Embed
    q = preprocess_text(user_text)
    print(f"🔄 Processed: {q}")
    q_emb = embed_model.encode([q]).astype("float32")
    faiss.normalize_L2(q_emb)

    # Layer 1: Dual Search
    t1 = time.time()
    qa_res, vid_res = search_qa(q_emb), search_video(q_emb)
    search_time = time.time() - t1
    print(f"⏱ Retrieval: {search_time:.3f}s")

    for tag, res in [("QA", qa_res), ("VID", vid_res)]:
        for r in res[:3]:
            label = r.get("answer", r.get("chunk", ""))[:80]
            print(f"  {tag} {r['score']:.4f} | {label}...")

    best, src = decide_best_source(qa_res, vid_res)
    if best is None:
        return {"answer": REJECTION["no_data"], "source": "none",
                "rejection_reason": "below_threshold",
                "total_time": time.time()-t0}

    # Layer 2: Rerank
    short = is_short_or_greeting(user_text)
    pool = qa_res if src == "qa" else vid_res

    if short:
        print("⚡ Short query → sort-only rerank")
        pool = _rerank(q, pool)
        best = pool[0] if pool else best
    else:
        pool, passed = rerank_with_threshold(q, pool, src)
        best = pool[0] if pool else best
        if not passed:
            return {"answer": REJECTION["no_match"], "source": "none",
                    "rejection_reason": "reranker_rejected",
                    "total_time": time.time()-t0}

    # LLM Rewrite
    path = "FAST" if short else "FULL"
    print(f"✅ Source: {src.upper()} | Path: {path}")
    t2 = time.time()
    final = (rewrite_qa(user_text, best["answer"]) if src == "qa"
             else rewrite_video(user_text, best))
    llm_time = time.time() - t2
    total_time = time.time() - t0

    print(f"⏱ LLM: {llm_time:.3f}s | Total: {total_time:.3f}s")
    print(f"🤖 {final}\n{'='*60}")

    resp = {
        "answer": final, "source": src, "score": best["score"],
        "rerank_score": best.get("rerank_score"),
        "path": path, "total_time": total_time,
        "llm_time": llm_time, "retrieval_time": search_time,
    }
    if src == "video":
        resp.update({k: best.get(k, "") for k in
                     ("course_name", "video_title", "chapter_title", "timestamp")})
    return resp


# ======================== CLI =============================
if __name__ == "__main__":
    print("\n🤖 TechHub Chatbot Ready! Type 'exit' to quit.\n")
    while True:
        inp = input("You: ")
        if inp.lower() in ("exit", "quit"):
            break
        r = chatbot_response(inp)
        tag = r.get("rejection_reason") or f"path: {r.get('path','')}"
        print(f"\n🤖 [{r['source'].upper()}] ({tag}):\n{r['answer']}\n")
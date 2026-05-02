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
ANSWER_MODEL        = "llama-3.3-70b-versatile"   # Strong model for answers
CONTEXT_MODEL       = "llama-3.1-8b-instant"      # Fast model for contextualization
TOP_K = 5

THRESHOLDS = {
    "qa_sim": 0.50, "vid_sim": 0.45,
    "qa_rerank": -5.0, "vid_rerank": -5.0,
    "margin": 0.08,
    "scope": 0.35,
}

REJECTION = {
    "no_data":      "I'm sorry, I don't have information about that topic in my current database. Please try different keywords or contact TechHub Support.",
    "bad_question": "I couldn't understand your question. Could you please rephrase it? You can ask about courses, assignments, account settings, or topics like HTML.",
    "no_match":     "I found some information but it doesn't match your question. Could you try rephrasing? I can help with TechHub courses, assignments, account management, or certificates.",
    "out_of_scope": "I can only help with TechHub-related topics like courses, HTML lessons, assignments, account settings, and certificates.",
}

# Domain anchors for scope detection (embedding-based, no LLM)
SCOPE_ANCHORS = [
    "TechHub online learning platform courses and lessons",
    "HTML web development tags elements attributes",
    "user account signup login profile settings",
    "assignments certificates course progress",
]

PROTECTED_WORDS = {
    "techhub", "signup", "signin", "html", "css", "sql", "api", "json",
    "xml", "dom", "div", "br", "hr", "src", "href", "alt", "h1", "h2",
    "h3", "h4", "h5", "h6", "rgb", "hex", "ai",
}

GREETING_PATTERNS = {
    "hi", "hello", "hey", "good morning", "good evening", "good afternoon",
    "good night", "greetings", "howdy", "yo", "hola",
    "thank you", "thanks", "thank u", "thx", "ty",
    "bye", "goodbye", "see you", "take care",
    "who are you", "what are you", "what can you do",
    "tell me about yourself", "what is your name",
    "help", "help me", "ok", "okay", "yes", "no", "sure", "got it",
}

# ==================== INITIALIZATION ====================

print("📦 Loading...")
spell = SpellChecker()
QA_ITEMS    = json.load(open(PATHS["qa_meta"], encoding="utf-8"))
VIDEO_ITEMS = json.load(open(PATHS["vid_meta"], encoding="utf-8"))
qa_index    = faiss.read_index(PATHS["qa_faiss"])
video_index = faiss.read_index(PATHS["vid_faiss"])
embed_model = SentenceTransformer(EMBED_MODEL_NAME)
reranker    = CrossEncoder(RERANKER_MODEL_NAME)
groq_client = Groq(api_key=GROQ_API_KEY)

# Pre-compute scope anchor embeddings (one-time cost)
_anchor_embs = embed_model.encode(SCOPE_ANCHORS).astype("float32")
faiss.normalize_L2(_anchor_embs)

print(f"✅ QA: {len(QA_ITEMS)} | Video: {len(VIDEO_ITEMS)}")

# ======================== MEMORY ========================

class ConversationMemory:
    """Stores recent turns for context-aware retrieval. Per-session instance."""
    def __init__(self, max_turns=3):
        self.turns = []
        self.max_turns = max_turns

    def add(self, question, answer):
        self.turns.append({"question": question, "answer": answer})
        if len(self.turns) > self.max_turns:
            self.turns.pop(0)

    def as_text(self, max_answer_chars=150):
        """Format history for LLM prompts."""
        lines = []
        for t in self.turns:
            ans = t["answer"][:max_answer_chars]
            lines.append(f"User: {t['question']}\nAssistant: {ans}")
        return "\n".join(lines)

    def is_empty(self):
        return not self.turns

    def clear(self):
        self.turns = []


# ======================== UTILS =========================

def preprocess(text):
    text = re.sub(r"[^a-zA-Z0-9@+#\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


def is_gibberish(text):
    cleaned = re.sub(r"[^a-zA-Z\s]", "", text).strip()
    if len(cleaned) < 2:
        return True
    words = cleaned.split()
    if not words or all(len(w) <= 1 for w in words):
        return True
    if any(len(w) > 4 and len(set(w.lower())) <= 2 for w in words):
        return True
    known = sum(1 for w in words if w.lower() in PROTECTED_WORDS or spell.known([w.lower()]))
    ratio = known / len(words)
    return (ratio < 0.3 and len(words) > 1) or (len(words) == 1 and ratio == 0)


def is_greeting(text):
    cleaned = re.sub(r"[^a-zA-Z\s]", "", text.strip().lower()).strip()
    if cleaned in GREETING_PATTERNS:
        return True
    return any(cleaned.startswith(g) for g in GREETING_PATTERNS if len(g) > 4)


# ======================== LLM ===========================

def call_llm(system, user, model=ANSWER_MODEL, max_tokens=150, temperature=0.3):
    try:
        resp = groq_client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
            temperature=temperature, max_tokens=max_tokens,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"⚠️ LLM error: {e}")
        return None


# ============== QUERY CONTEXTUALIZATION =================

CONTEXTUALIZER_SYSTEM = (
    "Given the chat history and the latest user question, formulate a standalone question "
    "that can be understood without the chat history. Resolve all pronouns (it, this, that, they) "
    "and references to previous topics. If the question is already standalone, return it unchanged. "
    "Output ONLY the reformulated question, nothing else."
)


def contextualize(query, memory):
    """
    Rewrite query as standalone using chat history.
    Returns (standalone_query, was_rewritten).
    Skips LLM call when not needed.
    """
    # Skip conditions (no LLM call)
    if memory.is_empty():
        return query, False
    if len(query.split()) >= 10:  # Long queries are usually self-contained
        return query, False

    history = memory.as_text(max_answer_chars=120)
    user_msg = f"Chat History:\n{history}\n\nLatest Question: {query}\n\nStandalone Question:"

    result = call_llm(CONTEXTUALIZER_SYSTEM, user_msg,
                      model=CONTEXT_MODEL, max_tokens=60, temperature=0)
    if not result:
        return query, False

    # Strip quotes/artifacts
    standalone = re.sub(r'^["\'\s]+|["\'\s]+$', '', result)
    rewritten = standalone.lower() != query.lower()
    return standalone, rewritten


# =================== SCOPE DETECTION ====================

def in_scope(query):
    """Check if query is about TechHub domain (embedding similarity)."""
    q_emb = embed_model.encode([query]).astype("float32")
    faiss.normalize_L2(q_emb)
    max_sim = float((q_emb @ _anchor_embs.T).max())
    return max_sim >= THRESHOLDS["scope"], max_sim


# ======================= SEARCH =========================

def encode_query(text):
    emb = embed_model.encode([text]).astype("float32")
    faiss.normalize_L2(emb)
    return emb


def search_qa(q_emb):
    scores, idxs = qa_index.search(q_emb, TOP_K)
    return [{"source": "qa", "answer": QA_ITEMS[i]["full_answer"],
             "score": float(s), "metadata": QA_ITEMS[i]}
            for s, i in zip(scores[0], idxs[0]) if i >= 0]


def search_video(q_emb):
    scores, idxs = video_index.search(q_emb, TOP_K)
    out = []
    for s, i in zip(scores[0], idxs[0]):
        if i < 0:
            continue
        e = VIDEO_ITEMS[i]
        out.append({
            "source": "video", "score": float(s), "chunk": e["chunk"],
            "video_title": e["video_title"],
            "course_name": e.get("course_name", ""),
            "chapter_title": e.get("chapter_title", ""),
            "timestamp": e.get("timestamp", ""),
            "start_seconds": e.get("start_seconds", 0),
        })
    return out


def select_best(qa_res, vid_res):
    qa_s  = qa_res[0]["score"]  if qa_res  else 0
    vid_s = vid_res[0]["score"] if vid_res else 0
    qa_ok  = qa_s  >= THRESHOLDS["qa_sim"]
    vid_ok = vid_s >= THRESHOLDS["vid_sim"]
    margin = THRESHOLDS["margin"]

    print(f"📊 QA: {qa_s:.3f} {'✅' if qa_ok else '❌'} | Video: {vid_s:.3f} {'✅' if vid_ok else '❌'}")

    if not qa_ok and not vid_ok:
        return None, None
    if qa_ok and not vid_ok:        return qa_res,  "qa"
    if vid_ok and not qa_ok:        return vid_res, "video"
    if qa_s >= vid_s + margin:      return qa_res,  "qa"
    if vid_s >= qa_s + margin:      return vid_res, "video"
    return qa_res, "qa"


def rerank(query, results, source):
    if not results:
        return results, False
    texts = [r.get("answer") or r["chunk"] for r in results]
    scores = reranker.predict([(query, t) for t in texts]).tolist()
    for r, s in zip(results, scores):
        r["rerank_score"] = float(s)
    results.sort(key=lambda x: x["rerank_score"], reverse=True)

    th = THRESHOLDS[f"{'qa' if source == 'qa' else 'vid'}_rerank"]
    passed = results[0]["rerank_score"] >= th
    print(f"🔀 Rerank: {results[0]['rerank_score']:.3f} {'✅' if passed else '❌'}")
    return results, passed


# ==================== ANSWER GENERATION =================

def video_reference(r):
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


ANSWER_SYSTEM_QA = (
    "You are TechHub Assistant. Answer the user's question using ONLY the Retrieved Answer below. "
    "Never add facts that aren't in the source. Keep responses under 3 sentences and natural."
)

ANSWER_SYSTEM_VIDEO = (
    "You are TechHub Assistant. Answer using ONLY the Video Content below. "
    "Never add facts that aren't in the content. Keep responses under 4 sentences. "
    "End with: '📺 To learn more, go to {ref}'"
)


def generate_answer(original_query, standalone_query, best, source):
    """Generate final answer. Uses standalone query for grounding, original for tone."""
    if source == "qa":
        user_msg = (
            f"User Question: {standalone_query}\n\n"
            f"Retrieved Answer: {best['answer']}"
        )
        return call_llm(ANSWER_SYSTEM_QA, user_msg, max_tokens=120)

    ref = video_reference(best)
    ctx = (f"Course: {best.get('course_name','')}\n"
           f"Video: {best['video_title']}\n"
           f"Chapter: {best.get('chapter_title','')}\n"
           f"Content: {best['chunk']}")
    user_msg = f"User Question: {standalone_query}\n\nVideo Content:\n{ctx}"
    answer = call_llm(ANSWER_SYSTEM_VIDEO.format(ref=ref), user_msg, max_tokens=160)

    if answer and best["video_title"] not in answer:
        answer += f"\n\n📺 To learn more, go to {ref}"
    return answer


# ===================== MAIN PIPELINE ====================

def respond(text, memory):
    """
    Main entry point. Generates a response for the user's message.
    
    Args:
        text: User's message
        memory: ConversationMemory instance (per-session)
    
    Returns:
        dict with answer, source, time, and metadata
    """
    t0 = time.time()
    print(f"\n{'='*60}\n📥 {text}")

    # Stage 1: Input validation
    if not text.strip():
        return _result("", "rejected", t0, reason="empty")
    if is_gibberish(text):
        return _result(REJECTION["bad_question"], "rejected", t0, reason="gibberish")

    # Stage 2: Greeting fast path (no retrieval, no LLM)
    if is_greeting(text):
        q_emb = encode_query(preprocess(text))
        qa_res = search_qa(q_emb)
        if qa_res and qa_res[0]["score"] >= 0.40:
            qa_res, _ = rerank(preprocess(text), qa_res, "qa")
            return _result(qa_res[0]["answer"], "qa", t0, path="GREETING",
                           score=qa_res[0]["score"])

    # Stage 3: Contextualization (LLM rewrite using history)
    standalone, rewritten = contextualize(text, memory)
    if rewritten:
        print(f"🔄 Standalone: {standalone}")

    # Stage 4: Scope check (embedding-based, no LLM)
    in_domain, scope_sim = in_scope(standalone)
    print(f"🎯 Scope: {scope_sim:.3f} {'✅' if in_domain else '❌'}")
    if not in_domain:
        return _result(REJECTION["out_of_scope"], "rejected", t0, reason="out_of_scope")

    # Stage 5: Retrieval
    q_emb = encode_query(preprocess(standalone))
    qa_res, vid_res = search_qa(q_emb), search_video(q_emb)
    pool, source = select_best(qa_res, vid_res)
    if pool is None:
        return _result(REJECTION["no_data"], "rejected", t0, reason="below_threshold")

    # Stage 6: Rerank
    pool, passed = rerank(standalone, pool, source)
    if not passed:
        return _result(REJECTION["no_match"], "rejected", t0, reason="rerank_failed")
    best = pool[0]

    # Stage 7: Generate answer
    answer = generate_answer(text, standalone, best, source)
    if not answer:
        return _result(REJECTION["no_data"], "rejected", t0, reason="llm_failed")

    # Stage 8: Save to memory
    memory.add(text, answer)

    print(f"⏱ {time.time()-t0:.2f}s | 🤖 {answer[:100]}...")
    return _result(answer, source, t0, path="FOLLOW_UP" if rewritten else "FULL",
                   score=best["score"], rerank=best.get("rerank_score"),
                   metadata=best if source == "video" else None)


def _result(answer, source, t0, **extras):
    out = {"answer": answer, "source": source, "time": round(time.time() - t0, 3)}
    if "metadata" in extras and extras["metadata"]:
        m = extras.pop("metadata")
        for k in ("course_name", "video_title", "chapter_title", "timestamp"):
            out[k] = m.get(k, "")
    out.update({k: v for k, v in extras.items() if v is not None})
    return out


# ========================= CLI ==========================

if __name__ == "__main__":
    print("\n🤖 TechHub Chatbot | 'exit' to quit | 'clear' to reset memory\n")
    cli_memory = ConversationMemory(max_turns=3)
    while True:
        inp = input("You: ").strip()
        if not inp:
            continue
        if inp.lower() in ("exit", "quit"):
            break
        if inp.lower() in ("clear", "reset"):
            cli_memory.clear()
            print("🧹 Memory cleared.\n")
            continue

        r = respond(inp, cli_memory)
        tag = r.get("reason") or r.get("path", "")
        print(f"\n🤖 [{r['source'].upper()} · {tag} · {r['time']}s]\n{r['answer']}\n")
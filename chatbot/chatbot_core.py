import os
import re
import json
import time
import faiss
from groq import Groq
from spellchecker import SpellChecker
from sentence_transformers import SentenceTransformer, CrossEncoder
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing. Please add it to your .env file.")
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

# Config
DATA_DIR = "data"
PATHS = {
    "qa_meta":   os.path.join(DATA_DIR, "meta_items.json"),
    "qa_faiss":  os.path.join(DATA_DIR, "faiss.index"),
    "vid_meta":  os.path.join(DATA_DIR, "video_meta.json"),
    "vid_faiss": os.path.join(DATA_DIR, "video_faiss.index"),
}

EMBED_MODEL_NAME    = "multi-qa-mpnet-base-dot-v1"
RERANKER_MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
ANSWER_MODEL        = "llama-3.3-70b-versatile"   
CONTEXT_MODEL       = "llama-3.1-8b-instant"      
TOP_K = 5

THRESHOLDS = {
    # High confidence
    "qa_sim": 0.50,
    "vid_sim": 0.45,

    # Medium confidence
    "qa_soft": 0.30,
    "vid_soft": 0.25,

    # CrossEncoder scores can be negative, so this threshold is intentionally low
    "qa_rerank": -5.0,
    "vid_rerank": -5.0,

    # Difference required to confidently choose QA or video
    "margin": 0.08
}

REJECTION = {
    "gibberish":
        "I couldn't clearly understand your question. Please rephrase it in English.",
    "below_threshold":
        "I couldn't find reliable enough information related to your question in the TechHub database.",
    "domain_validation_failed":
        "The retrieved information does not closely match your request.",
    "soft_rag_failed":
        "I couldn't generate a reliable educational answer from the available information.",
    "rerank_failed":
        "I found related information, but it wasn't accurate enough to answer confidently.",
    "llm_failed":
        "Something went wrong while generating the answer. Please try again later.",
}

PROTECTED_WORDS = {
    "techhub", "signup", "signin", "html", "css", "sql", "api", "json",
    "xml", "dom", "div", "br", "hr", "src", "href", "alt", "h1", "h2",
    "h3", "h4", "h5", "h6", "rgb", "hex", "ai", "javascript",
    "python", "cpp", "c++", "c"
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

# Init
print("Loading...")
spell = SpellChecker()
for name, path in PATHS.items():
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Required file missing: {name} -> {path}. Please run the data pipelines first."
        )

with open(PATHS["qa_meta"], encoding="utf-8") as f:
    QA_ITEMS = json.load(f)

with open(PATHS["vid_meta"], encoding="utf-8") as f:
    VIDEO_ITEMS = json.load(f)

qa_index = faiss.read_index(PATHS["qa_faiss"])
video_index = faiss.read_index(PATHS["vid_faiss"])
try:
    embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    reranker = CrossEncoder(RERANKER_MODEL_NAME)
except Exception as e:
    raise RuntimeError(
        "Failed to load local HuggingFace models. Make sure the embedding and reranker models are downloaded before running offline."
    ) from e
groq_client = Groq(api_key=GROQ_API_KEY)

print(f"QA: {len(QA_ITEMS)} | Video: {len(VIDEO_ITEMS)}")

# Memory
class ConversationMemory:
    """Store recent chat history."""
    def __init__(self, max_turns=3):
        self.turns = []
        self.max_turns = max_turns

    def add(self, question, answer):
        self.turns.append({"question": question, "answer": answer})
        if len(self.turns) > self.max_turns:
            self.turns.pop(0)

    def as_text(self, max_answer_chars=150):
        """Format chat history."""
        lines = []
        for t in self.turns:
            ans = t["answer"][:max_answer_chars]
            lines.append(f"User: {t['question']}\nAssistant: {ans}")
        return "\n".join(lines)

    def is_empty(self):
        return not self.turns

    def clear(self):
        self.turns = []

# Utils
def normalize_greeting_key(text):
    return re.sub(r"[^a-zA-Z\s]", "", text.strip().lower()).strip()


def preprocess(text):
    text = re.sub(r"[^a-zA-Z0-9@+#\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()

def contains_arabic(text):
    return bool(re.search(r"[\u0600-\u06FF]", text))

def is_gibberish(text):
    raw = text.strip().lower()
    raw_clean = re.sub(r"[^a-zA-Z0-9+#]+", "", raw)

    if raw in PROTECTED_WORDS or raw_clean in PROTECTED_WORDS:
        return False

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
    return (
    cleaned in GREETING_PATTERNS
    or any(
        cleaned == g
        for g in GREETING_PATTERNS
        if len(g) > 4
    )
)
QA_TOPIC_LOOKUP = {
    normalize_greeting_key(item.get("topic", "")): {
        "topic": item.get("topic", ""),
        "answer": item.get("full_answer", "")
    }
    for item in QA_ITEMS
    if item.get("topic")
}

# LLM
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
        print(f"LLM error: {e}")
        return None


# Context
CONTEXTUALIZER_SYSTEM = """
    You rewrite follow-up questions into standalone questions ONLY when necessary.

    Rules:
    - If the latest user question is already clear and standalone, return it unchanged.
    - If the latest question introduces a new topic, return it unchanged.
    - If the latest question is vague (for example: "tell me more", "explain more", "why", "how"), use the most recent technical topic from the conversation.
    - ONLY use chat history when the latest question truly depends on previous context.
    - NEVER force the previous topic into a new unrelated question.
    - NEVER assume the user still means the previous topic unless clearly implied.
    - Output ONLY the final standalone question.
    """
DOMAIN_VALIDATOR_SYSTEM = """
You are a strict validator for the TechHub educational assistant.

The assistant supports:
- TechHub platform questions
- programming learning
- coding concepts
- web development
- computer science learning

You will receive:
1. User question
2. Retrieved answer or retrieved content

Your task:
Determine whether the retrieved content truly belongs to the same domain and correctly answers the user's question.

Rules:
- If the question mentions another platform, company, or service unrelated to TechHub, return INVALID.
- If the retrieved answer is about TechHub but the user asked about another platform, return INVALID.
- If the user asks about a specific technology, topic, course, tool, certificate, or learning area (for example: AI, Flutter, DevOps, Cybersecurity), the retrieved content must explicitly mention the same topic.
- If the retrieved content discusses a general TechHub feature but does not explicitly mention the specific requested technology, specialization, roadmap, or certificate, return INVALID.
- If the retrieved content only partially matches the user's request, return INVALID.
- Only return VALID if the retrieved answer genuinely matches the user's intent and domain.

You MUST return exactly one word.

VALID
or
INVALID

Do not explain.
Do not add punctuation.
Do not add extra text.
"""
def contextualize(query, memory):
    """Rewrite question using chat history."""
   # Skip unnecessary rewrite
    if memory.is_empty():
        return query, False

    history = memory.as_text(max_answer_chars=120)
    user_msg = f"Chat History:\n{history}\n\nLatest Question: {query}\n\nStandalone Question:"

    result = call_llm(CONTEXTUALIZER_SYSTEM, user_msg,
                      model=CONTEXT_MODEL, max_tokens=60, temperature=0)
    if not result:
        return query, False

    # Clean output
    standalone = re.sub(r'^["\'\s]+|["\'\s]+$', '', result)
    rewritten = standalone.lower() != query.lower()
    return standalone, rewritten


# Search
def encode_query(text):
    emb = embed_model.encode([text]).astype("float32")
    faiss.normalize_L2(emb)
    return emb


def search_qa(q_emb):
    scores, idxs = qa_index.search(q_emb, TOP_K)
    return [{
        "source": "qa",
        "topic": QA_ITEMS[i].get("topic", ""),
        "answer": QA_ITEMS[i]["full_answer"],
        "score": float(s),
        "metadata": QA_ITEMS[i]
    } for s, i in zip(scores[0], idxs[0]) if i >= 0]


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

    qa_s  = qa_res[0]["score"] if qa_res else 0
    vid_s = vid_res[0]["score"] if vid_res else 0

    # HIGH
    qa_high = qa_s >= THRESHOLDS["qa_sim"]
    vid_high = vid_s >= THRESHOLDS["vid_sim"]

    # SOFT
    qa_soft = qa_s >= THRESHOLDS["qa_soft"]
    vid_soft = vid_s >= THRESHOLDS["vid_soft"]

    margin = THRESHOLDS["margin"]

    print(
        f"QA={qa_s:.3f} | VIDEO={vid_s:.3f}",
        flush=True
    )

    # ================= HIGH =================

    if qa_high and not vid_high:
        return qa_res, "qa", "high"

    if vid_high and not qa_high:
        return vid_res, "video", "high"

    if qa_high and vid_high:
        if qa_s >= vid_s + margin:
            return qa_res, "qa", "high"
        if vid_s >= qa_s + margin:
            return vid_res, "video", "high"

        return qa_res, "qa", "high"

    # ================= SOFT =================

    if qa_soft and not vid_soft:
        return qa_res, "qa", "soft"

    if vid_soft and not qa_soft:
        return vid_res, "video", "soft"

    if qa_soft and vid_soft:
        if qa_s >= vid_s:
            return qa_res, "qa", "soft"
        return vid_res, "video", "soft"

    # ================= FAIL =================

    return None, None, "fail"


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
    print(f"Rerank: {results[0]['rerank_score']:.3f} {'OK' if passed else 'FAIL'}")    
    return results, passed

def validate_domain(query, best, source):
    """Validate retrieved result against user query."""

    if source == "qa":
        retrieved = best.get("answer", "")
    else:
        retrieved = best.get("chunk", "")

    user_msg = f"""
User Question:
{query}

Retrieved Content:
{retrieved}
"""

    result = call_llm(
        DOMAIN_VALIDATOR_SYSTEM,
        user_msg,
        model=CONTEXT_MODEL,
        max_tokens=3,
        temperature=0
    )

    if not result:
        return False

    result = result.strip().upper()

    print(f"Domain Validation Raw: {result}")

    if result == "VALID":
        return True

    if result == "INVALID":
        return False

    return False
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
    "You are TechHub Assistant. "
    "Answer the user's question using ONLY the Retrieved Contexts below. "
    "You may combine information from multiple contexts. "
    "Never invent facts not present in the contexts. "
    "Keep responses natural and concise. "
    "If the answer is not clearly supported by the contexts, reply with EXACTLY: "
    "NOT_ENOUGH_INFORMATION"
)

ANSWER_SYSTEM_VIDEO = (
    "You are TechHub Assistant. Answer using ONLY the Video Content below. "
    "Never add facts that aren't in the content. Keep responses under 4 sentences. "
    "End with: ' To learn more, go to {ref}'"
)
SOFT_RAG_SYSTEM = """
    You are TechHub Assistant.

    You will receive:
    1. User question
    2. Retrieved context from TechHub database

    Task:
    - If the context is enough to answer the question, generate a helpful educational answer.
    - You may provide simple beginner-level explanations ONLY if they are directly supported by the retrieved context.
    - Do not assume missing technologies, features, certificates, or courses unless explicitly mentioned in the context.
    - If the retrieved context does not clearly support a useful educational answer, reply with EXACTLY:
    NOT_ENOUGH_INFORMATION

    Rules:
    - Do not explain why information is insufficient.
    - Do not mention missing context.
    - Do not describe retrieval limitations.
    - NEVER invent TechHub platform features.
    - Primarily rely on the provided context.
    """
EDUCATIONAL_FALLBACK_SYSTEM = """
    You are TechHub Educational Assistant.

    TechHub is an educational programming platform.

    You will receive a student's question.

    Your task:
    - ONLY answer questions related to programming, computer science, software development, coding, web development, or learning on TechHub.
    - If the question is suitable for beginner or intermediate programming students, answer helpfully.
    - You may answer general beginner and intermediate programming or computer science learning questions even if they are not in the database.
    - NEVER claim that TechHub offers a course, feature, certificate, tool, or service unless it was explicitly provided in retrieved context.
    - If the user asks whether TechHub has a specific course, feature, tool, certificate, or service that is not confirmed by retrieved data, reply exactly:
    NOT_CONFIRMED
    - If the question is outside programming, computer science, software learning, or TechHub educational support, reply exactly:
    OUT_OF_SCOPE
    - If the question is highly specialized or unrelated to beginner/intermediate educational support, reply exactly:
    OUT_OF_SCOPE

    Rules:
    - ALL responses must be written in English only.
    - Never answer in Arabic.
    - Keep answers concise and educational.
    - Never invent TechHub platform features.
    - Keep answers aligned with the role of an educational platform assistant, not a general chatbot.
    - Prefer answers that guide the student to learn through TechHub courses, lessons, roadmaps, or platform learning paths when relevant.
    - Prefer interpreting unclear technical questions using beginner programming and HTML terminology first.
    """
def educational_fallback(query):

    answer = call_llm(
        EDUCATIONAL_FALLBACK_SYSTEM,
        query,
        model=ANSWER_MODEL,
        max_tokens=180,
        temperature=0.3
    )

    if not answer:
        return None

    if answer.strip().upper() in ["OUT_OF_SCOPE", "NOT_CONFIRMED"]:
        return None

    return answer.strip()
def generate_soft_answer(query, results, source):

    contexts = []

    for i, r in enumerate(results[:5], start=1):

        if source == "qa":
            ctx = r["answer"]

        else:
            ctx = (
                f"Video: {r['video_title']}\n"
                f"Chapter: {r.get('chapter_title', '')}\n"
                f"Content: {r['chunk']}"
            )

        contexts.append(
            f"Similarity Score: {r['score']:.3f}\n"
            f"Rerank Score: {r.get('rerank_score', 0):.3f}\n"
            f"Context {i}:\n{ctx}"
        )

    joined = "\n\n".join(contexts)

    user_msg = f"""
        User Question:
        {query}

        Retrieved Context:
        {joined}
        """

    answer = call_llm(
        SOFT_RAG_SYSTEM,
        user_msg,
        max_tokens=180,
        temperature=0.2
    )

    if not answer:
        return None

    if answer.strip().upper() == "NOT_ENOUGH_INFORMATION":
        return None

    return answer.strip()
def generate_answer(standalone_query, contexts, source):
    """Generate final answer. Uses standalone query for grounding, original for tone."""
    if source == "qa":

        joined_contexts = []

        for i, r in enumerate(contexts[:3], start=1):

            joined_contexts.append(
                f"Context {i}:\n"
                f"Topic: {r.get('topic', '')}\n"
                f"Answer: {r['answer']}"
            )

        ctx = "\n\n".join(joined_contexts)

        user_msg = (
            f"User Question:\n{standalone_query}\n\n"
            f"Retrieved Contexts:\n{ctx}"
        )

        return call_llm(
            ANSWER_SYSTEM_QA,
            user_msg,
            max_tokens=150
        )

    joined_contexts = []

    for i, r in enumerate(contexts[:3], start=1):

        joined_contexts.append(
            f"Context {i}:\n"
            f"Course: {r.get('course_name', '')}\n"
            f"Video: {r['video_title']}\n"
            f"Chapter: {r.get('chapter_title', '')}\n"
            f"Content: {r['chunk']}"
        )

    ctx = "\n\n".join(joined_contexts)

    best = contexts[0]
    ref = video_reference(best)

    user_msg = (
        f"User Question:\n{standalone_query}\n\n"
        f"Retrieved Video Contexts:\n{ctx}"
    )

    answer = call_llm(
        ANSWER_SYSTEM_VIDEO.format(ref=ref),
        user_msg,
        max_tokens=180
    )

    if answer and best["video_title"] not in answer:
        answer += f"\n\nTo learn more, go to {ref}"

    return answer

def try_educational_fallback(text, standalone, memory, t0):

    fallback = educational_fallback(standalone)

    if fallback:

        memory.add(text, fallback)

        return _result(
            fallback,
            "llm",
            t0,
            path="EDUCATIONAL_FALLBACK"
        )

    return None
# MAIN PIPELINE 

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
    print(f"\n{'='*60}\n {text}", flush=True)

    # Stage 1: Greeting fast path
    if is_greeting(text):
        cleaned = normalize_greeting_key(text)

        if cleaned in QA_TOPIC_LOOKUP:
            item = QA_TOPIC_LOOKUP[cleaned]
            return _result(
                item["answer"],
                "qa",
                t0,
                path="GREETING",
                matched_topic=item["topic"]
            )

        q_emb = encode_query(preprocess(text))
        qa_res = search_qa(q_emb)
        if qa_res and qa_res[0]["score"] >= 0.40:
            qa_res, _ = rerank(preprocess(text), qa_res, "qa")
            return _result(
                qa_res[0]["answer"],
                "qa",
                t0,
                path="GREETING",
                score=qa_res[0]["score"],
                matched_topic=qa_res[0].get("topic")
            )
    # Stage 1.5: Arabic detection
    if contains_arabic(text):
        return _result(
        "TechHub Assistant currently supports English questions. Please write your question in English so I can help you better.",
        "rejected",
        t0,
        reason="arabic_not_supported"
    )
    # Stage 2: Gibberish detection
    if is_gibberish(text):
        return _result(
    REJECTION["gibberish"],
    "rejected",
    t0,
    reason="gibberish"
            )

    # Stage 3: Contextualization (LLM rewrite using history)
    standalone, rewritten = contextualize(text, memory)
    if rewritten:
        print(f"Standalone: {standalone}")

    # Stage 4: Retrieval
    q_emb = encode_query(preprocess(standalone))
    qa_res, vid_res = search_qa(q_emb), search_video(q_emb)
    pool, source, confidence = select_best(qa_res, vid_res)
    if confidence == "fail":
        print("Retrieval confidence too low, trying educational fallback...")
        fallback_result = try_educational_fallback(
            text,
            standalone,
            memory,
            t0
        )
        
        if fallback_result:
            return fallback_result

        return _result(
            REJECTION["below_threshold"],
            "rejected",
            t0,
            reason="below_threshold"
        )

    # Stage 5: Rerank
    pool, passed = rerank(standalone, pool, source)
    if not passed:
        print("Rerank failed, trying educational fallback...")
        fallback_result = try_educational_fallback(
            text,
            standalone,
            memory,
            t0
        )

        if fallback_result:
            return fallback_result

        return _result(
           REJECTION["rerank_failed"],
            "rejected",
            t0,
            reason="rerank_failed"
        )
    top_contexts = pool[:3]
    best = pool[0]
    # Stage 6: DOMAIN VALIDATION
    if confidence == "high":

        is_valid = validate_domain(
            standalone,
            best,
            source
        )

        if not is_valid:
            return _result(
                REJECTION["domain_validation_failed"],
                "rejected",
                t0,
                reason="domain_validation_failed"
            )
    if source == "qa":
        print(f"Matched QA Topic: {best.get('topic', 'N/A')}")
    else:
        print(f"Matched Video: {best.get('video_title', 'N/A')} | Chapter: {best.get('chapter_title', 'N/A')} | Time: {best.get('timestamp', 'N/A')}")

    # Stage 6.5: SOFT RAG 

    if confidence == "soft":

        answer = generate_soft_answer(
            standalone,
            top_contexts,
            source
        )

        if answer:

            memory.add(text, answer)

            return _result(
                answer,
                source,
                t0,
                path="SOFT_RAG",
                score=pool[0]["score"],
                rerank=pool[0].get("rerank_score")
            )

        print("Soft RAG failed, trying educational fallback...")

        fallback_result = try_educational_fallback(
            text,
            standalone,
            memory,
            t0
        )

        if fallback_result:
            return fallback_result

        return _result(
            REJECTION["soft_rag_failed"],
            "rejected",
            t0,
            reason="soft_rag_failed"
        )
   # Stage 7: Generate answer
    answer = generate_answer(standalone, top_contexts, source)

    if answer and answer.strip().upper() == "NOT_ENOUGH_INFORMATION":

        print("Answer generation returned NOT_ENOUGH_INFORMATION")

        fallback_result = try_educational_fallback(
            text,
            standalone,
            memory,
            t0
        )

        if fallback_result:
            return fallback_result

        return _result(
            REJECTION["below_threshold"],
            "rejected",
            t0,
            reason="not_enough_information"
        )

    if not answer:
        return _result(
            REJECTION["llm_failed"],
            "rejected",
            t0,
            reason="llm_failed"
        )
    # Stage 9: Save to memory
    memory.add(text, answer)

    print(f" {time.time()-t0:.2f}s |  {answer[:100]}...")
    return _result(
        answer,
        source,
        t0,
        path="FOLLOW_UP" if rewritten else "FULL",
        score=best["score"],
        rerank=best.get("rerank_score"),
        matched_topic=best.get("topic") if source == "qa" else None,
        metadata=best if source == "video" else None
    )

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
    print("\n TechHub Chatbot | 'exit' to quit | 'clear' to reset memory\n")
    cli_memory = ConversationMemory(max_turns=3)
    while True:
        inp = input("You: ").strip()
        if not inp:
            continue
        if inp.lower() in ("exit", "quit"):
            break
        if inp.lower() in ("clear", "reset"):
            cli_memory.clear()
            print("Memory cleared.\n")
            continue

        r = respond(inp, cli_memory)
        tag = r.get("reason") or r.get("path", "")
        print(f"\n[{r['source'].upper()} · {tag} · {r['time']}s]\n{r['answer']}\n")
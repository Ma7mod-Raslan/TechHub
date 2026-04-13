# 🤖 TechHub Chatbot

An intelligent chatbot for the **TechHub** educational platform.
It uses **Semantic Search** (FAISS + Sentence Transformers), **Reranking** (Cross-Encoder),
and **LLM Rewriting** (Ollama) to answer student questions from two knowledge sources:

- 📋 **QA Database** — Frequently asked questions & platform guides
- 🎬 **Video Transcripts** — Course content with timestamps & chapter references

---

## 📁 Project Structure

TechHub-Chatbot/
│
├── chatbot_core.py                        # Main chatbot engine (search + rerank + LLM)
├── chatbot_api.py                         # Flask REST API server
├── build_qa_index.py                      # Builds QA FAISS index from qa_data.json
├── build_video_index.py                   # Builds Video FAISS index from transcripts
├── requirements.txt                       # Python dependencies
│
├── qa_data.json                           # QA source data (you provide this)
├── html_transcripts_with_chapters.json    # Video transcripts (you provide this)
│
└── data/                                  # Auto-generated index files
    ├── meta_items.json                    # QA metadata
    ├── faiss.index                        # QA FAISS index
    ├── video_meta.json                    # Video metadata
    ├── video_faiss.index                  # Video FAISS index
    ├── embeddings.npy                     # QA embeddings cache
    └── qa_hash.txt                        # Hash to detect QA data changes

---

## ⚙️ Prerequisites

| Tool           | Purpose                          |
|----------------|----------------------------------|
| Python 3.9+    | Runtime                          |
| Ollama         | Local LLM for answer rewriting   |

Ollama must be installed and running on your machine before starting the chatbot.
Download it from: https://ollama.com

---

## 🚀 Setup & Installation

### 1. Clone the Repository

git clone https://github.com/your-username/TechHub-Chatbot.git
cd TechHub-Chatbot

### 2. Create a Virtual Environment (Recommended)

python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

### 3. Install Dependencies

pip install -r requirements.txt

### 4. Install & Start Ollama

Download Ollama from https://ollama.com then pull the model:

ollama pull qwen2.5:1.5b

Make sure Ollama is running in the background before proceeding.

---

## 🗂️ Prepare Your Data

Place these two files in the project root:

### qa_data.json

[
  {
    "topic": "How to reset my password",
    "answer": "Go to Settings > Account > Reset Password and follow the steps."
  },
  {
    "topic": "How to get a certificate",
    "answer": "Complete all course assignments and pass the final exam with 70% or above."
  }
]

### html_transcripts_with_chapters.json

[
  {
    "video_title": "Introduction to HTML",
    "video_url": "https://www.youtube.com/watch?v=example",
    "youtube_id": "example",
    "course_name": "Frontend Development",
    "description": "Learn the basics of HTML",
    "segments": [
      {
        "text": "HTML stands for HyperText Markup Language...",
        "start_seconds": 0,
        "end_seconds": 120,
        "duration": 120,
        "chapter_title": "What is HTML?",
        "timestamp": "00:00"
      }
    ]
  }
]

---

## 🔨 Build the Indexes

You must build the FAISS indexes before running the chatbot.

### Build QA Index

python build_qa_index.py

To force rebuild even if data has not changed:

python build_qa_index.py --force

### Build Video Index

python build_video_index.py

After building you should see files inside the data/ folder.

---

## 🏃 Run the Chatbot

### Option 1: CLI Mode (Terminal Chat)

python chatbot_core.py

Then type your questions directly:

You: How do I get a certificate?
🤖 Bot [QA] (path: FULL):
Complete all course assignments and pass the final exam...

You: What is an HTML heading?
🤖 Bot [VIDEO] (path: FULL):
An HTML heading is defined with the <h1> to <h6> tags...
📺 To understand this better, go to the video "Introduction to HTML"...

You: exit

### Option 2: API Mode (Flask Server)

python chatbot_api.py

The server runs on http://localhost:5000

#### Send a Question

curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I reset my password?"}'

#### Response Example (QA Source)

{
  "answer": "To reset your password, go to Settings > Account > Reset Password.",
  "source": "qa",
  "score": 0.8234,
  "rerank_score": 2.45,
  "path": "FULL",
  "total_time": 1.23,
  "llm_time": 0.85,
  "retrieval_time": 0.05
}

#### Response Example (Video Source)

{
  "answer": "An HTML heading is defined using tags from <h1> to <h6>...\n\n📺 To understand this better, go to the video \"Introduction to HTML\" in the course \"Frontend Development\" at minute 3:25",
  "source": "video",
  "score": 0.7123,
  "course_name": "Frontend Development",
  "video_title": "Introduction to HTML",
  "chapter_title": "What is HTML?",
  "timestamp": "03:25"
}

---

## 🧠 How It Works

User Question
     │
     ▼
┌─────────────┐
│  Gibberish   │──→ ❌ Reject
│  Detection   │
└──────┬──────┘
       ▼
┌─────────────┐
│  Preprocess  │  (spell check + keyword protection)
│  & Embed     │
└──────┬──────┘
       ▼
┌─────────────────────┐
│  Dual FAISS Search   │
│  (QA + Video index)  │
└──────┬──────────────┘
       ▼
┌─────────────┐
│  Threshold   │──→ ❌ No match
│  Decision    │
└──────┬──────┘
       ▼
┌─────────────┐
│  CrossEncoder│──→ ❌ Low confidence
│  Reranker    │
└──────┬──────┘
       ▼
┌─────────────┐
│  LLM Rewrite │  (Ollama qwen2.5:1.5b)
└──────┬──────┘
       ▼
  Final Answer ✅

---

## 🔧 Configuration

Key settings in chatbot_core.py:

| Setting              | Default                              | Description                     |
|----------------------|--------------------------------------|---------------------------------|
| LLM_MODEL            | qwen2.5:1.5b                        | Ollama model for rewriting      |
| EMBED_MODEL_NAME     | multi-qa-mpnet-base-dot-v1           | Sentence Transformer model      |
| RERANKER_MODEL_NAME  | cross-encoder/ms-marco-MiniLM-L-6-v2| Reranker model                  |
| qa_sim threshold     | 0.50                                 | Minimum QA similarity score     |
| vid_sim threshold    | 0.45                                 | Minimum Video similarity score  |
| TOP_K                | 5                                    | Number of results to retrieve   |

---

## 📝 Quick Start Summary

# 1. Install
pip install -r requirements.txt

# 2. Pull the LLM model
ollama pull qwen2.5:1.5b

# 3. Build indexes
python build_qa_index.py
python build_video_index.py

# 4. Run (pick one)
python chatbot_core.py      # CLI mode
python chatbot_api.py       # API mode on port 5000

---

## 📄 License

This project is for educational purposes as part of the TechHub platform.
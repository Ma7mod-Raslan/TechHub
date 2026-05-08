# 🤖 TechHub Chatbot

An AI-powered educational chatbot built for the TechHub platform to assist students with platform navigation, course guidance, and video-based learning support. The chatbot uses a hybrid RAG architecture that combines semantic search, CrossEncoder reranking, and LLM-based contextualization to deliver accurate and context-aware answers from multiple knowledge sources including platform FAQs and educational video transcripts with timestamped references.

## Features

- Hybrid Retrieval-Augmented Generation (RAG) pipeline
- Semantic search using FAISS and SentenceTransformers
- CrossEncoder reranking for improved retrieval accuracy
- Context-aware conversations with session memory
- Query contextualization using LLM rewriting
- Domain scope filtering and gibberish detection
- Timestamp-aware video retrieval
- Semantic transcript chunking and indexing
- Flask REST API with session management
- Offline embedding and indexing pipelines

## Tech Stack

- Python
- Flask
- FAISS
- SentenceTransformers
- CrossEncoder
- Groq API
- NumPy

## Project Structure

TechHub-Chatbot/
│
├── chatbot_core.py
├── chatbot_api.py
├── build_pipeline.py
├── build_video_pipeline.py
├── requirements.txt
│
├── qa_data.json
├── html_transcripts_with_chapters.json
│
└── data/
    ├── meta_items.json
    ├── faiss.index
    ├── video_meta.json
    ├── video_faiss.index
    ├── embeddings.npy
    └── qa_hash.txt

## Installation

```bash
git clone https://github.com/your-username/TechHub-Chatbot.git
cd TechHub-Chatbot
pip install -r requirements.txt
```

## Build Pipelines

```bash
python build_pipeline.py
python build_video_pipeline.py
```

## API Example

```bash
curl -X POST http://localhost:5001/chat \
-H "Content-Type: application/json" \
-d "{\"message\":\"How do I reset my password?\"}"
```

## Supported Topics

- Courses and Roadmaps
- Assignments and Exams
- Certificates
- Login & Account Management
- HTML Learning Content
- Timestamped Video Explanations

## License

This project was built for educational purposes as part of the TechHub platform.
import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

TRANSCRIPTS_PATH = "html_transcripts_with_chapters.json"
VIDEO_META_PATH = os.path.join(DATA_DIR, "video_meta.json")
VIDEO_FAISS_PATH = os.path.join(DATA_DIR, "video_faiss.index")

EMBED_MODEL = "multi-qa-mpnet-base-dot-v1"

model = SentenceTransformer(EMBED_MODEL)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ".", "!", "?", " "]
)


# ===== تحويل ثواني لـ MM:SS =====
def seconds_to_timestamp(seconds):
    mins = int(seconds) // 60
    secs = int(seconds) % 60
    return f"{mins:02d}:{secs:02d}"


# ===== بناء رابط يوتيوب بالوقت =====
def build_youtube_url_with_time(video_url, start_seconds):
    base_url = video_url.split("&t=")[0]
    if start_seconds > 0:
        return f"{base_url}&t={int(start_seconds)}"
    return base_url


# ===== قراءة الداتا =====
with open(TRANSCRIPTS_PATH, "r", encoding="utf-8") as f:
    transcripts = json.load(f)

print(f"[INFO] Loaded {len(transcripts)} videos")

meta_items = []
texts = []

for video in transcripts:
    video_title = video["video_title"]
    video_url = video["video_url"]
    youtube_id = video.get("youtube_id", "")
    description = video.get("description", "")
    course_name = video.get("course_name", "")          # ← جديد

    for segment in video["segments"]:
        segment_text = segment["text"]
        start_seconds = segment["start_seconds"]
        end_seconds = segment.get("end_seconds", None)
        duration = segment.get("duration", 0)
        chapter_title = segment.get("chapter_title", "")
        timestamp = segment.get("timestamp", seconds_to_timestamp(start_seconds))

        if len(segment_text) > 500:
            chunks = splitter.split_text(segment_text)
        else:
            chunks = [segment_text]

        for chunk in chunks:
            texts.append(chunk)
            meta_items.append({
                "course_name": course_name,              # ← جديد
                "video_title": video_title,
                "video_url": video_url,
                "video_url_with_time": build_youtube_url_with_time(video_url, start_seconds),
                "youtube_id": youtube_id,
                "description": description,
                "chapter_title": chapter_title,
                "timestamp": timestamp,
                "start_seconds": start_seconds,
                "end_seconds": end_seconds,
                "duration": duration,
                "chunk": chunk
            })

print(f"[INFO] Total videos: {len(transcripts)}")
print(f"[INFO] Total segments: {sum(len(v['segments']) for v in transcripts)}")
print(f"[INFO] Total chunks: {len(texts)}")

# ===== عرض ملخص لكل فيديو =====
print("\n📋 Details:")
for video in transcripts:
    seg_count = len(video["segments"])
    chunk_count = sum(
        1 for m in meta_items if m["video_title"] == video["video_title"]
    )
    course = video.get("course_name", "Unknown")         # ← جديد
    print(f"   📹 [{course}] {video['video_title']}: {seg_count} segments → {chunk_count} chunks")

# ===== Embedding =====
print("\n[INFO] Generating embeddings...")
embeddings = model.encode(
    texts,
    batch_size=32,
    show_progress_bar=True,
    convert_to_numpy=True
).astype("float32")

norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
embeddings = embeddings / np.clip(norms, a_min=1e-10, a_max=None)

# ===== FAISS Index =====
dim = embeddings.shape[1]
index = faiss.IndexFlatIP(dim)
index.add(embeddings)

faiss.write_index(index, VIDEO_FAISS_PATH)

with open(VIDEO_META_PATH, "w", encoding="utf-8") as f:
    json.dump(meta_items, f, ensure_ascii=False, indent=2)

print(f"\n[DONE] Video pipeline built!")
print(f"   📦 {len(meta_items)} chunks indexed")
print(f"   💾 FAISS: {VIDEO_FAISS_PATH}")
print(f"   📁 Meta: {VIDEO_META_PATH}")
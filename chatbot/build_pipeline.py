import os, json, hashlib, argparse
import numpy as np
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss

# ---------------- CONFIGURATION ----------------
DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

QA_PATH = "qa_data.json"
META_PATH = os.path.join(DATA_DIR, "meta_items.json")
CHUNK_MAP_PATH = os.path.join(DATA_DIR, "chunk_map.json")
EMBED_PATH = os.path.join(DATA_DIR, "embeddings.npy")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")
HASH_PATH = os.path.join(DATA_DIR, "qa_hash.txt")

EMBED_MODEL = "multi-qa-mpnet-base-dot-v1"
EMBED_BATCH = 32

# Text splitter configuration
splitter = RecursiveCharacterTextSplitter(
    chunk_size=100,
    chunk_overlap=20
)

# ---------------- UTILS ----------------
def md5(path):
    # Calculate MD5 hash of a file to detect data changes
    h = hashlib.md5()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(8192), b""):
            h.update(b)
    return h.hexdigest()

# ---------------- DATA PREPARATION ----------------
def load_and_split():
    # Load raw QA data and split it into embedding-ready chunks
    with open(QA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta_items = []
    flat_chunks = []
    chunk_map = {}
    global_i = 0

    for i, entry in enumerate(data, start=1):
        topic = entry.get("topic", "").strip()
        full_ans = entry.get("answer", "").strip()

        # Topic is included only for embedding to improve semantic matching
        text_for_embedding = f"{topic}. {full_ans}" if topic else full_ans

        chunks = splitter.split_text(text_for_embedding)

        meta_items.append({
            "id": str(i).zfill(3),
            "full_answer": full_ans,   # Stored answer without topic
            "chunks": chunks           # Chunks include topic + answer
        })

        for ch in chunks:
            flat_chunks.append(ch.lower().strip())
            chunk_map[str(global_i)] = str(i).zfill(3)
            global_i += 1

    print(f"✔ Splitting completed: {len(flat_chunks)} chunks")
    return meta_items, flat_chunks, chunk_map

# ---------------- INDEX BUILDING ----------------
def build_index(items, chunks, chunk_map):
    # Generate embeddings and build FAISS index
    model = SentenceTransformer(EMBED_MODEL)

    embeddings = model.encode(
        chunks,
        batch_size=EMBED_BATCH,
        show_progress_bar=True,
        convert_to_numpy=True
    ).astype("float32")

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    np.save(EMBED_PATH, embeddings)
    faiss.write_index(index, FAISS_INDEX_PATH)

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    with open(CHUNK_MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(chunk_map, f)

    print(f"✔ Index Built: {len(chunks)} vectors. dim={dim}")

# ---------------- PIPELINE ENTRY POINT ----------------
def main(force=False):
    if not os.path.exists(QA_PATH):
        raise SystemExit("qa_data.json NOT FOUND!")

    current_hash = md5(QA_PATH)
    old_hash = open(HASH_PATH).read().strip() if os.path.exists(HASH_PATH) else None

    # Skip rebuilding if data has not changed
    if current_hash == old_hash and os.path.exists(FAISS_INDEX_PATH) and not force:
        print("✔ No data change — Skip rebuild")
        return

    items, chunks, chunk_map = load_and_split()
    build_index(items, chunks, chunk_map)

    with open(HASH_PATH, "w") as f:
        f.write(current_hash)

    print("🎯 Pipeline rebuilt successfully!")

# ---------------- CLI ----------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    main(force=args.force)

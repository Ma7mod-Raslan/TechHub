import os , json , hashlib, argparse
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)

QA_PATH = "qa_data.json"
META_PATH = os.path.join(DATA_DIR, "meta_items.json")
EMBED_PATH = os.path.join(DATA_DIR, "embeddings.npy")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss.index")
HASH_PATH = os.path.join(DATA_DIR, "qa_hash.txt")

EMBED_MODEL = "multi-qa-mpnet-base-dot-v1"
EMBED_BATCH = 32

model = SentenceTransformer(EMBED_MODEL)


def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(8192), b""):
            h.update(b)
    return h.hexdigest()


def load_and_split():
    with open(QA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta_items = []
    texts = []

    for i, entry in enumerate(data, start=1):
        topic = entry.get("topic", "").strip()
        full_ans = entry.get("answer", "").strip()

        text_for_embedding = f"{topic}. {full_ans}" if topic else full_ans

        texts.append(text_for_embedding)

        meta_items.append({
            "id": str(i).zfill(3),
            "topic": topic,
            "full_answer": full_ans
        })

    return meta_items, texts


def build_index(items, texts):
    embeddings = model.encode(
        texts,
        batch_size=EMBED_BATCH,
        show_progress_bar=True,
        convert_to_numpy=True
    ).astype("float32")

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / np.clip(norms, a_min=1e-10, a_max=None)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    np.save(EMBED_PATH, embeddings)
    faiss.write_index(index, FAISS_INDEX_PATH)

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def main(force=False):
    if not os.path.exists(QA_PATH):
        raise SystemExit("qa_data.json NOT FOUND!")

    current_hash = md5(QA_PATH)
    old_hash = open(HASH_PATH).read().strip() if os.path.exists(HASH_PATH) else None

    if current_hash == old_hash and os.path.exists(FAISS_INDEX_PATH) and not force:
        print("No data change — Skip rebuild")
        return

    items, texts = load_and_split()
    build_index(items, texts)

    with open(HASH_PATH, "w") as f:
        f.write(current_hash)

    print("Pipeline rebuilt successfully!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    main(force=args.force)

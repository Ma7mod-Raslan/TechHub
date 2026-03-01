import os
import json
import psycopg2
import subprocess
from dotenv import load_dotenv
load_dotenv()

# ---------------- CONFIGURATION ----------------
QA_PATH = "qa_data.json"

# ---------------- DATABASE CONNECTION ----------------
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

# ---------------- LOAD EXISTING QA DATA ----------------
with open(QA_PATH, "r", encoding="utf-8") as f:
    qa_data = json.load(f)

# ---------------- FETCH COURSES FROM DATABASE ----------------
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

cur.execute("""
    SELECT title, level, description
    FROM courses
""")

rows = cur.fetchall()
cur.close()
conn.close()

print(f"[INFO] Loaded {len(rows)} courses from database")

# ---------------- CONVERT COURSES TO QA FORMAT ----------------
for title, level, description in rows:
    topic = f"{title} {level}".strip()

    answer = f"""
Course Title: {title}
Level: {level}

Details:
{description}
""".strip()

    qa_data.append({
        "topic": topic.lower(),
        "answer": answer
    })

print(f"[INFO] Added {len(rows)} courses as Q/A items")

# ---------------- SAVE UPDATED QA DATA ----------------
with open(QA_PATH, "w", encoding="utf-8") as f:
    json.dump(qa_data, f, ensure_ascii=False, indent=2)

print("[OK] qa_data.json updated")

# ---------------- REBUILD FAISS INDEX ----------------
print("[INFO] Rebuilding FAISS index…")
subprocess.run(["python", "build_pipeline.py", "--force"])

print("[DONE] FAISS index rebuilt successfully!")

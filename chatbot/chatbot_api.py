import time
import uuid
from threading import Lock
from flask import Flask, request, jsonify
from flask_cors import CORS

import chatbot_core as core

app = Flask(__name__)
CORS(app)

# Sessions

SESSIONS = {}                   # session_id → {"memory": ..., "last_active": ...}
SESSION_LOCK = Lock()           # Lock access
SESSION_TTL = 30 * 60           # 30 min inactivity → expire


def get_or_create_session(session_id=None):
    """Get or create session."""
    now = time.time()

    with SESSION_LOCK:
        # Remove expired sessions
        expired = [sid for sid, s in SESSIONS.items()
                   if now - s["last_active"] > SESSION_TTL]
        for sid in expired:
            del SESSIONS[sid]

        # Get or create
        if not session_id or session_id not in SESSIONS:
            session_id = session_id or str(uuid.uuid4())
            SESSIONS[session_id] = {
                "memory": core.ConversationMemory(max_turns=3),
                "last_active": now,
            }
        else:
            SESSIONS[session_id]["last_active"] = now

        return session_id, SESSIONS[session_id]["memory"]


# Routes

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "message": "TechHub Chatbot API is running",
        "active_sessions": len(SESSIONS),
    }), 200


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is missing"}), 400

        msg = data.get("message", "").strip()
        if not msg:
            return jsonify({"error": "No message provided"}), 400

        # Session handling
        session_id = data.get("session_id")
        session_id, memory = get_or_create_session(session_id)

        # Generate response
        result = core.respond(msg, memory)
        result["session_id"] = session_id

        return jsonify(result), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/reset", methods=["POST"])
def reset():
    """Reset session memory."""
    try:
        data = request.get_json() or {}
        session_id = data.get("session_id")
        if not session_id:
            return jsonify({"error": "session_id is required"}), 400

        with SESSION_LOCK:
            if session_id in SESSIONS:
                SESSIONS[session_id]["memory"].clear()
                return jsonify({"status": "cleared", "session_id": session_id}), 200

        return jsonify({"error": "Session not found"}), 404

    except Exception as e:
        print(f" Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "active_sessions": len(SESSIONS),
    }), 200


if __name__ == "__main__":
    print(" TechHub Chatbot API on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
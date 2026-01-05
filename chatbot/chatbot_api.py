# chatbot_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import chatbot_core as core
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    msg = data.get("message", "").strip()
    if not msg:
        return jsonify({"error": "no message provided"}), 400
    res = core.chatbot_response(msg)
    # respond with unified structure
    return jsonify(res), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

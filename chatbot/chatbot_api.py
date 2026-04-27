from flask import Flask, request, jsonify
from flask_cors import CORS
import chatbot_core as core

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Chatbot API is running"}), 200


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is missing"}), 400

        msg = data.get("message", "").strip()

        if not msg:
            return jsonify({"error": "No message provided"}), 400

        result = core.chatbot_response(msg)

        if isinstance(result, str):
            result = {"reply": result}

        return jsonify(result), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    print("Chatbot running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
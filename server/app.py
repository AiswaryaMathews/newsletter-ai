from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, jwt, datetime, requests

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')


users = {
    "johndoe1@gmail.com": "admin123",
}

def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route('/api/generate-newsletter', methods=['POST'])
def generate_newsletter():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()
    tone = data.get("tone", "formal").strip().lower()

    if not prompt:
        return jsonify({"error": "Prompt is empty"}), 400

    payload = {
        "model": "mistral",
        "prompt": f"Write a {tone} newsletter based on these key points: {prompt}. The content should be around 50 to 60 words long.",
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        return jsonify({"content": result.get("response", "").strip()})
    except Exception as e:
        print("Error contacting Ollama:", e)
        return jsonify({"error": "Failed to generate newsletter", "details": str(e)}), 500
    
@app.route('/api/beautify', methods=['POST'])
def beautify_keywords():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Text is empty"}), 400

    payload = {
        "model": "mistral",
        "prompt": f"Beautify this content by improving grammar, vocabulary, and clarity:\n\n{text}",
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        beautified_text = result.get("response", "").strip()
        return jsonify({ "beautifiedText": beautified_text })
    except Exception as e:
        print("Error contacting Ollama for beautify:", e)
        return jsonify({ "error": "Failed to beautify text", "details": str(e) }), 500
    
@app.route('/api/generate-image', methods=['POST'])
def generate_image():
    import time

    data = request.get_json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Prompt is empty"}), 400

    # Stable Horde endpoint
    api_url = "https://stablehorde.net/api/v2/generate/async"
    headers = {
        "Content-Type": "application/json",
        "apikey": "0000000000"  # Optional: keep as "0000000000" for anonymous access
    }

    payload = {
        "prompt": prompt,
        "params": {
            "width": 512,
            "height": 512,
            "steps": 20,
            "cfg_scale": 7.5,
            "sampler_name": "k_euler_a",
            "n": 1
        },
        "nsfw": False,
        "models": ["stable_diffusion"]
    }

    try:
        # Submit the image generation job
        submit_resp = requests.post(api_url, json=payload, headers=headers)
        submit_resp.raise_for_status()
        job_data = submit_resp.json()
        job_id = job_data.get("id")

        if not job_id:
            return jsonify({"error": "No job ID received"}), 500

        # Poll the status of the job
        status_url = f"https://stablehorde.net/api/v2/generate/status/{job_id}"
        for _ in range(30):  # Max 30 attempts (~45 seconds)
            status_resp = requests.get(status_url)
            status_data = status_resp.json()

            if status_data.get("done") and status_data.get("generations"):
                image_url = status_data["generations"][0].get("img")
                if image_url:
                    return jsonify({"imageUrl": image_url})
                else:
                    return jsonify({"error": "Image URL missing"}), 500

            time.sleep(1.5)

        return jsonify({"error": "Image generation timed out"}), 504

    except Exception as e:
        print("Error with Stable Horde:", e)
        return jsonify({"error": "Image generation failed", "details": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    if email in users and users[email] == password:
        token = generate_token(email)
        return jsonify({"token": token})
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5001)  
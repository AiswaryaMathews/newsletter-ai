from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os, jwt, datetime, requests
from werkzeug.utils import secure_filename
import base64, uuid

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

users = {
    "johndoe1@gmail.com": "admin123",
}

def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

@app.route("/api/generate-newsletter", methods=["POST"])
def generate_newsletter():
    data = request.get_json()
    prompts = data.get("prompts", [])
    tone = data.get("tone", "formal")

    all_sections = []

    for i, prompt_data in enumerate(prompts):
        try:
            if isinstance(prompt_data, str):
                keywords = prompt_data.strip()
                font_family = "sans-serif"
                bg_color = "#ffffff"
                text_color = "#000000"
            elif isinstance(prompt_data,dict):
                keywords = prompt_data.get("text", "").strip()
                font_family = prompt_data.get("fontFamily", "sans-serif")
                bg_color = prompt_data.get("bgColor", "#ffffff")
                text_color = prompt_data.get("textColor", "#000000")
            else:
                continue  # Skip empty entries

            prompt = (
                f"You are a professional newsletter writer and you are writing the content for a daily company newsletter. "
                f"Write a well-formatted newsletter section based on the keywords: {keywords}. "
                f"Use the tone: {tone}. Include a short title and brief body suitable for a company newsletter. Limit the content to 50-60 words."
            )

            payload = {
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            }

            response = requests.post(OLLAMA_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            content = result.get("response", "").strip()

            section_html = f"""
            <section style="margin-bottom:30px;padding:20px;border:1px solid #ddd;border-radius:8px;
                            background-color:{bg_color};color:{text_color};font-family:{font_family};">
               <h2 style="color:#007BFF;margin-top:0;">{keywords}</h2>
               <p>{content}</p>
            </section>
            """
            all_sections.append(section_html)
        except Exception as e:
            print(f"Failed to generate content for prompt {i+1}: {e}")
            all_sections.append(f"<section>Error generating content for: {keywords}</section>")

    combined_newsletter = "\n".join(all_sections)

    styled_html = f"""
    <div style="background:#f4f4f4;padding:20px;font-family:sans-serif;">
      <header style="background:#007BFF;padding:10px 20px;border-radius:6px 6px 0 0;color:white;">
        <h1 style="margin:0;">Company Newsletter</h1>
      </header>
      <main style="background:white;padding:20px;border-radius:0 0 6px 6px;">
        {combined_newsletter}
      </main>
    </div>
    """

    return jsonify({"content": styled_html})



@app.route('/api/beautify', methods=['POST'])
def beautify_keywords():
    data = request.get_json()
    text = data.get("text", "").strip()
    tone = data.get("tone", "formal")

    if not text:
        return jsonify({"error": "Text is empty"}), 400

    prompt = (
        f"Rewrite the following text using a {tone} tone. Improve grammar, vocabulary, and clarity:\n\n{text}"
    )

    payload = {
        "model": "mistral",
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        beautified_text = result.get("response", "").strip()
        return jsonify({ "beautified": beautified_text })
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

    api_url = "https://stablehorde.net/api/v2/generate/async"
    headers = {
        "Content-Type": "application/json",
        "apikey": "0000000000"
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
        submit_resp = requests.post(api_url, json=payload, headers=headers)
        submit_resp.raise_for_status()
        job_data = submit_resp.json()
        job_id = job_data.get("id")

        if not job_id:
            return jsonify({"error": "No job ID received"}), 500

        status_url = f"https://stablehorde.net/api/v2/generate/status/{job_id}"
        for _ in range(30):
            status_resp = requests.get(status_url)
            status_data = status_resp.json()
            if status_data.get("done") and status_data.get("generations"):
                image_url = status_data["generations"][0].get("img")
                if image_url:
                    image_data = requests.get(image_url).content
                    filename = f"{uuid.uuid4().hex}.png"
                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    with open(filepath, 'wb') as f:
                        f.write(image_data)
                    return jsonify({
                        "imageUrl": f"http://localhost:5001/uploads/{filename}"
                    })
                else:
                    return jsonify({"error": "Image URL missing"}), 500
            time.sleep(1.5)

        return jsonify({"error": "Image generation timed out"}), 504

    except Exception as e:
        print("Error with Stable Horde:", e)
        return jsonify({"error": "Image generation failed", "details": str(e)}), 500


@app.route('/api/upload-template', methods=['POST'])
def upload_template():
    from io import BytesIO
    import fitz

    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    doc = fitz.open(stream=BytesIO(file.read()), filetype="pdf")
    html_parts = []

    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        page_html = ""

        for block in blocks:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    size = span["size"]
                    text = span["text"].strip()
                    if not text:
                        continue
                    if size >= 20:
                        placeholder = "{title}"
                    elif 14 <= size < 20:
                        placeholder = "{heading}"
                    else:
                        placeholder = "{body}"
                    page_html += f"<div style='font-size:{size}px;'>{placeholder}</div>\n"

        html_parts.append(page_html)

    full_html = "\n".join(html_parts)
    return jsonify({ "html": full_html })

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    image_url = f'http://localhost:5001/uploads/{filename}'  # Change domain if deployed
    print(f"Uploaded image saved as: {filename}")
    return jsonify({'image_url': image_url})

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


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

from flask import Flask, request, jsonify, send_from_directory,send_file,jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, jwt, datetime, requests
from werkzeug.utils import secure_filename
import base64, uuid, re, pdfkit

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

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

logo_path = os.path.join(os.path.dirname(__file__), "../NewsletterClient/public/gapblueLogo.png")
with open(logo_path, "rb") as image_file:
    LOGO_BASE64 = "data:image/png;base64," + base64.b64encode(image_file.read()).decode('utf-8')

@app.route("/api/generate-newsletter", methods=["POST"])
def generate_newsletter():
    data = request.get_json()
    prompts = data.get("prompts", [])
    tone = data.get("tone", "formal")

    content_blocks = []

    for i, prompt_data in enumerate(prompts):
        try:
            if isinstance(prompt_data, str):
                keywords = prompt_data.strip()
            elif isinstance(prompt_data, dict):
                keywords = prompt_data.get("text", "").strip()
            else:
                continue  # Skip invalid entries

            prompt = (
                f"You are a professional newsletter writer and you are writing the content for a daily company newsletter. "
                f"Write a well-formatted newsletter section based on the keywords: {keywords}. "
                f"Use the tone: {tone}. Include a short title which must be bold and a brief body suitable for a company newsletter. "
                f"Do not include the words 'title' or 'body' in the output. Limit the content to 50-60 words."
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
            content_blocks.append(content)

        except Exception as e:
            print(f"Failed to generate content for prompt {i+1}: {e}")
            content_blocks.append("Error generating content.")

    # Layout prompt
    layout_prompt = (
    "Design a responsive, professional HTML newsletter layout with a max-width of 790px. Follow these exact instructions:\n"
    "\n"
    "- Use a clean, mobile-responsive layout built only with <div> elements (do not use <table>).\n"
    "- Use a full-width background gradient **only** for the hero section. Choose one of these gradients:\n"
    "    • linear-gradient(to right, #ff0000, #ff7f00, #ffff00)\n"
    "    • linear-gradient(to right, #ff0000, #c80064, #800080)\n"
    "\n"
    "- The hero section (at the top) MUST include actual, visible HTML content — not just structure:\n"
    "    • An <h1> heading with this exact text: 'Introducing Our Latest Features'\n"
    "    • A <p> subtitle with this exact text: 'Explore the tools we’ve launched to enhance your workflow.'\n"
    "    • A CTA button or link with this exact text: 'Learn More'\n"
    "These three elements MUST be present in the HTML, vertically stacked (not in one line), and have black or dark text (#1a1a1a). Do NOT leave them blank or as empty tags.\n"
    "\n"
    "- Add a navigation bar **below the hero section and above the quote section**, centered horizontally. It must:\n"
    "    • Contain 3–5 menu items in a single row\n"
    "    • Use font-size: 18px\n"
    "    • Have a solid background color that complements the hero gradient\n"
    "    • Use visible text color for menu items in both normal and hover states\n"
    "    • Be responsive with flex-wrap or font scaling to avoid overflow beyond 790px\n"
    "\n"
    "- Include a quote/announcement section below the nav bar with a minimum height of 100px. It must:\n"
    "    • Use a complementary background color, using only visible text color which is in accordance with the background color\n"
    "    • Contain a **motivational quote or company announcement** — do not repeat previous quotes\n"
    "    • Ensure proper alignment, padding, and no overflow beyond 790px\n"
    "\n"
    "- Ensure there is NO extra margin or padding between the quote section and the newsletter content section. Remove any extra spacing below the quote section.\n"
    "- Include basic layout structure. Do not include any external image URLs. Leave <img> tags blank if necessary.\n"
    "- All text must use visible dark text colors: #1a1a1a, #2c2c2c, #3a3a3a, or #4b0c0c — NEVER white or light text colors.\n"
    "- All CSS styles must be embedded inside a single <style> tag. No external CSS files.\n"
    "- Do NOT include <html>, <head>, or <body> tags.\n"
    "\n"
    "⚠️ DO NOT include any Markdown formatting.\n"
    "⚠️ DO NOT use triple backticks (```), ```html, or any explanation text.\n"
    "\n"
    "- Ensure the layout is mobile-friendly using max-width: 100%, fluid layouts, and media queries where needed.\n"
    "- Maintain a consistent, {tone.lower()} tone throughout the layout and content.\n"
    "- Return ONLY valid raw HTML — no markdown, no labels, no code blocks."
)



    layout_payload = {
        "model": "mistral",
        "prompt": layout_prompt,
        "stream": False
    }

    try:
        layout_response = requests.post(OLLAMA_URL, json=layout_payload)
        layout_response.raise_for_status()
        layout_result = layout_response.json()
        layout_html = layout_result.get("response", "").strip()
        layout_html = re.sub(r"<\/?(html|head|body)[^>]*>", "", layout_html, flags=re.IGNORECASE).strip()
        layout_html = layout_html[:layout_html.rfind("</div>") + 6]
    except Exception as e:
        print(f"Failed to generate layout: {e}")
        layout_html = "<div style='text-align:center;padding:40px;'><h2>Layout generation failed.</h2></div>"

    return jsonify({
        "layoutFragment": layout_html,
        "contentBlocks": content_blocks
    })


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

@app.route("/export", methods=["POST"])
def export_pdf():
    data = request.get_json()
    html_content = data.get("html")
    filename = data.get("filename", "newsletter")

    if not html_content:
        return jsonify({"error": "Missing HTML content"}), 400

    # Remove markdown-style backticks if present
    html_content = re.sub(r"```(html)?", "", html_content).strip()

    # ✅ Replace logo path with base64-encoded string
    try:
        with open("NewsletterClient/public/gapblueLogo.png", "rb") as image_file:
            logo_base64 = base64.b64encode(image_file.read()).decode("utf-8")
            LOGO_BASE64 = f"data:image/png;base64,{logo_base64}"
            html_content = html_content.replace("/gapblueLogo.png", LOGO_BASE64)
    except FileNotFoundError:
        print("[WARNING] Logo image not found. Skipping base64 replacement.")

    # Sanitize and construct output PDF path
    safe_filename = re.sub(r'[^\w\-_.]', '_', filename) + ".pdf"
    pdf_path = os.path.join("generated-pdf", safe_filename)
    os.makedirs("generated-pdf", exist_ok=True)

    # Generate PDF using wkhtmltopdf on Windows
    try:
        config = pdfkit.configuration(wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
        pdfkit.from_string(
            html_content,
            pdf_path,
            configuration=config,
            options={
                "enable-local-file-access": "",
                "load-error-handling": "ignore",
                "load-media-error-handling": "ignore"
            }
        )
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        print(f"[ERROR] PDF generation failed: {e}")
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

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

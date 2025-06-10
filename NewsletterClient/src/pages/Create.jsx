import { useState, useEffect, useRef } from 'react';
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";

const Create = () => {
  const [keywords, setKeywords] = useState('');
  const [image, setImage] = useState(null);
  const [tone, setTone] = useState('formal');
  const [customTone, setCustomTone] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const htmlTemplateRef = useRef('');
  const shouldAppend = useRef(false); // NEW: track if new content needs to be appended

  const handleBeautify = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FLASK_API}/api/beautify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: keywords }),
      });
      const data = await response.json();
      setKeywords(data.beautifiedText || '');
    } catch (err) {
      console.error('Beautification failed:', err);
      alert('Failed to beautify text.');
    }
  };

  const handleGenerate = async () => {
    if (!keywords.trim()) return alert('Please enter some keywords.');

    let htmlTemplate = '';

    try {
      const response = await fetch(`${import.meta.env.VITE_FLASK_API}/api/generate-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: keywords, tone: tone === 'other' ? customTone.trim() : tone }),
      });

      const data = await response.json();
      console.log('🧾 Received content:', data.content);
      const content = data.content || '';

      const htmlTemplate = `
        <section style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <header style="border-bottom: 2px solid #3498db; margin-bottom: 20px;">
            <h1 style="font-size: 28px; color: #2c3e50;">📰 Company Newsletter</h1>
            <p style="font-size: 14px; color: #95a5a6;">By Newsletter Team</p>
          </header>
          <article style="font-size: 18px; line-height: 1.6; color: #2d3436;">
            ${content}
          </article>
          ${image ? `<img src="${image}" alt="Newsletter visual" style="max-width: 100%; margin-top: 30px; border-radius: 8px;" />` : ''}
        </section>
      `;
      console.log('🧱 HTML to add:', htmlTemplate);

        } catch (err) {
    console.error('Error generating content:', err);
    alert('Failed to generate newsletter content.');
    return; // ❗ Stop execution if generation failed
  }


    if (!editorInstance) {
  htmlTemplateRef.current = htmlTemplate;
  shouldAppend.current = true;
  setIsEditorOpen(true); // open editor before content injection
} else {
  // Editor is already loaded — safe to add content
  editorInstance.addComponents(htmlTemplate);
}

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setKeywords('');
    setImage(null);
    htmlTemplateRef.current = '';
    shouldAppend.current = false;
    if (editorInstance) {
      editorInstance.Components.clear();
      editorInstance.Modal.close();
    }
  };

  useEffect(() => {
    if (
    isEditorOpen &&
    shouldAppend.current &&
    htmlTemplateRef.current
  ) {
    const interval = setInterval(() => {
    if (
      editorInstance &&
      typeof editorInstance.addComponents === "function"
    ) {
      editorInstance.addComponents(htmlTemplateRef.current); // Append, don't replace
      shouldAppend.current = false;
      htmlTemplateRef.current = '';
      clearInterval(interval);
      console.log('✅ Content appended after editor initialized');
    }
  }, 500);
    return () => clearInterval(interval)
  }
  }, [editorInstance, isEditorOpen]);

  const setupAiImageCommand = (editor) => {
    editor.Commands.add('open-ai-image-generator', {
      run(ed) {
        const aiprompt = window.prompt("Enter a prompt for your AI-generated image:");
        if (!aiprompt) return alert("Prompt cannot be empty.");
        fetch(`${import.meta.env.VITE_FLASK_API}/api/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: aiprompt }),
        })
          .then(res => res.json())
          .then(data => {
            const imageUrl = data.imageUrl || data.url || data.image_url;
            if (imageUrl) {
              ed.addComponents(`<img src="${imageUrl}" style="max-width: 100%;" />`);
            } else {
              alert("Failed to generate image: No image URL returned.");
            }
          })
          .catch(err => {
            console.error("AI image generation failed:", err);
            alert("Image generation failed.");
          });
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: 'auto' }}>
      <h2>Create Newsletter</h2>

      <textarea
        placeholder="Enter key takeaways..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        rows={4}
        style={{ marginBottom: '10px', padding: '10px', fontSize: '16px', width: '100%' }}
      />

      <div style={{ marginBottom: '10px' }}>
        <label>
          <strong>Select Tone:</strong>&nbsp;
          <select
            value={tone}
            onChange={(e) => {
              setTone(e.target.value);
              if (e.target.value !== 'other') setCustomTone('');
            }}
            style={{ padding: '6px', minWidth: '150px' }}
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="polite">Polite</option>
            <option value="friendly">Friendly</option>
            <option value="other">Other (Specify)</option>
          </select>
        </label>
      </div>

      {tone === 'other' && (
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter custom tone"
            value={customTone}
            onChange={(e) => setCustomTone(e.target.value)}
            style={{ padding: '8px', width: '100%' }}
          />
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleGenerate} style={btnStyle('#3498db')}>Generate</button>
        <button onClick={handleBeautify} style={btnStyle('#27ae60')}>Beautify</button>
        <button onClick={handleReset} style={btnStyle('#e74c3c')}>Reset</button>
        <button onClick={() => setIsEditorOpen(true)} style={btnStyle('#8e44ad')}>Open Editor</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && <img src={image} alt="Preview" style={{ maxHeight: '150px', marginTop: '10px' }} />}
      </div>

      {isEditorOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#fff' }}>
          <div style={{ textAlign: 'right', padding: '10px' }}>
            <button onClick={() => setIsEditorOpen(false)} style={btnStyle('#e74c3c')}>Close Editor</button>
          </div>

          <div style={{ position: 'fixed', top: '54px', left: '300px', zIndex: 10001 }}>
            <button
              onClick={() => editorInstance?.runCommand('open-ai-image-generator')}
              style={btnStyle('#0000ff')}
            >
              🪄 AI Image
            </button>
          </div>

          <div style={{ height: 'calc(100% - 50px)' }}>
            <StudioEditor
              options={{
                project: {
                  type: 'web',
                  default: {
                    pages: [{ name: 'Home', component: '' }],
                  },
                },
              }}
              onEditor={(editor) => {
                console.log('Editor ready:', editor);
                setEditorInstance(editor);
                setupAiImageCommand(editor);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const btnStyle = (bg) => ({
  padding: '8px 16px',
  marginRight: '10px',
  backgroundColor: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});

export default Create;

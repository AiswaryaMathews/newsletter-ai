import { useState, useEffect, useRef } from 'react';
import StudioEditor from "@grapesjs/studio-sdk/react";
import "@grapesjs/studio-sdk/style";
import { canvasAbsoluteMode } from '@grapesjs/studio-sdk-plugins';

const Create = () => {
  const [keywords, setKeywords] = useState('');
  const [image, setImage] = useState(null);
  const [tone, setTone] = useState('formal');
  const [customTone, setCustomTone] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newsCount, setNewsCount] = useState(1);
  const [prompts, setPrompts] = useState([{ text: '', font: 'Arial', bgColor: '#ffffff', textColor: '#000000' }]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#2d3436');
  const [fontFamily, setFontFamily] = useState('Arial');


  const htmlTemplateRef = useRef('');
  const shouldAppend = useRef(false);
  const editorRef = useRef(null);

  const handlePromptChange = (index, field, value) => {
  setPrompts(prev =>
    prev.map((p, i) => {
      if (i !== index) return p;

      // Ensure the prompt is an object with defaults
      const prompt = typeof p === 'object' && p !== null
        ? p
        : { text: '', font: 'Arial', bgColor: '#ffffff', textColor: '#000000' };

      return {
        ...prompt,
        [field]: value
      };
    })
  );
};

  const handleBeautify = async () => {
  const selected = editorInstance?.getSelected?.();
  if (!selected || !selected.is('text')) {
    return alert('Select a text block to beautify.');
  }

  const text = selected.get('content');
  const chosenTone = tone === 'custom' ? customTone : tone;

  

  try {
    const response = await fetch('http://localhost:5001/api/beautify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, tone: chosenTone })
    });

    const data = await response.json();
    selected.set('content', data.beautified);
  } catch (error) {
    console.error('Error beautifying content:', error);
  }
};



  const escapeHTML = (str) => str
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const handleGenerate = async () => {
  if (!prompts.some(p => p.text && p.text.trim() !== '')) {
    alert("Please enter at least one set of keywords.");
    return;
  }

  let finalHtml = '';

  try {
    const response = await fetch(`${import.meta.env.VITE_FLASK_API}/api/generate-newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompts: prompts.map(p => ({
          text: p.text,
          bgColor: p.bgColor || bgColor,
          textColor: p.textColor || textColor,
          fontFamily: p.font || fontFamily,
        })),
        tone: tone === 'other' ? customTone.trim() : tone,
      }),
    });

    const data = await response.json();
    const contentBlocks = Array.isArray(data.contentBlocks) ? data.contentBlocks : [];
    const layoutFragment = data.layoutFragment || '';

    if (prompts.length !== contentBlocks.length) {
      alert("Mismatch: Number of prompts and content blocks must be equal.");
      return;
    }

    // Build styled content sections
    const contentHtml = contentBlocks.map((item, idx) => {
      const prompt = prompts[idx];
      const font = prompt.font || fontFamily;
      const bg = prompt.bgColor || bgColor;
      const text = prompt.textColor || textColor;

      return `
        <div data-gjs-type="container" style="margin-bottom: 30px; padding: 20px; background-color: ${bg}; color: ${text}; font-family: ${font}; border-radius: 10px;">
          <div style="display: flex; gap: 20px;">
            <div style="flex: 1;" data-gjs-droppable="true">
              <div data-gjs-type="image" style="height: 200px; border: 1px dashed #aaa; display: flex; align-items: center; justify-content: center;">
                <p>Drop image here</p>
              </div>
            </div>
            <div style="flex: 2;" data-gjs-type="text">
              <h2>📰 News ${idx + 1}</h2>
              <p style="font-size: 18px; line-height: 1.6;">${item}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Combine layout + content into final HTML
    finalHtml = defaultNewsletterTemplate(layoutFragment, contentHtml);

    // Load into GrapesJS
    editorInstance?.Components.clear();
    editorInstance?.setComponents(finalHtml);

    htmlTemplateRef.current = finalHtml;
    shouldAppend.current = true;
    setIsEditorOpen(true);

  } catch (err) {
    console.error('Error generating content:', err);
    alert('Failed to generate newsletter content.');
  }
};

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('http://localhost:5001/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.image_url) {
      setImage(data.image_url); // for preview
      if (editorRef.current) {
        const editor = editorRef.current;
        editor.addComponents({
          type: 'image',
          src: data.image_url,
          style: { width: '100%' },
        });
      }
    } else {
      console.error('Upload failed:', data.error);
    }
  } catch (err) {
    console.error('Error uploading image:', err);
  }
};

function defaultNewsletterTemplate(layoutFragment, contentHtml) {
  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div style="background:#f4f4f4;padding:20px;font-family:sans-serif;">
      <!-- Header with logo and date -->
      <div style="display:flex;justify-content:space-between;align-items:center;background:#fec20c;padding:10px 20px;border-radius:6px 6px 0 0;">
        <img src="/gapblueLogo.png" alt="Company Logo" style="height:60px;" />
        <p style="margin:0;font-size:19px;color:#333;">${today}</p>
      </div>

      <!-- Title -->
      <div style="background:#008080;padding:20px;color:white;text-align:center;">
        <h1 style="margin:0;font-size:36px;font-weight:bold;">NEWSLETTER</h1>
      </div>

      <!-- AI-Generated Layout (with nav, hero, etc.) -->
      <div style="margin-top:20px;background:white;padding:20px;">
        ${layoutFragment}
      </div>

      <!-- Dynamic Content Blocks -->
      <div style="margin-top:20px;background:white;padding:20px;">
        ${contentHtml}
      </div>

      <!-- Footer -->
      <div style="width:100%;background:#333;color:white;padding:20px 0;text-align:center;">
        <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;align-items:center;">
          <p style="margin:0;">
            🌐 <a href="https://gapblue.com" style="color:#ddd;text-decoration:none;">gapblue.com</a>
          </p>
          <p style="margin:0;">
            ✉️ <a href="mailto:someone@gapblue.com" style="color:#ddd;text-decoration:none;">someone@gapblue.com</a>
          </p>
          <p style="margin:0;">
            📞 +91-9876543210
          </p>
        </div>
      </div>
    </div>
  `;
}


  const handleReset = () => {
  setKeywords('');
  setImage(null);
  setPrompts([{ text: "", font: "Arial", bgColor: "#ffffff", textColor: "#000000" }]);
  setNewsCount(1);
  setTone('formal');
  setCustomTone('');
  htmlTemplateRef.current = '';
  shouldAppend.current = false;
  setIsEditorOpen(false);

  if (editorInstance?.DomComponents?.clear) {
    editorInstance.DomComponents.clear();
  }

  if (editorInstance?.Modal?.close) {
    editorInstance.Modal.close();
  }

  const toneUI = document.querySelector(".tone-options");
  if (toneUI) toneUI.remove();
};


  useEffect(() => {
  if (!isEditorOpen || !editorInstance || !shouldAppend.current || !htmlTemplateRef.current) return;

  const timeout = setTimeout(() => {
    try {
      editorInstance.setComponents(htmlTemplateRef.current);
      shouldAppend.current = false;
      console.log('✅ Template injected with content');
    } catch (err) {
      console.error('❌ Failed to inject template:', err);
    }
  }, 300);

  return () => clearTimeout(timeout);
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

const handleExportPdf = async () => {
  if (!editorInstance) return alert("Editor not ready");

  const html = editorInstance.getHtml() + "<style>" + editorInstance.getCss() + "</style>";
  const filename = prompt("Enter PDF filename (without .pdf):", "newsletter") || "newsletter";

  try {
    const response = await fetch("http://localhost:5001/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ html, filename })
    });

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("PDF Export Error:", err);
    alert("PDF export failed");
  }
};


 
  return (
    <div style={{ padding: '20px', maxWidth: '720px', margin: 'auto' }}>
      <h2>Create Newsletter</h2>

      {/*<textarea
        placeholder="Enter key takeaways..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        rows={4}
        style={{ marginBottom: '10px', padding: '10px', fontSize: '16px', width: '100%' }}
      />*/}

      <div style={{ marginBottom: '20px' }}>
  <h4>Newsletter Styling</h4>

  <label>
    Background Color: 
    <input
      type="color"
      value={bgColor}
      onChange={(e) => setBgColor(e.target.value)}
      style={{ marginLeft: '10px' }}
    />
  </label>

  <label style={{ marginLeft: '20px' }}>
    Text Color: 
    <input
      type="color"
      value={textColor}
      onChange={(e) => setTextColor(e.target.value)}
      style={{ marginLeft: '10px' }}
    />
  </label>

  <label style={{ marginLeft: '20px' }}>
    Font Family: 
    <select
      value={fontFamily}
      onChange={(e) => setFontFamily(e.target.value)}
      style={{ marginLeft: '10px' }}
    >
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Roboto">Roboto</option>
      <option value="Verdana">Verdana</option>
    </select>
  </label>
</div>


      <div>
  <label>How many news items?</label>
  <input
    type="number"
    min={1}
    value={newsCount}
    onChange={(e) => {
      const count = parseInt(e.target.value);
      setNewsCount(count);
      setPrompts(Array(count).fill(""));
    }}
  style={{ margin: '10px 0', padding: '6px' }}
/>
</div>

{prompts.map((prompt, idx) => (
  <div key={idx} style={{ width: '100%', marginBottom: '10px' }}>
    <input
    type="text"
    value={prompt.text || ""}
    onChange={(e) => handlePromptChange(idx, 'text', e.target.value)}
    placeholder={`Enter prompt for news item ${idx + 1}`}
    
  />
  <select
      value={prompt.font || "Arial"}
      onChange={(e) => handlePromptChange(idx, 'font', e.target.value)}
    >
      <option value="Arial">Arial</option>
      <option value="Georgia">Georgia</option>
      <option value="Courier New">Courier New</option>
      <option value="Times New Roman">Times New Roman</option>
      <option value="Verdana">Verdana</option>
    </select>

    <input
      type="color"
      value={prompt.bgColor || "#ffffff"}
      onChange={(e) => handlePromptChange(idx, 'bgColor', e.target.value)}
      title="Background Color"
    />

    <input
      type="color"
      value={prompt.textColor || "#000000"}
      onChange={(e) => handlePromptChange(idx, 'textColor', e.target.value)}
      title="Text Color"
    />
  </div>
))}
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
        <input
          type="text"
          placeholder="Enter custom tone"
          value={customTone}
          onChange={(e) => setCustomTone(e.target.value)}
          style={{ padding: '8px', width: '100%', marginBottom: '10px' }}
        />
      )}


     <div style={{ marginBottom: '20px' }}>
        <button onClick={handleGenerate} style={btnStyle('#3498db')}>Generate</button>
    
        <button onClick={handleReset} style={btnStyle('#e74c3c')}>Reset</button>
        <button onClick={() => setIsEditorOpen(true)} style={btnStyle('#8e44ad')}>Open Editor</button>
      </div>

     {/*  <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && (
        <>
         <img src={image} alt="Preview" style={{ maxHeight: '150px', marginTop: '10px' }} />
          <button
      onClick={() => {
        if (editorInstance) {
          editorInstance.addComponents(`<img src="${image}" style="max-width: 100%; margin-top: 10px;" />`);
        } else {
          alert("Open the editor before inserting the image.");
        }
      }}
      style={btnStyle('#27ae60')} // green style for "Insert" action
    >
      Insert Uploaded Image
    </button> 
  </> 
      )} */}
      {isEditorOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#fff' }}>
          <div style={{ textAlign: 'right', padding: '10px' }}>
            <button onClick={() => { const toneBox = document.querySelector(".tone-options");
                  if (toneBox) toneBox.remove();
                  setIsEditorOpen(false);}} style={btnStyle('#e74c3c')}>Close Editor</button>
          </div>

          <div style={{ textAlign: 'left', padding: '10px' }}>
            <button
              onClick={handleExportPdf} style={btnStyle('#007bff')}>Export as PDF</button>
          </div>

          <div style={{ position: 'fixed', top: '62px', left: '300px', zIndex: 10001 }}>
            <button
              onClick={() => editorInstance?.runCommand('open-ai-image-generator')}
              style={btnStyle('#0000ff')}
            >
              🪄 AI Image
            </button>
          </div>

          <div style={{ position: 'fixed', top: '62px', left: '500px', zIndex: 10001 }}>
            <button
              onClick={() => editorInstance?.runCommand('clear-editor-command')}
              style={btnStyle('#f39c12')}
            >
              🧹 Clear Editor
            </button>
          </div>


          <div style={{ height: 'calc(100% - 50px)' }}>
            <StudioEditor
              options={{
                plugins: [
                  canvasAbsoluteMode
                ],
                project: {
                  type: 'web',
                  default: {
                    pages: [{ name: 'Home', component: '' },],
                  },
                },
              }}
              onEditor={(editor) => {
                console.log('Editor ready:', editor);
                setEditorInstance(editor);
                editorRef.current = editor;
                setupAiImageCommand(editor);

                const baseHtml = defaultNewsletterTemplate( `<div style="text-align:center;padding:40px;">
                      <h2>Start building your newsletter!</h2>
                    </div>`, 
                    '');
                editor.setComponents(baseHtml);

                // ✅ Add Upload Image command
                editor.Commands.add('upload-image', {
                  run(editor) {
                    const selected = editor.getSelected();
                    if (!selected || selected.get('type') !== 'image') return;

                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.style.display = 'none';

                    input.onchange = () => {
                      const file = input.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        selected.set('src', reader.result);
                      };
                      reader.readAsDataURL(file);
                    };

                    document.body.appendChild(input);
                    input.click();
                    document.body.removeChild(input);
                  }
                });

                // ✅ Show tone selector when text block is selected
                editor.on("component:selected", (selected) => {
                  const existingBox = document.querySelector(".tone-options");
                  if (existingBox) existingBox.remove();

                  if (selected && selected.is("text")) {
                    const el = document.createElement("div");
                    el.className = "tone-options";
                    el.style.position = "fixed";
                    el.style.top = "80px";
                    el.style.right = "20px";
                    el.style.zIndex = "9999";
                    el.style.background = "#fff";
                    el.style.padding = "12px";
                    el.style.border = "1px solid #ccc";
                    el.style.borderRadius = "8px";
                    el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                    el.style.width = "220px";
                    el.style.fontFamily = "sans-serif";

                    el.innerHTML = `
                      <label style="font-size:14px; font-weight:bold;">Tone</label>
                      <select id="tone-select" style="width:100%; margin-top:6px; background: #aaa">
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                        <option value="professional">Professional</option>
                        <option value="polite">Polite</option>
                        <option value="friendly">Friendly</option>
                        <option value="other">Other (Specify)</option>
                      </select>
                      <input type="text" id="custom-tone" placeholder="Enter custom tone..." style="display:none; margin-top:8px; width:100%;" />
                      <button id="beautify-btn" style="margin-top:12px; width:100%; background:#ff007f">Beautify</button>
                      <button id="remove-ui-btn" style="margin-top:6px; width:100%; background:#800808;">Close</button>
                    `;

                    document.body.appendChild(el);

                    const toneSelect = document.getElementById("tone-select");
                    const customToneInput = document.getElementById("custom-tone");
                    const beautifyBtn = document.getElementById("beautify-btn");
                    const closeBtn = document.getElementById("remove-ui-btn");

                    toneSelect.addEventListener("change", () => {
                      customToneInput.style.display = toneSelect.value === "other" ? "block" : "none";
                    });

                    beautifyBtn.addEventListener("click", async () => {
                      const selected = editor.getSelected();
                      if (!selected) return alert("Please select a block.");
                      
                      const content = selected.getEl()?.innerText?.trim();
                      const toneToUse = toneSelect.value === "other" ? customToneInput.value.trim() : toneSelect.value;

                      if (!content || content.split(" ").length < 3)
                        return alert("Please select some meaningful text.");

                      if (!toneToUse) return alert("Please specify a tone.");

                      const res = await fetch(`${import.meta.env.VITE_FLASK_API}/api/beautify`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: content, tone: toneToUse })
                      });

                      const json = await res.json();
                      if (json.beautified) {
                        selected.set("components", json.beautified);
                        selected.addAttributes({ "data-tone": toneToUse });
                      } else {
                        alert("Failed to beautify content.");
                      }
                    });

                    closeBtn.addEventListener("click", () => {
                      el.remove();
                    });
                  }

                  // ✅ Add Upload button to the image block’s toolbar
                  if (selected && selected.get('type') === 'image') {
                    const toolbar = selected.get('toolbar') || [];

                    const alreadyExists = toolbar.some(btn => btn.command === 'upload-image');
                    if (!alreadyExists) {
                      toolbar.unshift({
                        attributes: { title: 'Upload Image' },
                        command: 'upload-image',
                        label: '📷 Upload Image',
                      });
                      selected.set('toolbar', toolbar);
                    }
                  }
                });

                // ✅ Add Upload Image to top options panel
                editor.Panels.addButton('options', {
                  id: 'upload-image-global',
                  className: 'fa fa-image',
                  label: 'Upload Image',
                  attributes: { title: 'Upload an image to selected image block' },
                  command: 'upload-image',
                });

                // ✅ Add clear editor command
                editor.Commands.add('clear-editor-command', {
                  run(editor) {
                    if (confirm('Are you sure you want to clear the entire editor?')) {
                      editor.DomComponents.clear();
                      editor.Css.clear();
                      editor.AssetManager.getAll().reset();
                      editor.setComponents('<div style="padding: 20px; text-align: center;"></div>');
                      editor.StyleManager.getSectors().reset();
                    }
                  }
                });

                // ✅ Add Clear Editor button to top panel
                if (!editor.Panels.getPanel('top-panel')) {
                  editor.Panels.addPanel({ id: 'top-panel', buttons: [] });
                }

                if (!editor.Panels.getButton('top-panel', 'clear-editor')) {
                  editor.Panels.addButton('top-panel', {
                    id: 'clear-editor',
                    className: 'fa fa-trash',
                    label: 'Clear Editor',
                    attributes: { title: 'Click to clear all content' },
                    command: 'clear-editor-command',
                  });
                }
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
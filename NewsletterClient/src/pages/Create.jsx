import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudioEditor from '../components/StudioEditor';

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
              <p style="font-size: 18px; line-height: 1.6; color: inherit;">${item}</p>
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
    localStorage.setItem('isEditorOpen', 'true');
    /*setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 100);*/

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
          <p style="margin:0; ">
            📞 <span style="color:#ddd;">+91-9876543210</span>
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



// 1️⃣ Restore mode and uploaded template
useEffect(() => {
  const wasEditorOpen = localStorage.getItem('isEditorOpen') === 'true';
  const mode = localStorage.getItem('editorMode');
  const uploadedTemplate = localStorage.getItem('uploadedTemplateHTML');

  if (wasEditorOpen) {
    setIsEditorOpen(true);

    if (mode === 'upload' && uploadedTemplate) {
      htmlTemplateRef.current = uploadedTemplate;
      shouldAppend.current = true; // ✅ ensure injection happens later
    }
  }
}, []);

// 2️⃣ Inject HTML template into GrapesJS after it’s fully ready
useEffect(() => {
  if (!isEditorOpen || !editorInstance || !shouldAppend.current || !htmlTemplateRef.current) return;

  const injectTemplate = () => {
    try {
      editorInstance.setComponents(htmlTemplateRef.current);
      shouldAppend.current = false; // ✅ prevent re-injection
      console.log('✅ Template injected into editor');
    } catch (err) {
      console.error('❌ Failed to inject template:', err);
    }
  };

  const timeout = setTimeout(injectTemplate, 300); // small delay ensures GrapesJS is mounted
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

const handleExportHTML = async () => {
  if (!editor) {
    console.error("Editor not initialized");
    return;
  }

  const fileName = prompt("Enter filename (without .html):");
  if (!fileName) return;

  const htmlContent = editor.getHtml();
  const cssContent = editor.getCss();
  const fullHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${fileName}</title>
      <style>${cssContent}</style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `;

  // Inline all images as base64
  const inlinedHtml = await inlineImagesInHtml(fullHTML);

  // Create a blob and trigger download
  const blob = new Blob([inlinedHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

const inlineImagesInHtml = async (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const images = doc.querySelectorAll("img");

  const promises = Array.from(images).map(async (img) => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("data:")) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        img.setAttribute("src", base64);
      } catch (err) {
        console.warn("Failed to inline image:", src, err);
      }
    }
  });

  await Promise.all(promises);
  return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
};

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


 
  return (
    <div style= {{display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg,rgba(255, 111, 145, 0.9), #b967c7)',
    boxSizing: 'border-box',
    padding: '30px',    
  }}>
    <div style={{ 
      backgroundColor: '#ffffff',
      padding: '30px',
      maxWidth: '800px',
      width: '100%',
      borderRadius: '16px',
      boxShadow: '0 0 30px rgba(0, 255, 255, 0.08)',
      textAlign: 'center',}}>
      <div style={{
        background: 'radial-gradient(circle, #00f0ff, #0072ff)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '20px', 
      }}>
      <h2>Create Newsletter</h2> </div>

      {/*<textarea
        placeholder="Enter key takeaways..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        rows={4}
        style={{ marginBottom: '10px', padding: '10px', fontSize: '16px', width: '100%' }}
      />*/}

      <div style={{ marginBottom: '20px', color: '#000000',}}>
  <h3 style={{
    marginBottom: '20px',
    background: 'linear-gradient(to right, #ff7f00,  #00ff00, #0000ff, #8b00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
  }}><i>Newsletter Styling</i></h3>

  {/*<label style={{ fontSize: '18px', color: '#000000',}}>
    Background Color: 
    <input
      type="color"
      value={bgColor}
      onChange={(e) => setBgColor(e.target.value)}
      style={{ marginLeft: '10px' }}
    />
  </label>

  <label style={{ marginLeft: '20px', fontSize: '18px', color: '#000000', }}>
    Text Color: 
    <input
      type="color"
      value={textColor}
      onChange={(e) => setTextColor(e.target.value)}
      style={{ marginLeft: '10px' }}
    />
  </label>

  <label style={{ marginLeft: '20px' , fontSize: '17px', color: '#000000',}}>
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
  </label> */} 
</div>


      <div>
  <label style={{ display: 'inline-block', marginRight: '10px', fontSize: '23px', color: '#000000',}}><strong>How many news items?</strong></label>
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
<br/>
<br/>
{prompts.map((prompt, idx) => (
  <div key={idx} style={{display: 'flex', width: '100%', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center', gap: '12px',}}>
    <input
    type="text"
    value={prompt.text || ""}
    onChange={(e) => handlePromptChange(idx, 'text', e.target.value)}
    placeholder={`Enter prompt for news item ${idx + 1}`}
    style={{fontSize: '16px', padding: '8px', flexGrow: 1, minWidth: '200px',}}
  />
  <select
      value={prompt.font || "Arial"}
      onChange={(e) => handlePromptChange(idx, 'font', e.target.value)}
      style={{ padding: '8px' }}
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
))} <br/>

      <div style={{ marginBottom: '10px' , fontSize: '23px', color: '#000000',}}>
        <label>
          <strong>Select Tone (Optional):</strong>&nbsp;
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
<br/>

     <div style={{ marginBottom: '20px', display: 'flex', width: '100%', flexWrap: 'wrap', alignItems: 'center', gap: '12px',justifyContent: 'center'}}>
        <button onClick={handleGenerate} style={btnStyle('#3498db')}>Generate</button>
    
        <button onClick={handleReset} style={btnStyle('#e74c3c')}>Reset</button>
        <button onClick={() => setIsEditorOpen(true)} style={btnStyle('#8e44ad')}>Open Editor</button>
      </div>
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
  <StudioEditor
  editorRef={editorRef}
  setEditorInstance={setEditorInstance}
  setIsEditorOpen={setIsEditorOpen}
  handleExportHTML={handleExportHTML}
  setupAiImageCommand={setupAiImageCommand}
  btnStyle={btnStyle}
  defaultNewsletterTemplate={defaultNewsletterTemplate}
/>
)}
  </div>
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
import React, { useState, useEffect } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-preset-webpage'; // Preset for blocks & UI
import 'grapesjs-blocks-basic';
import 'grapesjs-plugin-forms';
import 'grapesjs-component-countdown';
import 'grapesjs-plugin-export';
import 'grapesjs-plugin-filestack';
import 'grapesjs-plugin-ckeditor'; // Needs CKEditor
import 'grapesjs-touch';

const Create = () => {
  const [keywords, setKeywords] = useState('');
  const [generatedContent, setGeneratedContent] = useState([]);
  const [image, setImage] = useState(null);
  const [editor, setEditor] = useState(null);
  const [tone, setTone] = useState('formal');

  const handleBeautify = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_FLASK_API}/api/beautify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: keywords })
      });
      const data = await response.json();
      setKeywords(data.beautifiedText || '');
    } catch (err) {
      console.error('Beautification failed', err);
    }
  };

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      alert('Please enter some keywords or key takeaways.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_FLASK_API}/api/generate-newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: keywords, tone })
      });

      const data = await response.json();
      const content = data.content;
      setGeneratedContent(prev => [...prev, content]);

      if (editor) {
        const htmlTemplate = `
          <div class="newsletter" style="padding: 20px; font-family: Arial; margin-top: 20px; border: 1px solid #ccc;">
            <h1>AI Newsletter</h1>
            <p>${content}</p>
            ${image ? `<img src="${image}" style="max-width: 100%; height: auto; margin-top: 10px;" />` : ''}
          </div>
        `;
        editor.addComponents(htmlTemplate);
      }
    } catch (err) {
      console.error('Error generating content:', err);
    }
  };

  const handleReset = () => {
    setKeywords('');
    setGeneratedContent([]);
    setImage(null);
    if (editor) {
      editor.setComponents('');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  useEffect(() => {
    if (!editor) {
      const gjsEditor = grapesjs.init({
        container: '#gjs',
        height: '600px',
        width: 'auto',
        fromElement: false,
        storageManager: false,
        plugins: ['grapesjs-preset-webpage', 'grapesjs-blocks-basic',  'grapesjs-plugin-forms',
    'grapesjs-component-countdown',
    'grapesjs-plugin-export',
    'grapesjs-plugin-filestack',
    'grapesjs-plugin-ckeditor',
    'grapesjs-touch',],
        pluginsOpts: {
          'grapesjs-preset-webpage': {},
          'grapesjs-plugin-ckeditor': {
          position: 'left',
        },
        },
        blockManager: {
          appendTo: '#blocks'
        },
        //panels: { defaults: [] } 
      });
      setEditor(gjsEditor);
    }
  }, [editor]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Newsletter</h2>

      <textarea
        placeholder="Enter key takeaways (e.g. event summary, team update)..."
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        rows={4}
        cols={60}
        style={{ marginBottom: '10px', padding: '10px' }}
      />
      <br />

      <label>
        Select Tone:&nbsp;
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
          <option value="professional">Professional</option>
          <option value="polite">Polite</option>
          <option value="friendly">Friendly</option>
        </select>
      </label>

      <button
        onClick={handleGenerate}
        style={{ marginBottom: '20px', marginLeft: '10px', padding: '8px 16px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Generate Newsletter
      </button>

      <button onClick={handleBeautify} style={{ marginLeft: '10px', backgroundColor: '#0B6623', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
        Beautify Keywords
      </button>

      <button
        onClick={handleReset}
        style={{ marginLeft: '10px', padding: '8px 16px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Reset All
      </button>

      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && (
          <div>
            <p>Preview:</p>
            <img src={image} alt="Uploaded" style={{ maxHeight: '150px', marginTop: '10px' }} />
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Generated Newsletters:</h3>
        {generatedContent.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <p>{item}</p>
          </div>
        ))}
      </div>

      {/* Block panel for GrapesJS */}
      <div id="blocks" style={{ marginTop: '30px', marginBottom: '10px' }}></div>

      <div id="panels"></div>
      <div id="layers"></div> 
      <div id="styles"></div>

      {/* GrapesJS editor container */}
      <div id="gjs" />
    </div>
  );
};

export default Create;

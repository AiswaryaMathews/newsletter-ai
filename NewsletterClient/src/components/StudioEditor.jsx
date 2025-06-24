import React, { useEffect } from 'react';
import StudioEditor from '@grapesjs/studio-sdk/react';
import '@grapesjs/studio-sdk/style';
import { canvasAbsoluteMode } from '@grapesjs/studio-sdk-plugins';

const StudioEditorWrapper = ({
  editorRef,
  setEditorInstance,
  setIsEditorOpen,
  handleExportHTML,
  setupAiImageCommand,
  btnStyle,
  defaultNewsletterTemplate,
}) => {
  useEffect(() => {
    // Cleanup tone box on unmount
    return () => {
      const toneBox = document.querySelector('.tone-options');
      if (toneBox) toneBox.remove();
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      backgroundColor: '#fff',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <button
          onClick={() => {
            const toneBox = document.querySelector('.tone-options');
            if (toneBox) toneBox.remove();
            setIsEditorOpen(false);
            localStorage.setItem('isEditorOpen', 'false');
          }}
          style={btnStyle('#e74c3c')}
        >
          Close Editor
        </button>

        <button
          onClick={handleExportHTML}
          style={{ marginLeft: '10px', backgroundColor: '#0147ab', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '5px' }}
        >
          Export as HTML
        </button>
      </div>

      {/* Extra Tools */}
      <div style={{ display: 'flex', gap: '12px', padding: '0 10px' }}>
        <button
          onClick={() => editorRef.current?.runCommand('open-ai-image-generator')}
          style={btnStyle('#0000ff')}
        >
          🪄 AI Image
        </button>

        <button
          onClick={() => editorRef.current?.runCommand('clear-editor-command')}
          style={btnStyle('#f39c12')}
        >
          🧹 Clear Editor
        </button>
      </div>

      {/* Studio Editor Canvas */}
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}>
        <StudioEditor
          style={{ width: '100%', height: '100%', overflow: 'auto' }}
          options={{
            plugins: [canvasAbsoluteMode],
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
            editorRef.current = editor;
            setupAiImageCommand(editor);

      //  editor.setComponents(initialContent || defaultNewsletterTemplate('<div style="text-align:center;padding:40px;"><h2>Start building your newsletter!</h2></div>', ''));
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
    );
};   
export default StudioEditorWrapper;
import React from 'react';
import StudioEditor from './StudioEditor';

const btnStyle = (bg) => ({ backgroundColor: bg, color: '#fff', padding: '10px 16px', border: 'none', borderRadius: '8px' });

const EditorWrapper = ({ initialContent, onClose, onExport, editorInstance, setEditorInstance }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, backgroundColor: '#fff', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
      <button onClick={onClose} style={btnStyle('#e74c3c')}>Close Editor</button>
      <button onClick={onExport} style={btnStyle('#0147ab')}>Export as HTML</button>
    </div>

    <div style={{ display: 'flex', gap: '12px', padding: '0 10px' }}>
      <button onClick={() => editorInstance?.runCommand('open-ai-image-generator')} style={btnStyle('#0000ff')}>🪄 AI Image</button>
      <button onClick={() => editorInstance?.runCommand('clear-editor-command')} style={btnStyle('#f39c12')}>🧹 Clear Editor</button>
    </div>

    <StudioEditor initialContent={initialContent} onEditor={setEditorInstance} />
  </div>
);

export default EditorWrapper;
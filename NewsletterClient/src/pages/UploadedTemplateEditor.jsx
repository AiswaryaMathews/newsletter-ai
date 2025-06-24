import React, { useEffect, useState } from 'react';
import EditorWrapper from '../components/EditorWrapper';

const UploadedTemplateEditor = () => {
  const [editorInstance, setEditorInstance] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const html = localStorage.getItem('uploadedTemplateHTML') || '';

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('isEditorOpen', 'false');
  };

  const handleExportHTML = () => {
    if (!editorInstance) return;
    const html = editorInstance.getHtml();
    const css = editorInstance.getCss();
    const finalHTML = `<html><head><style>${css}</style></head><body>${html}</body></html>`;
    const blob = new Blob([finalHTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newsletter.html';
    a.click();
  };

  if (!isOpen) return null;

  return (
    <EditorWrapper
      initialContent={html}
      onClose={handleClose}
      onExport={handleExportHTML}
      editorInstance={editorInstance}
      setEditorInstance={setEditorInstance}
    />
  );
};

export default UploadedTemplateEditor;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const UploadTemplatePage = () => {
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') {
    alert('You will be redirected to an external site to convert PDF to HTML. ⚠️ Don’t upload sensitive info.');
    window.open('https://tools.pdf24.org/en/pdf-to-html', '_blank');
  } else if (ext === 'html') {
    const reader = new FileReader();
    reader.onload = (event) => {
      localStorage.setItem('uploadedTemplateHTML', event.target.result);
      localStorage.setItem('editorMode', 'upload');           
      localStorage.setItem('isEditorOpen', 'true');           

      navigate('/create?mode=upload');                        
    };
    reader.readAsText(file);
  } else {
    alert('Only PDF or HTML files are supported.');
  }
};

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Upload Template</h2>
      <p style={{ color: '#d35400', background: '#fff9e6', padding: '10px', borderRadius: '8px' }}>⚠️ Don’t upload any sensitive or confidential documents.</p>
      <label style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(to right, #3498db, #2ecc71)', color: '#fff', borderRadius: '6px', cursor: 'pointer', marginTop: '20px' }}>
        Choose File
        <input type="file" accept=".pdf,.html" onChange={handleFileChange} style={{ display: 'none' }} />
      </label>
    </div>
  );
};

export default UploadTemplatePage;

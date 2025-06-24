import React from 'react';

const templates = [
  {
    title: 'Blue Minimalist Company Newsletter',
    file: 'Blue Minimalist Company Newsletter.pdf',
  },
  {
    title: 'Brown Beige Newsletter',
    file: 'Brown Beige Newsletter.pdf',
  },
  {
    title: 'Green Modern Company Newsletter',
    file: 'Green Modern Company Newsletter.pdf',
  },
];

const Welcome = () => (
  <div>
    <h2>Welcome to Gapblue Newsletter Dashboard</h2>
    <p>Select an option from the sidebar, or use a ready-made newsletter template below.</p>
    <hr/><hr/>
    <h3 style={{ marginTop: '30px' }}>Available Templates👇</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '15px' }}>
      {templates.map((template, idx) => (
        <div key={idx} style={{
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '16px',
          width: '250px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          backgroundColor: '#fff'
        }}>
          <div style={{
            height: '140px',
            backgroundColor: '#f1f1f1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#555'
          }}>
            📄 PDF Preview
          </div>
          <h4 style={{ margin: '10px 0' }}>{template.title}</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <a href={`/templates/${template.file}`} target="_blank" rel="noreferrer"
              style={{
                backgroundColor: '#0147ab',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '5px',
                textDecoration: 'none'
              }}>Preview</a>
            <a href={`/templates/${template.file}`} download
              style={{
                backgroundColor: '#2ecc71',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '5px',
                textDecoration: 'none'
              }}>Download</a>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Welcome;

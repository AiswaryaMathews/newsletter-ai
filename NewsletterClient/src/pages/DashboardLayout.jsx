import React, { useState } from 'react';
import SidebarNav from '../components/SidebarNav';
import { Outlet, useNavigate } from 'react-router-dom';

const DashboardLayout = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (type) => {
  setShowModal(false);
  if (type === 'blank') navigate('/create/editor');       // goes to Create.jsx (prompt + editor)
  else if (type === 'upload') navigate('/upload-template'); // new upload page
  };



  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SidebarNav onCreateClick={() => setShowModal(true)} />
      <main style={{ flexGrow: 1, padding: '20px', position: 'relative', fontFamily: 'Arial' }}>
        <h1>Gapblue Newsletter Dashboard</h1>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            position: 'absolute',
            top: '60px',
            right: '500px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>

        {/* Modal Popup */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '40px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}>
              <h2>Select How You Want to Start</h2>
              <div style={{ display: 'flex', gap: '30px', marginTop: '30px', justifyContent: 'center' }}>
                <button onClick={() => handleOptionClick('blank')} style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#0147ab',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  📝 Start from Blank Canvas
                </button>
                <button onClick={() => handleOptionClick('upload')} style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#27ae60',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  📤 Upload Template
                </button>
              </div>
              <button onClick={() => setShowModal(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

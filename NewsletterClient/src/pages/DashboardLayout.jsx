import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from '../components/SidebarNav';

const DashboardLayout = ({ onLogout }) => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SidebarNav />
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
            right: '-100px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
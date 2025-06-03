import React from 'react';

function Dashboard({ onLogout }) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Welcome to the Gapblue Newsletter Dashboard</h1>
      <p>This is a protected area visible only to logged-in users (admins).</p>
      <button onClick={onLogout} style={{ marginTop: '1rem' }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;

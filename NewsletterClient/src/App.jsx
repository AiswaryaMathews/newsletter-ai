import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import SidebarNav from '../SidebarNav';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Ideally decode token or fetch user role from API here
      // For now, just hardcode as 'admin'
      setUserRole('admin');
    } else {
      setUserRole(null);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUserRole('admin'); // Set role after login (replace with real role)
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <div style={{ display: 'flex' }}>
      {isAuthenticated && userRole === 'admin' && (
        <SidebarNav userRole={userRole} />
      )}

      <main style={{ flexGrow: 1, padding: '20px' }}>
        {isAuthenticated ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;

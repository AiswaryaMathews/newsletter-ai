 import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import SimpleLayout from './pages/SimpleLayout';
import Welcome from './pages/Welcome';
import Create from './pages/Create';
import UploadTemplatePage from './pages/UploadTemplatePage';
import Drafts from './pages/Drafts';
import Scheduled from './pages/Scheduled';
import Published from './pages/Published';
import Archived from './pages/Archived';
import Audit from './pages/Audit';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    localStorage.setItem('token', 'demo-token');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        ) : (
          <>
            <Route path="/" element={<DashboardLayout onLogout={handleLogout} />}>
              <Route index element={<Welcome />} />
            </Route>

            {/* All other pages with only a Home button */}
            
            <Route path="/create/editor" element={<SimpleLayout><Create /></SimpleLayout>} />
            <Route path="/create" element={<SimpleLayout><Create /></SimpleLayout>} />
            <Route path="/upload-template" element={<SimpleLayout><UploadTemplatePage /></SimpleLayout>} />
            <Route path="/drafts" element={<SimpleLayout><Drafts /></SimpleLayout>} />
            <Route path="/scheduled" element={<SimpleLayout><Scheduled /></SimpleLayout>} />
            <Route path="/published" element={<SimpleLayout><Published /></SimpleLayout>} />
            <Route path="/archived" element={<SimpleLayout><Archived /></SimpleLayout>} />
            <Route path="/audit" element={<SimpleLayout><Audit /></SimpleLayout>} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App; 
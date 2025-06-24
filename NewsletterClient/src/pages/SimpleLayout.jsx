import { useNavigate, useLocation } from 'react-router-dom';

  const SimpleLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditorActive = localStorage.getItem('isEditorOpen') === 'true';
  const isCreatePage = location.pathname === '/create' && !isEditorActive;
  const isEditorOpen = localStorage.getItem('isEditorOpen') === 'true';
  

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: isCreatePage && !isEditorOpen ? 'flex' : 'block',
        justifyContent: isCreatePage && !isEditorOpen ? 'center' : 'initial',
        alignItems: isCreatePage && !isEditorOpen ? 'center' : 'initial',
        backgroundImage: isCreatePage && !isEditorOpen
          ? 'linear-gradient(to bottom,  rgba(42, 191, 237, 0.91) 0%, #f4e8fa 100%)'
          : 'none',
        backgroundColor: isCreatePage && !isEditorOpen ? undefined : '#000000',
        fontFamily: 'Arial, sans-serif',
        overflow: isCreatePage && !isEditorOpen ? 'hidden' : 'auto',
      }}
    >
      {/* Home button visible always */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: '#8a2be2',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 600, // ensure visibility above the editor too
        }}
      >
        Home
      </button>

      {/* Main content container */}
      <div
        style={{
          width: '100%',
          maxWidth: isEditorOpen ? '100%' : '900px',
          padding: isEditorOpen ? '0' : '40px',
          borderRadius: isEditorOpen ? '0' : '16px',
          backgroundColor: isCreatePage && !isEditorOpen
            ? 'rgba(86, 151, 241, 0.48)'
            : 'transparent',
          boxShadow: isCreatePage && !isEditorOpen
            ? '0 0 60px rgba(255, 111, 145, 1)'
            : 'none',
          margin: isCreatePage && !isEditorOpen ? '0 auto' : 'initial',
          backdropFilter: isCreatePage && !isEditorOpen ? 'blur(6px)' : 'none',
          WebkitBackdropFilter: isCreatePage && !isEditorOpen ? 'blur(6px)' : 'none',
          overflow: 'visible', 
          display: 'flex',             
          flexDirection: 'column',    
          flexGrow: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default SimpleLayout;

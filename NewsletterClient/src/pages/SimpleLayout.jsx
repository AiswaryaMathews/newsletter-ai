//import React from 'react';
import { useNavigate} from 'react-router-dom';

const SimpleLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '20px',
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Home
      </button>
      {children}
    </div>
  );
};

export default SimpleLayout; 
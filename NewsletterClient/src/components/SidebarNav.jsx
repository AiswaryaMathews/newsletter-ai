import React from 'react';
import { useNavigate } from 'react-router-dom';

const SidebarNav = ({ onCreateClick }) => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/create', label: 'Create NEW' },
    { path: '/drafts', label: 'Drafts' },
    { path: '/scheduled', label: 'Scheduled' },
    { path: '/published', label: 'Published' },
    { path: '/archived', label: 'Archived' },
    { path: '/audit', label: 'Audit Log' },
  ];

  return (
    <nav style={{ width: '200px', backgroundColor: '#222', color: '#fff', padding: '20px' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map(({ path, label }) => (
          <li
            key={path}
            onClick={() => {
              if (label === 'Create NEW' && onCreateClick) {
                onCreateClick(); // Show modal instead of navigating
              } else {
                navigate(path);
              }
            }}
            style={{
              padding: '10px 0',
              cursor: 'pointer',
              borderBottom: '1px solid #444',
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;

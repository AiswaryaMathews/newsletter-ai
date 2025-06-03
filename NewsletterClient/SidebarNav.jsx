import React from 'react';

// Props: onNavigate - callback for handling navigation
//        userRole - string like 'admin' or 'viewer' or null if not logged in
const SidebarNav = ({ userRole, onNavigate }) => {
  // Show menu only if logged in as admin
  if (userRole !== 'admin') return null;

  const menuItems = [
    { key: 'create', label: 'Create NEW' },
    { key: 'drafts', label: 'Drafts' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'published', label: 'Published' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <nav className="sidebar-nav" style={styles.sidebar}>
      <ul style={styles.ul}>
        {menuItems.map(({ key, label }) => (
          <li
            key={key}
            style={styles.li}
            onClick={() => onNavigate(key)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(key)}
          >
            {label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

const styles = {
  sidebar: {
    width: '220px',
    backgroundColor: '#222',
    color: '#fff',
    height: '100vh',
    padding: '20px',
  },
  ul: {
    listStyle: 'none',
    padding: 0,
  },
  li: {
    padding: '12px 8px',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: '4px',
    marginBottom: '8px',
  },
};

export default SidebarNav;

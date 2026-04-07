import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ items, title }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: collapsed ? '80px' : '260px',
        background: 'var(--clay-surface)',
        boxShadow: 'var(--clay-shadow)',
        padding: '20px 0',
        transition: 'all 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px'
        }}
      >
        <h2
          style={{
            color: 'var(--primary-orange)',
            fontSize: collapsed ? '0' : '20px',
            marginBottom: '0',
            opacity: collapsed ? 0 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {title}
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1 }}>
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? '14px 0' : '14px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                marginBottom: '8px',
                textDecoration: 'none',
                color: isActive ? 'var(--primary-orange)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(252, 94, 3, 0.1)' : 'transparent',
                borderLeft: isActive ? '4px solid var(--primary-orange)' : '4px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '15px',
                fontWeight: isActive ? '600' : '400'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(252, 94, 3, 0.05)';
                  e.currentTarget.style.color = 'var(--primary-orange)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>
                {item.icon}
              </span>
              <span
                style={{
                  marginLeft: '12px',
                  opacity: collapsed ? 0 : 1,
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

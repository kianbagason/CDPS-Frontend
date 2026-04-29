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
      {/* Header - fixed height to avoid layout shift when collapsing */}
      <div
        style={{
          height: '72px',
          boxSizing: 'border-box',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <h2
          style={{
            color: 'var(--primary-orange)',
            fontSize: '20px',
            margin: 0,
            opacity: collapsed ? 0 : 1,
            visibility: collapsed ? 'hidden' : 'visible',
            transition: 'opacity 0.2s ease, visibility 0.2s ease'
          }}
        >
          {title}
        </h2>
        {/* collapse/expand toggle pinned to sidebar edge (keeps position stable) */}
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          top: '18px',
          right: collapsed ? '-18px' : '-18px',
          transform: 'none',
          background: 'var(--clay-surface)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-primary)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
          zIndex: 110
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 200ms ease' }}
        >
          <path d="M8 5l8 7-8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      

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
                padding: collapsed ? '10px 0' : '12px 20px',
                minHeight: '48px',
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
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', fontSize: '20px' }}>
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

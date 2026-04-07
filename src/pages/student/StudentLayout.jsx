import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import StudentDashboard from './Dashboard';
import StudentEvents from './Events';
import ChangePassword from './ChangePassword';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const StudentLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    { path: '/student', label: 'Dashboard', icon: '📊' },
    { path: '/student/events', label: 'Events', icon: '📅' },
    { path: '/student/change-password', label: 'Change Password', icon: '🔐' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg)' }}>
      <Sidebar items={sidebarItems} title="Student Portal" />
      
      <div style={{ flex: 1, marginLeft: '260px', transition: 'all 0.3s ease' }}>
        {/* Top Bar */}
        <div
          style={{
            background: 'var(--clay-surface)',
            boxShadow: 'var(--clay-shadow-sm)',
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
        >
          <h2 style={{ color: 'var(--primary-orange)', margin: 0 }}>
            College of Computing Studies
          </h2>
          <ClayButton onClick={handleLogout} variant="secondary">
            Logout
          </ClayButton>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <Routes>
            <Route index element={<StudentDashboard />} />
            <Route path="events" element={<StudentEvents />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;

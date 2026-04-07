import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import FacultyDashboard from './Dashboard';
import FacultyStudents from './Students';
import FacultySchedule from './Schedule';
import AddViolation from './AddViolation';
import EventManagement from './EventManagement';
import FacultyChangePassword from './ChangePassword';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const FacultyLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    { path: '/faculty', label: 'Dashboard', icon: '📊' },
    { path: '/faculty/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/faculty/schedule', label: 'My Schedule', icon: '📅' },
    { path: '/faculty/violations', label: 'Add Violation', icon: '⚠️' },
    { path: '/faculty/events', label: 'Events', icon: '📅' },
    { path: '/faculty/change-password', label: 'Change Password', icon: '🔐' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg)' }}>
      <Sidebar items={sidebarItems} title="Faculty Portal" />
      
      <div style={{ flex: 1, marginLeft: '260px', transition: 'all 0.3s ease' }}>
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

        <div style={{ padding: '32px' }}>
          <Routes>
            <Route index element={<FacultyDashboard />} />
            <Route path="students" element={<FacultyStudents />} />
            <Route path="schedule" element={<FacultySchedule />} />
            <Route path="violations" element={<AddViolation />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="change-password" element={<FacultyChangePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default FacultyLayout;

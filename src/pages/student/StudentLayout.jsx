import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import StudentDashboard from './Dashboard';
import StudentEvents from './Events';
import ChangePassword from './ChangePassword';
import StudentProfile from './Profile';
import StudentSchedule from './Schedule';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const StudentLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      try {
        const resp = await api.get('/notifications');
        setNotifications(resp.data.data || []);
      } catch (err) {
        // Ignore silently
      }
    };
    fetchNotes();
  }, [user]);

  // Favicon is handled via index.html (single source of truth)

  const dismissNotification = async (id) => {
    try {
      const resp = await api.delete(`/notifications/${id}`);
      if (resp?.data?.success) {
        setNotifications((prev) => prev.filter(n => n._id !== id));
        toast.success(resp.data.message || 'Notification dismissed');
      } else {
        console.error('Dismiss response', resp?.data);
        toast.error(resp?.data?.message || 'Unable to dismiss notification');
      }
    } catch (err) {
      console.error('Failed to dismiss notification', err, err.response?.data);
      const msg = err.response?.data?.message || err.message || 'Unable to dismiss notification';
      toast.error(msg);
    }
  };

  const sidebarItems = [
    { path: '/student', label: 'Dashboard', icon: '📊' },
    { path: '/student/schedule', label: 'Schedule', icon: '📚' },
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotes(!showNotes)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                aria-label="Notifications"
              >
                🔔
              </button>
              {notifications.length > 0 && (
                <div style={{ position: 'absolute', top: -6, right: -6, background: 'var(--danger)', color: '#fff', borderRadius: '12px', padding: '2px 6px', fontSize: '12px' }}>
                  {notifications.length}
                </div>
              )}

              {showNotes && (
                <div style={{ position: 'absolute', right: 0, top: '28px', width: '320px', background: 'var(--clay-surface)', boxShadow: 'var(--clay-shadow-sm)', borderRadius: '8px', zIndex: 100 }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontWeight: 600 }}>Notifications</div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 && <div style={{ padding: '12px', color: 'var(--text-secondary)' }}>No notifications</div>}
                    {notifications.map((n) => (
                      <div key={n._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '14px' }}>
                          <div style={{ fontWeight: 600, marginBottom: '4px' }}>{n.message}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ marginLeft: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button onClick={() => { dismissNotification(n._id); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>Dismiss</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile icon */}
            <button
              onClick={() => navigate('/student/profile')}
              aria-label="Profile"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px' }}
            >
              👤
            </button>

            <ClayButton onClick={handleLogout} variant="secondary">
              Logout
            </ClayButton>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <Routes>
            <Route index element={<StudentDashboard />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="events" element={<StudentEvents />} />
              <Route path="profile" element={<StudentProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentLayout;

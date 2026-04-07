import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) return <Loading />;

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>
            Faculty Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome, {user?.username}
          </p>
        </div>
        <ClayButton onClick={handleLogout} variant="secondary">
          Logout
        </ClayButton>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        <ClayCard>
          <h3 style={{ marginBottom: '12px', color: 'var(--primary-orange)' }}>👨‍🎓 View Students</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Browse student profiles
          </p>
          <Link to="/faculty/students">
            <ClayButton style={{ width: '100%' }}>View Students</ClayButton>
          </Link>
        </ClayCard>
        <ClayCard>
          <h3 style={{ marginBottom: '12px', color: 'var(--primary-orange)' }}>⚠️ Add Violation</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Report student violations
          </p>
          <Link to="/faculty/violations">
            <ClayButton style={{ width: '100%' }}>Add Violation</ClayButton>
          </Link>
        </ClayCard>
        <ClayCard>
          <h3 style={{ marginBottom: '12px', color: 'var(--primary-orange)' }}>📅 Schedule</h3>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            View your teaching schedule
          </p>
          <Link to="/faculty/schedule">
            <ClayButton style={{ width: '100%' }}>View Schedule</ClayButton>
          </Link>
        </ClayCard>
      </div>

      <Routes>
        <Route path="/*" element={
          <ClayCard>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '16px' }}>
              Faculty Portal Features
            </h3>
            <ul style={{ lineHeight: '2', color: 'var(--text-secondary)' }}>
              <li>View student profiles and academic records</li>
              <li>Add and manage student violations</li>
              <li>View your teaching schedule</li>
              <li>Access course materials and syllabi</li>
            </ul>
          </ClayCard>
        } />
      </Routes>
    </div>
  );
};

export default FacultyDashboard;

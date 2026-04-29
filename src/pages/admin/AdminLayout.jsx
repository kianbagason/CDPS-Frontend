import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import AdminDashboard from './Dashboard';
import StudentList from './StudentList';
import SectionStudents from './SectionStudents';
import StudentDetail from './StudentDetail';
import QuerySearch from './QuerySearch';
import FacultyList from './FacultyList';
import EventManagement from './EventManagement';
import Affiliations from './Affiliations';
import AddViolation from './AddViolation';
import ViolationsHistory from './ViolationsHistory';
import ScheduleManagement from './ScheduleManagement';
import SubjectManagement from './SubjectManagement';
import Reports from './Reports';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const sidebarItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/query', label: 'Query System', icon: '🔍' },
    { path: '/admin/faculty', label: 'Faculty', icon: '👨‍🏫' },
    { path: '/admin/subjects', label: 'Subjects', icon: '📚' },
    { path: '/admin/schedules', label: 'Schedules', icon: '📅' },
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/affiliations', label: 'School-Affiliated Organization and Groups', icon: '🏷️' },
    { path: '/admin/violations', label: 'Add Violation', icon: '⚠️' },
    { path: '/admin/reports', label: 'Reports', icon: '📊' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg)' }}>
      <Sidebar items={sidebarItems} title="Admin Portal" />
      
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
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/section/:year/:section" element={<SectionStudents />} />
            <Route path="students/view/:id" element={<StudentDetail />} />
            <Route path="query" element={<QuerySearch />} />
            <Route path="faculty" element={<FacultyList />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="affiliations" element={<Affiliations />} />
            <Route path="violations" element={<AddViolation />} />
            <Route path="violations/history" element={<ViolationsHistory />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

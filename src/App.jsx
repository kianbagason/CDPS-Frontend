import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/claymorphism.css';

// Pages
import Login from './pages/auth/Login';
import EnrollmentForm from './pages/enrollment/EnrollmentForm';
import AdminLayout from './pages/admin/AdminLayout';
import StudentLayout from './pages/student/StudentLayout';
import FacultyLayout from './pages/faculty/FacultyLayout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route path="/enrollment" element={<EnrollmentForm />} />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Faculty */}
      <Route
        path="/faculty/*"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Student */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={`/${role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--clay-surface)',
              color: 'var(--text-primary)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              fontWeight: '500'
            },
            success: {
              iconTheme: {
                primary: '#4CAF50',
                secondary: '#fff'
              },
              style: {
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, var(--clay-surface) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.3)'
              }
            },
            error: {
              iconTheme: {
                primary: '#F44336',
                secondary: '#fff'
              },
              style: {
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, var(--clay-surface) 100%)',
                border: '1px solid rgba(244, 67, 54, 0.3)'
              }
            }
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;

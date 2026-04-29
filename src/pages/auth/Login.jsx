import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClayInput from '../../components/UI/ClayInput';
import PasswordInput from '../../components/UI/PasswordInput';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If a role is selected, adjust username placeholder to hint role
    // (no functional change to auth flow)
  }, [selectedRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Require role selection
    if (!selectedRole) {
      const msg = 'Please select Admin, Faculty, or Student before logging in';
      setErrorMessage(msg);
      toast.error(msg, { duration: 8000, icon: '⛔', style: { background: '#2b2b2b', color: '#ffb4b4' } });
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.username, formData.password, selectedRole);

      if (result && result.success) {
        setErrorMessage('');
        toast.success('Login successful!', { position: 'top-right', icon: '✅', style: { borderRadius: '10px', background: '#183e2b', color: '#e6ffed', padding: '10px 14px' } });
        navigate('/');
        return;
      }

      // Persist error visibly and keep form inputs intact
      const msg = (result && result.message) || 'Login failed';
      setErrorMessage(msg);
      toast.error(msg, { duration: Infinity, icon: '⛔', position: 'top-right', style: { borderRadius: '10px', background: '#2b2b2b', color: '#ffb4b4', padding: '10px 14px' } });
      const u = document.querySelector('input[name="username"]');
      if (u) u.focus();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Unexpected error during login';
      setErrorMessage(msg);
      toast.error(msg, { duration: Infinity, icon: '⛔', position: 'top-right', style: { borderRadius: '10px', background: '#2b2b2b', color: '#ffb4b4', padding: '10px 14px' } });
      const u = document.querySelector('input[name="username"]');
      if (u) u.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--clay-bg)'
    }}>
      <div className="clay-card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            color: 'var(--primary-orange)',
            fontSize: '32px',
            marginBottom: '8px'
          }}>
            CCS Profiling System
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            College of Computing Studies
          </p>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '8px' }}>
            Pamantasan ng Cabuyao
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setSelectedRole('faculty')}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: selectedRole === 'faculty' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: selectedRole === 'faculty' ? 'var(--primary-orange)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Faculty
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: selectedRole === 'student' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: selectedRole === 'student' ? 'var(--primary-orange)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Student
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: selectedRole === 'admin' ? '2px solid var(--primary-orange)' : '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: selectedRole === 'admin' ? 'var(--primary-orange)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: '#b00020', fontWeight: 600, flex: 1 }}>{errorMessage}</div>
              <button
                type="button"
                onClick={() => { setErrorMessage(''); toast.dismiss(); }}
                style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.06)', color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>
          )}
          <ClayInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder={selectedRole ? `Enter ${selectedRole} username` : 'Enter your username'}
            required
            className="mb-md"
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            className="mb-lg"
          />

          <ClayButton
            type="submit"
            disabled={loading || !selectedRole}
            style={{ width: '100%', padding: '14px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </ClayButton>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          paddingTop: '24px',
          borderTop: '1px solid #e8e8ec'
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            New student?{' '}
            <Link 
              to="/enrollment" 
              style={{ 
                color: 'var(--primary-orange)', 
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Student Registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

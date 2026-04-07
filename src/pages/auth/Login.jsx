import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
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
        </div>

        <form onSubmit={handleSubmit}>
          <ClayInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
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
            disabled={loading}
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
              Enroll here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

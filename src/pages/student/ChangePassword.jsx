import { useState } from 'react';
import api from '../../services/api';
import ClayInput from '../../components/UI/ClayInput';
import PasswordInput from '../../components/UI/PasswordInput';
import ClayButton from '../../components/UI/ClayButton';
import ClayCard from '../../components/UI/ClayCard';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Change Password</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Update your account password
      </p>

      <ClayCard style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="mb-md"
          />

          <PasswordInput
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="At least 6 characters"
            className="mb-md"
          />

          <PasswordInput
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="mb-lg"
          />

          <ClayButton
            type="submit"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </ClayButton>
        </form>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(252, 94, 3, 0.1)',
            borderRadius: '12px'
          }}
        >
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            <strong>💡 Tips:</strong>
          </p>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2', marginLeft: '20px' }}>
            <li>Use at least 6 characters</li>
            <li>Include a mix of letters and numbers</li>
            <li>Don't reuse old passwords</li>
            <li>Keep your password secure</li>
          </ul>
        </div>
      </ClayCard>
    </div>
  );
};

export default ChangePassword;

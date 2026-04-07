import { useState } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import PasswordInput from '../../components/UI/PasswordInput';
import toast from 'react-hot-toast';

const FacultyChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);

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

    setSubmitting(true);

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
      setSubmitting(false);
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
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Changing...' : 'Change Password'}
          </ClayButton>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(252, 94, 3, 0.1)',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <strong>🔐 Password Requirements:</strong>
          </p>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2', marginLeft: '20px' }}>
            <li>Minimum 6 characters</li>
            <li>Use a strong, unique password</li>
            <li>Don't reuse your previous password</li>
            <li>Consider using a mix of letters, numbers, and symbols</li>
          </ul>
        </div>
      </ClayCard>
    </div>
  );
};

export default FacultyChangePassword;

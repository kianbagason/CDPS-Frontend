import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import ClayInput from '../../components/UI/ClayInput';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    studentNumber: '', // Auto-generated
    course: 'BSIT',
    yearLevel: 1,
    section: '',
    enrollmentYear: new Date().getFullYear()
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/enrollment/register', formData);
      setCredentials(response.data.data);
      toast.success('Enrollment successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  if (credentials) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="clay-card" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 style={{ color: 'var(--success)', marginBottom: '16px', textAlign: 'center' }}>
            ✓ Enrollment Successful!
          </h2>
          
          <div style={{
            background: 'rgba(252, 94, 3, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-orange)' }}>
              ⚠️ IMPORTANT: Save these credentials now!
            </p>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>
              You will not be able to see your password again.
            </p>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Username:</label>
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                {credentials.username}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Password:</label>
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                {credentials.password}
              </div>
            </div>
            
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Student Number:</label>
              <div style={{
                background: 'white',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '4px',
                fontFamily: 'monospace',
                fontSize: '16px'
              }}>
                {credentials.studentNumber}
              </div>
            </div>
          </div>

          <ClayButton
            onClick={() => navigate('/login')}
            style={{ width: '100%' }}
          >
            Go to Login
          </ClayButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="clay-card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 style={{ color: 'var(--primary-orange)', marginBottom: '8px', textAlign: 'center' }}>
          Student Enrollment
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Step {step} of 2
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Personal Information</h3>
              
              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <ClayInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                />
                <ClayInput
                  label="Suffix"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleChange}
                  placeholder="Jr., Sr., III, etc."
                />
              </div>

              <ClayInput
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mb-md"
              />

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <ClayInput
                  label="Date of Birth"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <ClayInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mb-lg"
              />

              <ClayButton onClick={handleNext} style={{ width: '100%' }} type="button">
                Next Step
              </ClayButton>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Academic Information</h3>
              
              <div style={{
                padding: '16px',
                background: 'rgba(252, 94, 3, 0.1)',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  ℹ️ <strong>Note:</strong> Your student number will be automatically generated upon enrollment.
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Course *
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="BSIT">BSIT - Bachelor of Science in Information Technology</option>
                  <option value="BSCS">BSCS - Bachelor of Science in Computer Science</option>
                  <option value="BSIS">BSIS - Bachelor of Science in Information Systems</option>
                  <option value="ACT">ACT - Associate in Computer Technology</option>
                </select>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    Year Level *
                  </label>
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={handleChange}
                    required
                    className="clay-select"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <ClayInput
                  label="Section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <ClayButton onClick={handleBack} variant="secondary" style={{ flex: 1 }} type="button">
                  Back
                </ClayButton>
                <ClayButton
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Submitting...' : 'Submit Enrollment'}
                </ClayButton>
              </div>
            </div>
          )}
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--primary-orange)', 
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;

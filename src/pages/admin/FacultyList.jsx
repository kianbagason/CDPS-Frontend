import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import CredentialCard from '../../components/UI/CredentialCard';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'CCS',
    position: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data.data);
    } catch (error) {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await api.post('/faculty', formData);
      toast.success('Faculty added successfully!');
      
      // Show credentials in modal
      if (response.data.data.credentials) {
        setCredentials({
          username: response.data.data.credentials.username,
          password: response.data.data.credentials.password,
          facultyId: response.data.data.facultyId,
          name: `${response.data.data.firstName} ${response.data.data.lastName}`
        });
      }
      
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'CCS',
        position: ''
      });
      fetchFaculty();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add faculty');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Faculty</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Total: {faculty.length} faculty members
          </p>
        </div>
        <ClayButton onClick={() => setShowModal(true)}>
          + Add Faculty
        </ClayButton>
      </div>

      {faculty.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No faculty members found. Use the API to add faculty.
          </p>
        </ClayCard>
      ) : (
        <div className="grid grid-3">
          {faculty.map((f) => (
            <ClayCard key={f._id}>
              <h3 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>
                {f.firstName} {f.lastName}
              </h3>
              <div style={{ lineHeight: '2', fontSize: '14px' }}>
                <p><strong>Faculty ID:</strong> {f.facultyId}</p>
                <p><strong>Email:</strong> {f.email}</p>
                <p><strong>Department:</strong> {f.department}</p>
                <p><strong>Position:</strong> {f.position}</p>
                <p><strong>Phone:</strong> {f.phone || 'N/A'}</p>
                {f.subjects?.length > 0 && (
                  <p><strong>Subjects:</strong> {f.subjects.length}</p>
                )}
              </div>
            </ClayCard>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {showModal && !credentials && (
        <div className="clay-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Add Faculty Member</h2>
              <ClayButton onClick={() => setShowModal(false)} variant="secondary">✕</ClayButton>
            </div>

            <form onSubmit={handleSubmit}>
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

              <div style={{
                padding: '12px',
                background: 'rgba(252, 94, 3, 0.1)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  ℹ️ Faculty ID will be auto-generated (e.g., FAC-2026-001)
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  ℹ️ Username and password will be auto-generated and displayed after creation.
                </p>
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

              <ClayInput
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mb-md"
              />

              <ClayInput
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g., Instructor, Assistant Professor"
                className="mb-lg"
              />

              <div style={{
                padding: '12px',
                background: 'rgba(252, 94, 3, 0.1)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  ℹ️ Username and password will be auto-generated and displayed after creation.
                </p>
              </div>

              <ClayButton
                type="submit"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Creating...' : 'Create Faculty Account'}
              </ClayButton>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <div className="clay-modal-overlay" onClick={() => setCredentials(null)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <CredentialCard
              username={credentials.username}
              password={credentials.password}
              facultyId={credentials.facultyId}
              name={credentials.name}
            />
            <ClayButton
              onClick={() => setCredentials(null)}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Close
            </ClayButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyList;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const AddViolation = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentId: '',
    violationType: '',
    description: '',
    sanction: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to load students');
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
      await api.post(`/violations/${formData.studentId}`, {
        violationType: formData.violationType,
        description: formData.description,
        sanction: formData.sanction
      });

      toast.success('Violation recorded successfully!');
      setFormData({
        studentId: '',
        violationType: '',
        description: '',
        sanction: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record violation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Record Student Violation</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Add a violation record for a student
      </p>

      <ClayCard style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Select Student *
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="clay-select"
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.studentNumber} - {student.lastName}, {student.firstName} ({student.course})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Violation Type *
            </label>
            <select
              name="violationType"
              value={formData.violationType}
              onChange={handleChange}
              required
              className="clay-select"
            >
              <option value="">Select violation type...</option>
              <option value="Academic Dishonesty">Academic Dishonesty</option>
              <option value="Plagiarism">Plagiarism</option>
              <option value="Cheating">Cheating</option>
              <option value="Disruptive Behavior">Disruptive Behavior</option>
              <option value="Attendance Violation">Attendance Violation</option>
              <option value="Dress Code Violation">Dress Code Violation</option>
              <option value="Unauthorized Use of Facilities">Unauthorized Use of Facilities</option>
              <option value="Cyber Misconduct">Cyber Misconduct</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <ClayInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Provide detailed description of the violation"
            className="mb-md"
          />

          <ClayInput
            label="Sanction"
            name="sanction"
            value={formData.sanction}
            onChange={handleChange}
            placeholder="e.g., Warning, Suspension, Detention"
            className="mb-lg"
          />

          <ClayButton
            type="submit"
            disabled={submitting || !formData.studentId}
            style={{ width: '100%' }}
          >
            {submitting ? 'Recording...' : 'Record Violation'}
          </ClayButton>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '12px'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            <strong>⚠️ Important:</strong>
          </p>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '2', marginLeft: '20px' }}>
            <li>Violations will be permanently recorded in the student's profile</li>
            <li>Students can view their violations in their portal</li>
            <li>Provide accurate and detailed descriptions</li>
            <li>Sanctions should follow school policies</li>
          </ul>
        </div>
      </ClayCard>
    </div>
  );
};

export default AddViolation;

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await api.get(`/students/${id}`);
      setStudent(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!student) return <div>No student found</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>{student.lastName}, {student.firstName}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Student Number: {student.studentNumber}</p>
        </div>
        <div>
          <ClayButton variant="secondary" onClick={() => navigate(-1)}>Back</ClayButton>
        </div>
      </div>

      <ClayCard>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <h3 style={{ color: 'var(--text-secondary)' }}>Personal Information</h3>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Phone:</strong> {student.phone || 'N/A'}</p>
            <p><strong>Gender:</strong> {student.gender || 'N/A'}</p>
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)' }}>Academic Information</h3>
            <p><strong>Course:</strong> {student.course}</p>
            <p><strong>Year Level:</strong> {student.yearLevel}</p>
            <p><strong>Section:</strong> {student.section}</p>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

export default StudentDetail;

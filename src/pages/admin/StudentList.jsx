import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const viewStudent = async (id) => {
    try {
      const response = await api.get(`/students/${id}`);
      setSelectedStudent(response.data.data);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Students</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Total: {students.length} students
          </p>
        </div>
      </div>

      <ClayCard>
        <div className="clay-table-container">
          <table className="clay-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Course</th>
                <th>Year</th>
                <th>Section</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentNumber}</td>
                  <td>
                    {student.lastName}, {student.firstName} {student.middleName || ''}
                  </td>
                  <td>{student.course}</td>
                  <td>{student.yearLevel}</td>
                  <td>{student.section}</td>
                  <td>{student.email}</td>
                  <td>
                    <span className={`badge badge-${student.status === 'active' ? 'success' : 'warning'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td>
                    <ClayButton
                      onClick={() => viewStudent(student._id)}
                      variant="secondary"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      View
                    </ClayButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ClayCard>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div
          className="clay-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div className="clay-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Student Profile</h2>
              <ClayButton onClick={() => setShowModal(false)} variant="secondary">✕</ClayButton>
            </div>

            <div className="grid grid-2" style={{ marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                  Personal Information
                </h3>
                <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</p>
                <p><strong>Gender:</strong> {selectedStudent.gender || 'N/A'}</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                  Academic Information
                </h3>
                <p><strong>Student Number:</strong> {selectedStudent.studentNumber}</p>
                <p><strong>Course:</strong> {selectedStudent.course}</p>
                <p><strong>Year Level:</strong> {selectedStudent.yearLevel}</p>
                <p><strong>Section:</strong> {selectedStudent.section}</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                Skills ({selectedStudent.skills?.length || 0})
              </h3>
              {selectedStudent.skills?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedStudent.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-info">
                      {skill.skillName} - {skill.proficiencyLevel}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-light)' }}>No skills recorded</p>
              )}
            </div>

            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                Affiliations ({selectedStudent.affiliations?.length || 0})
              </h3>
              {selectedStudent.affiliations?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedStudent.affiliations.map((aff, idx) => (
                    <span key={idx} className="badge badge-success">
                      {aff.organizationName}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-light)' }}>No affiliations recorded</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;

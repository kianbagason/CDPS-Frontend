import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

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

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Students</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Total: {students.length} students
        </p>
      </div>

      {students.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No students enrolled yet
          </p>
        </ClayCard>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="clay-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Course</th>
                <th>Year Level</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td><strong>{student.studentNumber}</strong></td>
                  <td>{student.lastName}, {student.firstName}</td>
                  <td>{student.course}</td>
                  <td>{student.yearLevel}</td>
                  <td>{student.email}</td>
                  <td>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="clay-btn clay-btn-sm clay-btn-primary"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="clay-modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Student Details</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="clay-btn clay-btn-secondary"
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {/* Personal Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>Personal Information</h3>
                <ClayCard>
                  <div className="grid grid-2">
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Student Number</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStudent.studentNumber}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Full Name</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {selectedStudent.firstName} {selectedStudent.middleName && selectedStudent.middleName + ' '}{selectedStudent.lastName}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Email</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStudent.email}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Phone</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStudent.phone || 'N/A'}</p>
                    </div>
                  </div>
                </ClayCard>
              </div>

              {/* Academic Information */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>Academic Information</h3>
                <ClayCard>
                  <div className="grid grid-2">
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Course</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStudent.course}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Year Level</p>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{selectedStudent.yearLevel}</p>
                    </div>
                  </div>
                </ClayCard>
              </div>

              {/* Violations */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>
                  Violations ({selectedStudent.violations?.length || 0})
                </h3>
                {selectedStudent.violations && selectedStudent.violations.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedStudent.violations.map((violation, index) => (
                      <ClayCard key={index} style={{ borderLeft: '4px solid var(--error)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span className="badge badge-error">{violation.violationType}</span>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {new Date(violation.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {violation.description}
                        </p>
                        {violation.sanction && (
                          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <strong>Sanction:</strong> {violation.sanction}
                          </p>
                        )}
                      </ClayCard>
                    ))}
                  </div>
                ) : (
                  <ClayCard>
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--success)' }}>
                      ✅ No violations recorded
                    </p>
                  </ClayCard>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudents;

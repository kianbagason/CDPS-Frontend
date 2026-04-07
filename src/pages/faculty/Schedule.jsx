import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const FacultySchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/schedules/faculty');
      setSchedules(response.data.data);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async (scheduleId) => {
    try {
      const response = await api.get(`/schedules/${scheduleId}/students`);
      setEnrolledStudents(response.data.data);
    } catch (error) {
      toast.error('Failed to load enrolled students');
    }
  };

  const handleViewStudents = async (schedule) => {
    setSelectedSchedule(schedule);
    await fetchEnrolledStudents(schedule._id);
  };

  if (loading) return <Loading />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>My Schedule</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        View your class schedule and enrolled students
      </p>

      {schedules.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No schedule assigned yet. Please contact the admin.
          </p>
        </ClayCard>
      ) : (
        <>
          {/* Schedule Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '16px' }}>Weekly Schedule</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="clay-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Course/Section</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules
                    .sort((a, b) => {
                      const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
                      if (dayDiff !== 0) return dayDiff;
                      return a.startTime.localeCompare(b.startTime);
                    })
                    .map((schedule) => (
                      <tr key={schedule._id}>
                        <td><strong>{schedule.day}</strong></td>
                        <td>{schedule.startTime} - {schedule.endTime}</td>
                        <td>
                          <div>
                            <strong>{schedule.subjectCode}</strong>
                            <br />
                            <small style={{ color: 'var(--text-secondary)' }}>{schedule.subjectName}</small>
                          </div>
                        </td>
                        <td>
                          {schedule.course} - {schedule.section}
                        </td>
                        <td>
                          {schedule.room}
                          {schedule.lab && (
                            <span className="badge badge-info" style={{ marginLeft: '8px' }}>Lab</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewStudents(schedule)}
                            className="clay-btn clay-btn-sm clay-btn-primary"
                          >
                            View Students
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enrolled Students Modal */}
          {selectedSchedule && (
            <div className="clay-modal-overlay" onClick={() => setSelectedSchedule(null)}>
              <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Enrolled Students</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                      {selectedSchedule.subjectCode} - {selectedSchedule.subjectName}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
                      {selectedSchedule.course} - {selectedSchedule.section} | {selectedSchedule.day} {selectedSchedule.startTime}-{selectedSchedule.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSchedule(null)}
                    className="clay-btn clay-btn-secondary"
                  >
                    ✕
                  </button>
                </div>

                {enrolledStudents.length === 0 ? (
                  <ClayCard>
                    <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No students enrolled in this subject yet
                    </p>
                  </ClayCard>
                ) : (
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="clay-table">
                      <thead>
                        <tr>
                          <th>Student Number</th>
                          <th>Name</th>
                          <th>Course</th>
                          <th>Year Level</th>
                          <th>Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map((student) => (
                          <tr key={student._id}>
                            <td><strong>{student.studentNumber}</strong></td>
                            <td>{student.lastName}, {student.firstName}</td>
                            <td>{student.course}</td>
                            <td>{student.yearLevel}</td>
                            <td>{student.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '16px', textAlign: 'right' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Total: <strong style={{ color: 'var(--primary-orange)' }}>{enrolledStudents.length}</strong> students
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultySchedule;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [formData, setFormData] = useState({
    course: 'BSIT',
    section: '',
    subjectCode: '',
    subjectName: '',
    faculty: '',
    room: '',
    lab: false,
    day: '',
    startTime: '',
    endTime: '',
    semester: '1st',
    year: new Date().getFullYear()
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchFaculty();
    fetchSubjects();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedules');
      setSchedules(response.data.data);
    } catch (error) {
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/faculty');
      setFaculty(response.data.data);
    } catch (error) {
      console.error('Failed to load faculty');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Failed to load subjects');
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If subject code is changed, auto-populate subject name
    if (name === 'subjectCode') {
      const selectedSubject = subjects.find(s => s.subjectCode === value);
      if (selectedSubject) {
        setFormData({ 
          ...formData, 
          subjectCode: value,
          subjectName: selectedSubject.subjectName 
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode) {
        await api.put(`/schedules/${editingId}`, formData);
        toast.success('Schedule updated successfully!');
      } else {
        await api.post('/schedules', formData);
        toast.success('Schedule created successfully!');
      }
      
      setShowModal(false);
      setEditMode(false);
      setEditingId(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      course: 'BSIT',
      section: '',
      subjectCode: '',
      subjectName: '',
      faculty: '',
      room: '',
      lab: false,
      day: '',
      startTime: '',
      endTime: '',
      semester: '1st',
      year: new Date().getFullYear()
    });
  };

  const handleEdit = (schedule) => {
    setFormData({
      course: schedule.course,
      section: schedule.section,
      subjectCode: schedule.subjectCode,
      subjectName: schedule.subjectName,
      faculty: schedule.faculty._id,
      room: schedule.room,
      lab: schedule.lab,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      semester: schedule.semester,
      year: schedule.year
    });
    setEditMode(true);
    setEditingId(schedule._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted successfully!');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const handleViewDetails = async (schedule) => {
    setViewingSchedule(schedule);
    await fetchEnrolledStudents(schedule._id);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Schedule Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage class schedules, rooms, and enrollments
          </p>
        </div>
        <ClayButton onClick={() => { setShowModal(true); setEditMode(false); resetForm(); }}>
          + Create Schedule
        </ClayButton>
      </div>

      {schedules.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No schedules created yet. Click "Create Schedule" to add one.
          </p>
        </ClayCard>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="clay-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Course/Section</th>
                <th>Faculty</th>
                <th>Room</th>
                <th>Day</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule._id}>
                  <td>
                    <div>
                      <strong>{schedule.subjectCode}</strong>
                      <br />
                      <small style={{ color: 'var(--text-secondary)' }}>{schedule.subjectName}</small>
                    </div>
                  </td>
                  <td>{schedule.course} - {schedule.section}</td>
                  <td>{schedule.faculty?.lastName || 'N/A'}, {schedule.faculty?.firstName || ''}</td>
                  <td>
                    {schedule.room}
                    {schedule.lab && (
                      <span className="badge badge-info" style={{ marginLeft: '8px' }}>Lab</span>
                    )}
                  </td>
                  <td>{schedule.day}</td>
                  <td>{schedule.startTime} - {schedule.endTime}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleViewDetails(schedule)}
                        className="clay-btn clay-btn-sm clay-btn-primary"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="clay-btn clay-btn-sm clay-btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="clay-btn clay-btn-sm"
                        style={{ background: 'var(--error)', color: 'white' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {showModal && (
        <div className="clay-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>
                {editMode ? 'Edit Schedule' : 'Create New Schedule'}
              </h2>
              <ClayButton onClick={() => setShowModal(false)} variant="secondary">✕</ClayButton>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Subject *</label>
                <select
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="">Select Subject...</option>
                  {subjects
                    .filter(s => s.isActive !== false && (!formData.course || s.course === formData.course))
                    .map(subject => (
                      <option key={subject._id} value={subject.subjectCode}>
                        {subject.subjectCode} - {subject.subjectName} (Year {subject.yearLevel}, {subject.semester})
                      </option>
                    ))}
                </select>
                {subjects.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--warning)', marginTop: '8px' }}>
                    ⚠️ No subjects created yet. Please go to <strong>Subjects</strong> module to add subjects first.
                  </p>
                )}
                {subjects.length > 0 && subjects.filter(s => s.isActive !== false && s.course === formData.course).length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--warning)', marginTop: '8px' }}>
                    ⚠️ No subjects available for {formData.course}. Please add subjects in the Subjects module.
                  </p>
                )}
              </div>

              {formData.subjectName && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Subject Name (Auto-filled)
                  </label>
                  <div style={{ 
                    padding: '12px', 
                    background: 'var(--clay-surface-alt)', 
                    borderRadius: '8px',
                    border: '1px solid var(--clay-border)',
                    color: 'var(--text-primary)',
                    fontWeight: '500'
                  }}>
                    {formData.subjectName}
                  </div>
                </div>
              )}

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Course *</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className="clay-select"
                  >
                    <option value="BSIT">BSIT</option>
                    <option value="BSCS">BSCS</option>
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Faculty *</label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="">Select Faculty...</option>
                  {faculty.map(f => (
                    <option key={f._id} value={f._id}>
                      {f.lastName}, {f.firstName} - {f.facultyId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Room"
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Room 301"
                />
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="lab"
                      checked={formData.lab}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '600' }}>Laboratory Class</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Day *</label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="">Select Day...</option>
                  <option value="Sunday">Sunday</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Start Time"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <ClayInput
                  label="End Time"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    className="clay-select"
                  >
                    <option value="1st">1st Semester</option>
                    <option value="2nd">2nd Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
                <ClayInput
                  label="Year"
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <ClayButton
                type="submit"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Schedule' : 'Create Schedule')}
              </ClayButton>
            </form>
          </div>
        </div>
      )}

      {/* View Schedule Details Modal */}
      {viewingSchedule && (
        <div className="clay-modal-overlay" onClick={() => setViewingSchedule(null)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Schedule Details</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                  {viewingSchedule.subjectCode} - {viewingSchedule.subjectName}
                </p>
              </div>
              <button
                onClick={() => setViewingSchedule(null)}
                className="clay-btn clay-btn-secondary"
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <ClayCard style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>Subject Information</h4>
                <div className="grid grid-2">
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Subject Code</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.subjectCode}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Subject Name</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.subjectName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course/Section</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.course} - {viewingSchedule.section}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Semester/Year</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.semester} Sem, {viewingSchedule.year}</p>
                  </div>
                </div>
              </ClayCard>

              <ClayCard style={{ marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>Schedule Information</h4>
                <div className="grid grid-2">
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Day</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.day}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Time</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.startTime} - {viewingSchedule.endTime}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Room</p>
                    <p style={{ fontWeight: '600' }}>{viewingSchedule.room} {viewingSchedule.lab && '(Laboratory)'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Faculty</p>
                    <p style={{ fontWeight: '600' }}>
                      {viewingSchedule.faculty?.lastName}, {viewingSchedule.faculty?.firstName}
                    </p>
                  </div>
                </div>
              </ClayCard>

              <ClayCard>
                <h4 style={{ color: 'var(--primary-orange)', marginBottom: '12px' }}>
                  Enrolled Students ({enrolledStudents.length})
                </h4>
                {enrolledStudents.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                    No students enrolled yet
                  </p>
                ) : (
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="clay-table">
                      <thead>
                        <tr>
                          <th>Student No.</th>
                          <th>Name</th>
                          <th>Course</th>
                          <th>Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map(student => (
                          <tr key={student._id}>
                            <td><strong>{student.studentNumber}</strong></td>
                            <td>{student.lastName}, {student.firstName}</td>
                            <td>{student.course}</td>
                            <td>{student.yearLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ClayCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;

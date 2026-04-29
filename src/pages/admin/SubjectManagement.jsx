import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import ClayCard from '../../components/UI/ClayCard';
import ClayModal from '../../components/UI/ClayModal';
import toast from 'react-hot-toast';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterCourse, setFilterCourse] = useState('');
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    course: 'BSIT',
    yearLevel: 1,
    semester: '1st',
    units: 3,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, [filterCourse]);

  const fetchSubjects = async () => {
    try {
      const params = {};
      if (filterCourse) params.course = filterCourse;
      
      const response = await api.get('/subjects', { params });
      setSubjects(response.data.data);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editMode) {
        await api.put(`/subjects/${editingId}`, formData);
        toast.success('Subject updated successfully!');
      } else {
        await api.post('/subjects', formData);
        toast.success('Subject created successfully!');
      }
      
      setShowModal(false);
      setEditMode(false);
      setEditingId(null);
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subjectCode: '',
      subjectName: '',
      course: 'BSIT',
      yearLevel: 1,
      semester: '1st',
      units: 3,
      description: ''
    });
  };

  const handleEdit = (subject) => {
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      course: subject.course,
      yearLevel: subject.yearLevel,
      semester: subject.semester,
      units: subject.units,
      description: subject.description || ''
    });
    setEditingId(subject._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted successfully!');
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleAddNew = () => {
    resetForm();
    setEditMode(false);
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return <div className="container"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Subject Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage course codes and subjects for BSIT and BSCS programs
          </p>
        </div>
        <ClayButton onClick={handleAddNew}>+ Add New Subject</ClayButton>
      </div>

      {/* Filter */}
      <ClayCard style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
              Filter by Course
            </label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="clay-select"
            >
              <option value="">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>
        </div>
      </ClayCard>

      {/* Subjects Table */}
      <ClayCard>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--clay-border)' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Code</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Subject Name</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Course</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Year</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Semester</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Units</th>
              <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No subjects found. Click "Add New Subject" to create one.
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject._id} style={{ borderBottom: '1px solid var(--clay-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{subject.subjectCode}</td>
                  <td style={{ padding: '12px' }}>{subject.subjectName}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: subject.course === 'BSIT' ? 'var(--info-light)' : 'var(--warning-light)',
                      color: subject.course === 'BSIT' ? 'var(--info)' : 'var(--warning)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {subject.course}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>Year {subject.yearLevel}</td>
                  <td style={{ padding: '12px' }}>{subject.semester}</td>
                  <td style={{ padding: '12px' }}>{subject.units}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <ClayButton
                        onClick={() => handleEdit(subject)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Edit
                      </ClayButton>
                      <ClayButton
                        onClick={() => handleDelete(subject._id)}
                        variant="danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Delete
                      </ClayButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ClayCard>

      {/* Add/Edit Modal */}
      {showModal && (
        <ClayModal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Edit Subject' : 'Add New Subject'}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2" style={{ marginBottom: '16px' }}>
              <ClayInput
                label="Subject Code *"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleChange}
                required
                placeholder="e.g., IT101"
              />
              <ClayInput
                label="Subject Name *"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                required
                placeholder="e.g., Introduction to Programming"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
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

            <div className="grid grid-3" style={{ marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Year Level *</label>
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
                label="Units *"
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                required
                min="1"
                max="10"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <ClayInput
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional subject description"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <ClayButton type="button" onClick={() => setShowModal(false)} variant="secondary">
                Cancel
              </ClayButton>
              <ClayButton type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : (editMode ? 'Update' : 'Create')}
              </ClayButton>
            </div>
          </form>
        </ClayModal>
      )}
    </div>
  );
};

export default SubjectManagement;

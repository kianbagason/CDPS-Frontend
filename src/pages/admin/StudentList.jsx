import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);
  const navigate = useNavigate();
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // get stats first so we know the total number of students
      const statsResp = await api.get('/students/stats');
      const total = statsResp.data?.data?.totalStudents || 0;
      setTotalCount(total);

      // request all students by setting limit to total (backend supports limit)
      const resp = await api.get('/students', { params: { limit: total } });
      const data = resp.data?.data || [];
      setStudents(data);

      // auto-expand courses so sections are visible
      const expanded = {};
      data.forEach(s => {
        const year = s.yearLevel || 'Unknown';
        const course = s.course || 'Unknown';
        const key = `${year}||${course}`;
        expanded[key] = true;
      });
      setExpandedCourses(expanded);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const searchByStudentNumber = async (q) => {
    if (!q || String(q).trim() === '') {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const resp = await api.get('/students', { params: { studentNumber: q, limit: 10 } });
      setSearchResults(resp.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    } finally {
      setSearching(false);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      setShowModal(false);
      // refresh lists
      fetchStudents();
      if (searchQuery) searchByStudentNumber(searchQuery);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <Loading />;

  // Group students by yearLevel -> course -> section
  const grouped = students.reduce((acc, s) => {
    const year = s.yearLevel || 'Unknown';
    const course = s.course || 'Unknown';
    const section = s.section || 'Unknown';
    if (!acc[year]) acc[year] = {};
    if (!acc[year][course]) acc[year][course] = {};
    if (!acc[year][course][section]) acc[year][course][section] = [];
    acc[year][course][section].push(s);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => {
    // try numeric sort if possible
    const na = Number(a);
    const nb = Number(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.localeCompare(b);
  });

  const toggleCourse = (year, course) => {
    const key = `${year}||${course}`;
    setExpandedCourses(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (year, course, section) => {
    const key = `${year}||${course}||${section}`;
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Simple navigation to section page (no animation)
  const navigateToSection = (year, section) => {
    navigate(`/admin/students/section/${year}/${encodeURIComponent(section)}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Students</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Total: {totalCount !== null ? totalCount : students.length} students
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
          <input
            placeholder="Search by Student #"
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              setSearchQuery(v);
              // hide suggestions UI; results shown in table below
              if (searchTimer.current) {
                clearTimeout(searchTimer.current);
                searchTimer.current = null;
              }
              // debounce
              searchTimer.current = setTimeout(() => {
                searchByStudentNumber(v);
              }, 200);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
            autoComplete="nope"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            name="student_search_noautofill"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // optionally trigger search immediately
                if (searchTimer.current) {
                  clearTimeout(searchTimer.current);
                  searchTimer.current = null;
                }
                searchByStudentNumber(searchQuery);
              }
            }}
            className="clay-input"
            style={{ width: '240px' }}
          />
          
        </div>
      </div>

      {/* If searching, show only search results list */}
      {searchQuery && (
        <ClayCard>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="clay-table" style={{ width: '100%', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Student #</th>
                  <th style={{ width: '45%' }}>Name</th>
                  <th style={{ width: '20%' }}>Section</th>
                  <th style={{ width: '15%' }}>Year</th>
                </tr>
              </thead>
              <tbody>
                {searching && (
                  <tr><td colSpan={4}>Searching...</td></tr>
                )}
                {!searching && searchResults.length === 0 && (
                  <tr><td colSpan={4}>No students found</td></tr>
                )}
                {!searching && searchResults.map((student) => (
                  <tr key={student._id} onClick={() => viewStudent(student._id)} style={{ cursor: 'pointer' }}>
                    <td>{student.studentNumber}</td>
                    <td>{student.lastName}, {student.firstName} {student.middleName || ''}</td>
                    <td>{student.section}</td>
                    <td>{student.yearLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      )}

      {/* Year cards (hidden while searching) */}
      {!searchQuery && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {sortedYears.map((year) => (
          <ClayCard key={year} className="year-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ color: 'var(--primary-orange)', margin: 0 }}>Year {year}</h2>
              <div style={{ color: 'var(--text-secondary)' }}>{Object.values(grouped[year]).flat().length} students</div>
            </div>

            {/* Courses inside year */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.keys(grouped[year]).sort().map((course) => {
                const courseKey = `${year}||${course}`;
                const sections = grouped[year][course];
                const studentCount = Object.values(sections).flat().length;
                return (
                  <div key={course} style={{ minWidth: '280px', flex: '1 1 280px' }}>
                    <ClayCard
                      className="course-card"
                      style={{ padding: '12px', cursor: 'pointer' }}
                      onClick={() => toggleCourse(year, course)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>{course}</h3>
                          <div style={{ color: 'var(--text-light)', fontSize: '13px' }}>{studentCount} students</div>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>{expandedCourses[courseKey] ? '▾' : '▸'}</div>
                      </div>
                    </ClayCard>

                    {/* Sections list (toggle) */}
                    {expandedCourses[courseKey] && (
                      <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                        {Object.keys(sections).sort().map((section) => {
                          const studentsInSection = sections[section];
                          return (
                            <div key={section} style={{ width: '100%' }}>
                              <div
                                role="button"
                                onClick={() => navigateToSection(year, section)}
                                style={{
                                  cursor: 'pointer',
                                  padding: '12px',
                                  borderRadius: '10px',
                                  background: 'var(--clay-surface)',
                                  boxShadow: 'var(--clay-shadow-sm)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  justifyContent: 'center',
                                  minHeight: '80px',
                                  transition: 'transform 150ms ease, box-shadow 150ms ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.35)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--clay-shadow-sm)'; }}
                              >
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{section}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{studentsInSection.length} students</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ClayCard>
        ))}
      </div>
      )}
      {/* Section view is now a separate route: /admin/students/section/:year/:section */}

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
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <ClayButton variant="secondary" onClick={() => navigate(`/admin/students/view/${selectedStudent._id}`)}>Update</ClayButton>
              <ClayButton variant="danger" onClick={() => handleDelete(selectedStudent._id)}>Delete</ClayButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const SectionStudents = () => {
  const { year, section } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    fetchSectionStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, section]);

  // No shared-element animation — this page just renders the students list

  const fetchSectionStudents = async () => {
    try {
      // request students filtered by yearLevel and section on the server
      // set a high limit so we retrieve all students in that section
      const resp = await api.get('/students', { params: { yearLevel: year, section: decodeURIComponent(section), limit: 1000 } });
      const data = resp.data?.data || [];
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load students for this section');
    } finally {
      setLoading(false);
    }
  };

  const searchByStudentNumber = async (q) => {
    if (!q || String(q).trim() === '') {
      setSearchResult(null);
      return;
    }

    setSearching(true);
    try {
      const resp = await api.get('/students', { 
        params: { 
          studentNumber: q, 
          yearLevel: year, 
          section: decodeURIComponent(section),
          limit: 10 
        } 
      });
      const data = resp.data.data || [];
      setSearchResult(data);
    } catch (err) {
      console.error(err);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      // refresh list and clear search
      setSearchQuery('');
      setSearchResult(null);
      fetchSectionStudents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Year {year} — Section {decodeURIComponent(section)}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{students.length} students</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            placeholder="Search by Student #"
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              setSearchQuery(v);
              if (searchTimer.current) {
                clearTimeout(searchTimer.current);
                searchTimer.current = null;
              }
              searchTimer.current = setTimeout(() => searchByStudentNumber(v), 200);
            }}
            className="clay-input"
            style={{ width: '240px' }}
          />
          <ClayButton variant="secondary" onClick={() => navigate('/admin/students')}>Back to Students</ClayButton>
        </div>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {/* If there is an active search, show multiple search results panel */}
        {searchQuery ? (
          <ClayCard>
            <div style={{ padding: '12px' }}>
              {searching && <div style={{ color: 'var(--text-secondary)' }}>Searching...</div>}
              {!searching && (!searchResult || searchResult.length === 0) && <div style={{ color: 'var(--text-light)' }}>No students found</div>}
              {!searching && searchResult && searchResult.length > 0 && (
                <div>
                  <div style={{ marginBottom: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Found {searchResult.length} student{searchResult.length > 1 ? 's' : ''} matching "{searchQuery}"
                  </div>
                  {searchResult.map((student) => (
                    <div 
                      key={student._id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid var(--border-light)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{student.studentNumber}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {student.lastName}, {student.firstName} {student.middleName || ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ClayButton 
                          variant="secondary" 
                          onClick={() => navigate(`/admin/students/view/${student._id}`)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          View
                        </ClayButton>
                        <ClayButton 
                          variant="danger" 
                          onClick={() => handleDelete(student._id)}
                          style={{ fontSize: '12px', padding: '4px 8px' }}
                        >
                          Delete
                        </ClayButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ClayCard>
        ) : (
          <table className="clay-table" style={{ width: '100%', margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Student #</th>
                <th style={{ width: '70%' }}>Name</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentNumber}</td>
                  <td>{student.lastName}, {student.firstName} {student.middleName || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SectionStudents;

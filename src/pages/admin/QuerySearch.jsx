import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const QuerySearch = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    skills: '',
    affiliations: '',
    course: '',
    yearLevel: '',
    status: ''
  });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      params.append('page', pagination.page);

      const response = await api.get(`/query/students?${params.toString()}`);
      setStudents(response.data.data);
      setPagination(response.data.pagination);
      toast.success(`Found ${response.data.count} students`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await api.get(`/query/students/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearFilters = () => {
    setFilters({
      skills: '',
      affiliations: '',
      course: '',
      yearLevel: '',
      status: ''
    });
    setStudents([]);
  };

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>
            Student Query System
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search and filter students by various criteria
          </p>
        </div>
        <ClayButton onClick={handleLogout} variant="secondary">
          Back to Dashboard
        </ClayButton>
      </div>

      {/* Search Filters */}
      <ClayCard style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>🔍 Search Filters</h3>
        
        <div className="grid grid-3" style={{ marginBottom: '16px' }}>
          <ClayInput
            label="Skills (comma-separated)"
            name="skills"
            value={filters.skills}
            onChange={handleFilterChange}
            placeholder="e.g., basketball, programming"
          />
          <ClayInput
            label="Affiliations (comma-separated)"
            name="affiliations"
            value={filters.affiliations}
            onChange={handleFilterChange}
            placeholder="e.g., CSS Club, Basketball Team"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Course</label>
            <select
              name="course"
              value={filters.course}
              onChange={handleFilterChange}
              className="clay-select"
            >
              <option value="">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSIS">BSIS</option>
              <option value="ACT">ACT</option>
            </select>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Year Level</label>
            <select
              name="yearLevel"
              value={filters.yearLevel}
              onChange={handleFilterChange}
              className="clay-select"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="clay-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
              <option value="leave">Leave</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <ClayButton onClick={handleSearch} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Searching...' : 'Search Students'}
          </ClayButton>
          <ClayButton onClick={clearFilters} variant="secondary">
            Clear Filters
          </ClayButton>
          {students.length > 0 && (
            <ClayButton onClick={handleExport} variant="success">
              Export to CSV
            </ClayButton>
          )}
        </div>
      </ClayCard>

      {/* Results */}
      {loading ? (
        <Loading message="Searching students..." />
      ) : students.length > 0 ? (
        <>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>
              Results: {pagination.total} students found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Page {pagination.page} of {pagination.pages}
            </p>
          </div>

          <div className="clay-table-container">
            <table className="clay-table">
              <thead>
                <tr>
                  <th>Student Number</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Skills</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.studentNumber}</td>
                    <td>{student.lastName}, {student.firstName}</td>
                    <td>{student.course}</td>
                    <td>{student.yearLevel}</td>
                    <td>{student.section}</td>
                    <td>
                      {student.skills?.slice(0, 2).map(s => s.skillName).join(', ')}
                      {student.skills?.length > 2 && '...'}
                    </td>
                    <td>
                      <span className={`badge badge-${student.status === 'active' ? 'success' : 'warning'}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
            <ClayButton
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page <= 1}
              variant="secondary"
            >
              Previous
            </ClayButton>
            <ClayButton
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page >= pagination.pages}
              variant="secondary"
            >
              Next
            </ClayButton>
          </div>
        </>
      ) : (
        <ClayCard>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            No results yet. Use the filters above to search for students.
          </p>
        </ClayCard>
      )}

      {/* Example Queries */}
      <ClayCard style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>💡 Example Queries</h3>
        <div className="grid grid-2">
          <div style={{ padding: '12px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
            <strong>Show all students with basketball skill</strong>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Skills: "basketball"
            </p>
          </div>
          <div style={{ padding: '12px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
            <strong>Show all BSIT 3rd year students</strong>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Course: "BSIT", Year: "3"
            </p>
          </div>
          <div style={{ padding: '12px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
            <strong>Show students with programming and CSS Club</strong>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Skills: "programming", Affiliations: "CSS Club"
            </p>
          </div>
          <div style={{ padding: '12px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
            <strong>Show all active students</strong>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Status: "Active"
            </p>
          </div>
        </div>
      </ClayCard>
    </div>
  );
};

export default QuerySearch;

import { useState } from 'react';
import api from '../../services/api';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import ClayCard from '../../components/UI/ClayCard';
import toast from 'react-hot-toast';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [filters, setFilters] = useState({
    course: '',
    yearLevel: '',
    semester: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { value: 'student-enrollment', label: '📊 Student Enrollment Report', description: 'Comprehensive enrollment statistics by course, year, section, and status' },
    { value: 'student-demographics', label: '👥 Student Demographics Report', description: 'Gender and age distribution analysis' },
    { value: 'academic-performance', label: '📚 Academic Performance Report', description: 'Student academic records and performance metrics' },
    { value: 'violations-summary', label: '⚠️ Violations Summary Report', description: 'Student violations analysis by type and status' },
    { value: 'skills-analysis', label: '🎯 Skills Analysis Report', description: 'Student skills distribution and proficiency levels' },
    { value: 'faculty-workload', label: '👨‍🏫 Faculty Workload Report', description: 'Faculty teaching load and schedule distribution' },
    { value: 'events-participation', label: '📅 Events Participation Report', description: 'Event participation statistics and trends' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (filters.course) params.course = filters.course;
      if (filters.yearLevel) params.yearLevel = filters.yearLevel;
      if (filters.semester) params.semester = filters.semester;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get(`/reports/${selectedReport}`, { params });
      setReportData(response.data.data);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData) return;

    let csv = '';
    let headers = [];
    let rows = [];

    // Different export formats based on report type
    if (selectedReport === 'student-enrollment' && reportData.details) {
      headers = ['Student Number', 'Name', 'Course', 'Year Level', 'Section', 'Status', 'Email', 'Enrollment Year'];
      rows = reportData.details.map(s => [
        s.studentNumber,
        s.name,
        s.course,
        s.yearLevel,
        s.section,
        s.status,
        s.email,
        s.enrollmentYear
      ]);
    } else if (selectedReport === 'violations-summary' && reportData.details) {
      headers = ['Student Number', 'Student Name', 'Course', 'Violation Type', 'Description', 'Date', 'Status', 'Sanction'];
      rows = reportData.details.map(v => [
        v.studentNumber,
        v.studentName,
        v.course,
        v.violationType,
        v.description,
        new Date(v.date).toLocaleDateString(),
        v.status,
        v.sanction
      ]);
    } else if (selectedReport === 'skills-analysis' && reportData.details) {
      headers = ['Skill', 'Total Students', 'Proficiency Breakdown'];
      rows = reportData.details.map(s => [
        s.skill,
        s.totalStudents,
        JSON.stringify(s.proficiency)
      ]);
    } else if (selectedReport === 'faculty-workload' && reportData.details) {
      headers = ['Faculty Name', 'Faculty ID', 'Department', 'Total Hours', 'Subjects'];
      rows = reportData.details.map(f => [
        f.facultyName,
        f.facultyId,
        f.department,
        f.totalHours,
        f.subjects.map(s => `${s.subjectCode} (${s.course}-${s.section})`).join('; ')
      ]);
    }

    if (headers.length === 0) {
      toast.error('Export not available for this report type');
      return;
    }

    csv += headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const renderReportSummary = () => {
    if (!reportData) return null;

    return (
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--primary-orange)' }}>{reportData.title}</h2>
          <ClayButton onClick={handleExportCSV}>📥 Export to CSV</ClayButton>
        </div>

        <ClayCard style={{ marginBottom: '24px', padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Summary</h3>
          <div className="grid grid-4">
            {Object.entries(reportData.summary).map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key} style={{ padding: '16px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                      {value.length}
                    </p>
                  </div>
                );
              }
              if (typeof value === 'object') {
                return null;
              }
              return (
                <div key={key} style={{ padding: '16px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </ClayCard>

        {/* Detailed Breakdown */}
        {reportData.summary.byCourse && (
          <ClayCard style={{ marginBottom: '24px', padding: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>By Course</h3>
            <div className="grid grid-2">
              {reportData.summary.byCourse.map(item => (
                <div key={item._id} style={{ padding: '16px', background: 'var(--clay-surface-alt)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>{item._id}</p>
                  <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{item.count} students</p>
                </div>
              ))}
            </div>
          </ClayCard>
        )}

        {reportData.summary.byYearLevel && (
          <ClayCard style={{ marginBottom: '24px', padding: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>By Year Level</h3>
            <div className="grid grid-4">
              {reportData.summary.byYearLevel.map(item => (
                <div key={item._id} style={{ padding: '16px', background: 'var(--clay-surface-alt)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Year {item._id}</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{item.count}</p>
                </div>
              ))}
            </div>
          </ClayCard>
        )}

        {reportData.summary.byStatus && (
          <ClayCard style={{ marginBottom: '24px', padding: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>By Status</h3>
            <div className="grid grid-3">
              {reportData.summary.byStatus.map(item => (
                <div key={item._id} style={{ padding: '16px', background: 'var(--clay-surface-alt)', borderRadius: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>{item._id}</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>{item.count}</p>
                </div>
              ))}
            </div>
          </ClayCard>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Comprehensive Reports</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Generate detailed reports and analytics for CCS programs
      </p>

      <div className="grid grid-2">
        {/* Report Selection */}
        <ClayCard style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Select Report Type</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {reportTypes.map(report => (
              <div
                key={report.value}
                onClick={() => setSelectedReport(report.value)}
                style={{
                  padding: '16px',
                  background: selectedReport === report.value ? 'var(--primary-orange-light)' : 'var(--clay-surface-alt)',
                  border: selectedReport === report.value ? '2px solid var(--primary-orange)' : '2px solid transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{report.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{report.description}</p>
              </div>
            ))}
          </div>
        </ClayCard>

        {/* Filters */}
        <ClayCard style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Filters</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Course</label>
            <select
              name="course"
              value={filters.course}
              onChange={handleChange}
              className="clay-select"
            >
              <option value="">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Year Level</label>
            <select
              name="yearLevel"
              value={filters.yearLevel}
              onChange={handleChange}
              className="clay-select"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Semester</label>
            <select
              name="semester"
              value={filters.semester}
              onChange={handleChange}
              className="clay-select"
            >
              <option value="">All Semesters</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          <div className="grid grid-2" style={{ marginBottom: '24px' }}>
            <ClayInput
              label="Start Date"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
            <ClayInput
              label="End Date"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>

          <ClayButton
            onClick={handleGenerateReport}
            disabled={loading || !selectedReport}
            style={{ width: '100%' }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </ClayButton>
        </ClayCard>
      </div>

      {/* Report Output */}
      {renderReportSummary()}
    </div>
  );
};

export default Reports;

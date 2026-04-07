import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import Loading from '../../components/common/Loading';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/students/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Overview of CCS student information and statistics
      </p>

      {stats && (
        <>
          <div className="grid grid-4" style={{ marginBottom: '32px' }}>
            <ClayCard>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Total Students
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-orange)' }}>
                {stats.totalStudents}
              </p>
            </ClayCard>
            <ClayCard>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Active Students
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--success)' }}>
                {stats.activeStudents}
              </p>
            </ClayCard>
            <ClayCard>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Graduated
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--info)' }}>
                {stats.graduatedStudents}
              </p>
            </ClayCard>
            <ClayCard>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Programs
              </h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--warning)' }}>
                {stats.byCourse?.length || 0}
              </p>
            </ClayCard>
          </div>

          {/* Course Distribution */}
          <ClayCard style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '16px' }}>
              Students by Program
            </h3>
            <div className="grid grid-4">
              {stats.byCourse?.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '16px',
                    background: 'var(--clay-surface-alt)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {item._id}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </ClayCard>

          {/* Year Level Distribution */}
          <ClayCard>
            <h3 style={{ color: 'var(--primary-orange)', marginBottom: '16px' }}>
              Students by Year Level
            </h3>
            <div className="grid grid-4">
              {stats.byYearLevel?.map((item) => (
                <div
                  key={item._id}
                  style={{
                    padding: '16px',
                    background: 'var(--clay-surface-alt)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Year {item._id}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </ClayCard>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

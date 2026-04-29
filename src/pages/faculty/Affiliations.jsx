import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import api from '../../services/api';

const FacultyAffiliations = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, groupRes] = await Promise.all([
          api.get('/organizations'),
          api.get('/organizations/groups')
        ]);
        setOrganizations(orgRes.data.data || []);
        setGroups(groupRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch affiliations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [orgRes, groupRes] = await Promise.all([
        api.get('/organizations'),
        api.get('/organizations/groups')
      ]);
      setOrganizations(orgRes.data.data || []);
      setGroups(groupRes.data.data || []);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  // OIC removed: faculty view is read-only for affiliations

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)' }}>Affiliations (Faculty)</h1>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Affiliated Organizations</h3>
          <button onClick={refreshData} className="clay-button clay-button-secondary">Refresh</button>
        </div>
        <div>
          {organizations.length === 0 ? (
            <ClayCard><p style={{ padding: '16px', color: 'var(--text-secondary)' }}>No organizations yet.</p></ClayCard>
          ) : (
            <div className="grid grid-2">
              {organizations.map((o) => (
                <ClayCard key={o._id}>
                  <h4 style={{ margin: 0 }}>{o.name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{o.description}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}><strong>Members:</strong> {o.members?.length || 0}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: '20px' }}>Groups</h3>
          <button onClick={refreshData} className="clay-button clay-button-secondary">Refresh</button>
        </div>
        <div>
          {groups.length === 0 ? (
            <ClayCard><p style={{ padding: '16px', color: 'var(--text-secondary)' }}>No groups yet.</p></ClayCard>
          ) : (
            <div className="grid grid-2">
              {groups.map((g) => (
                <ClayCard key={g._id}>
                  <h4 style={{ margin: 0 }}>{g.name}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>{g.description}</p>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}><strong>Members:</strong> {g.members?.length || 0}</p>
                </ClayCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyAffiliations;

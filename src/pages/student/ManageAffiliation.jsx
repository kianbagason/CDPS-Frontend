import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageAffiliation = () => {
  const { type, id } = useParams(); // type: 'organization' or 'group'
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        if (type === 'organization') {
          const resp = await api.get(`/organizations`);
          const list = resp.data.data || [];
          let found = list.find(o => o._id === id);
          if (!found) {
            // allow using 7-digit code as identifier
            found = list.find(o => o.code === id);
          }
          setItem(found || null);
        } else {
          const resp = await api.get(`/organizations/groups`);
          const list = resp.data.data || [];
          let found = list.find(g => g._id === id);
          if (!found) {
            found = list.find(g => g.code === id);
          }
          setItem(found || null);
        }
      } catch (err) {
        console.error('Failed to load affiliation', err);
        toast.error('Unable to load affiliation');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [type, id]);

  const approveMember = async (memberId) => {
    try {
      const endpoint = type === 'organization'
        ? `/organizations/${id}/members/${memberId}/approve`
        : `/organizations/groups/${id}/members/${memberId}/approve`;
      await api.put(endpoint);
      toast.success('Member approved');
      // refresh
      const resp = type === 'organization' ? await api.get('/organizations') : await api.get('/organizations/groups');
      const found = (resp.data.data || []).find(x => x._id === id);
      setItem(found || null);
    } catch (err) {
      console.error('Approve failed', err);
      toast.error('Approve failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!item) return (
    <div>
      <h2 style={{ color: 'var(--primary-orange)' }}>Affiliation not found</h2>
      <ClayButton onClick={() => navigate('/student/profile')} variant="secondary">Back</ClayButton>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: 'var(--primary-orange)' }}>{type === 'organization' ? 'Manage Organization' : 'Manage Group'}</h2>
      <ClayCard>
        <h3 style={{ margin: 0 }}>{item.name}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
      </ClayCard>

      <div style={{ marginTop: '16px' }}>
        <h4>Pending Members</h4>
        {((item.members || []).filter(m => m.status === 'pending')).length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No pending members</p>
        ) : (
          (item.members || []).filter(m => m.status === 'pending').map((m) => (
            <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{m.studentId?.firstName} {m.studentId?.lastName}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{m.studentId?.studentNumber}</div>
              </div>
              <div>
                <ClayButton onClick={() => approveMember(m._id)}>Approve</ClayButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageAffiliation;

import { useState, useEffect } from 'react';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ViolationsHistory = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/violations');
        setRecords(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load violations history');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: 'var(--primary-orange)', margin: 0 }}>Violations History</h1>
        <ClayButton variant="secondary" onClick={() => navigate('/admin/violations')}>Back to Record</ClayButton>
      </div>

      <ClayCard style={{ padding: 16 }}>
        {records.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No violation records found.</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {records.map((r, idx) => (
              <div key={`${r.studentId}-${r.violation._id || idx}`} style={{ padding: 12, borderRadius: 8, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>
                    {r.violation.violationType} — {r.studentName} ({r.studentNumber})
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                    {new Date(r.violation.date || r.violation.createdAt || Date.now()).toLocaleString()}
                  </div>
                </div>

                <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{r.violation.description}</div>
                {r.violation.sanction && <div style={{ marginTop: 8 }}><strong>Sanction:</strong> {r.violation.sanction}</div>}
                {r.violation.message && <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}><strong>Message:</strong> {r.violation.message}</div>}
              </div>
            ))}
          </div>
        )}
      </ClayCard>
    </div>
  );
};

export default ViolationsHistory;

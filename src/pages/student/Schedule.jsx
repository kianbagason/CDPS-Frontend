import { useEffect, useState } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';

const daysOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const StudentSchedule = () => {
  const [profile, setProfile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await api.get('/students/profile/me');
        setProfile(resp.data.data);
        const course = resp.data.data?.course;
        const section = resp.data.data?.section;
        if (!course || !section) {
          setSchedules([]);
          setLoading(false);
          return;
        }

        const schedResp = await api.get('/schedules', { params: { course, section } });
        setSchedules(schedResp.data.data || []);
      } catch (err) {
        console.error('Failed to load schedule', err);
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Loading schedule...</div>;

  if (!profile) return <div>No profile found.</div>;

  if (schedules.length === 0) return (
    <div>
      <h3>My Schedule</h3>
      <p style={{ color: 'var(--text-secondary)' }}>No schedules</p>
    </div>
  );

  // Group by day
  const grouped = schedules.reduce((acc, s) => {
    acc[s.day] = acc[s.day] || [];
    acc[s.day].push(s);
    return acc;
  }, {});

  return (
    <div>
      <h3>My Schedule — {profile.course} {profile.yearLevel} - Section {profile.section}</h3>
      <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
        {daysOrder.map(day => (
          (grouped[day] || []).length > 0 ? (
            <ClayCard key={day}>
              <h4 style={{ margin: '4px 0' }}>{day}</h4>
              {(grouped[day] || []).map((s) => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.subjectCode} — {s.subjectName}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.room || 'TBA'} • {s.faculty?.firstName} {s.faculty?.lastName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>{s.startTime} - {s.endTime}</div>
                </div>
              ))}
            </ClayCard>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default StudentSchedule;

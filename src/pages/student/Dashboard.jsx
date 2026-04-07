import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, eventsRes] = await Promise.all([
        api.get('/students/profile/me'),
        api.get('/events')
      ]);
      setProfile(profileRes.data.data);
      setEvents(eventsRes.data.data.slice(0, 3)); // Show only 3 latest events
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>
        Welcome, {profile?.firstName}!
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Here's your academic overview and upcoming events
      </p>

      {profile && (
        <>
          {/* Profile Summary */}
          <div className="grid grid-2" style={{ marginBottom: '32px' }}>
            <ClayCard>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>
                📋 Personal Information
              </h3>
              <div style={{ lineHeight: '2' }}>
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Student Number:</strong> {profile.studentNumber}</p>
                <p><strong>Course:</strong> {profile.course}</p>
                <p><strong>Year Level:</strong> {profile.yearLevel} Year</p>
                <p><strong>Section:</strong> {profile.section}</p>
                <p><strong>Email:</strong> {profile.email}</p>
              </div>
            </ClayCard>

            <ClayCard>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>
                📊 Academic Summary
              </h3>
              <div style={{ lineHeight: '2' }}>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge badge-${profile.status === 'active' ? 'success' : 'warning'}`}>
                    {profile.status}
                  </span>
                </p>
                <p><strong>Skills:</strong> {profile.skills?.length || 0}</p>
                <p><strong>Affiliations:</strong> {profile.affiliations?.length || 0}</p>
                <p><strong>Activities:</strong> {profile.nonAcademicActivities?.length || 0}</p>
                <p><strong>Violations:</strong> {profile.violations?.length || 0}</p>
              </div>
            </ClayCard>
          </div>

          {/* Skills Section */}
          {profile.skills?.length > 0 && (
            <ClayCard style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>
                🎯 Your Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {profile.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 20px',
                      background: 'var(--clay-surface-alt)',
                      borderRadius: '12px',
                      boxShadow: 'var(--clay-shadow-sm)'
                    }}
                  >
                    <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {skill.skillName}
                    </p>
                    <span className="badge badge-info">{skill.proficiencyLevel}</span>
                  </div>
                ))}
              </div>
            </ClayCard>
          )}

          {/* Upcoming Events */}
          <ClayCard>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary-orange)' }}>
              📅 Upcoming Events
            </h3>
            {events.length > 0 ? (
              <div className="grid grid-3">
                {events.map((event) => {
                  const isRegistered = event.participants?.includes(profile._id);
                  return (
                    <div
                      key={event._id}
                      style={{
                        padding: '16px',
                        background: isRegistered ? 'rgba(76, 175, 80, 0.1)' : 'var(--clay-surface-alt)',
                        borderRadius: '12px',
                        border: isRegistered ? '2px solid var(--success)' : 'none'
                      }}
                    >
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {event.title}
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${event.status === 'upcoming' ? 'info' : 'success'}`}>
                          {event.status}
                        </span>
                        {isRegistered && (
                          <span className="badge badge-success">✓ Registered</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-light)' }}>No upcoming events</p>
            )}
          </ClayCard>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;

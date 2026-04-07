import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import EventTicket from '../../components/UI/EventTicket';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const StudentEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchStudentProfile();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProfile = async () => {
    try {
      const response = await api.get('/students/profile');
      setStudentProfile(response.data.data);
    } catch (error) {
      console.error('Failed to load profile');
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      toast.success('Successfully registered for event!');
      fetchEvents(); // Refresh events
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <h1 style={{ color: 'var(--primary-orange)', marginBottom: '8px' }}>Events</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Curricular and Extracurricular Activities
      </p>

      {events.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No events available at the moment
          </p>
        </ClayCard>
      ) : (
        <div className="grid grid-2">
          {events.map((event) => (
            <ClayCard key={event._id}>
              <div style={{ marginBottom: '12px' }}>
                <span className={`badge badge-${event.type === 'curricular' ? 'info' : 'success'}`}>
                  {event.type}
                </span>
                <span className={`badge badge-${event.status === 'upcoming' ? 'warning' : 'success'}`} style={{ marginLeft: '8px' }}>
                  {event.status}
                </span>
              </div>
              
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
                {event.title}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                {event.description}
              </p>

              <div style={{ lineHeight: '2', fontSize: '14px', marginBottom: '16px' }}>
                <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>🕐 Time:</strong> {event.startTime} - {event.endTime}</p>
                <p><strong>📍 Location:</strong> {event.location}</p>
                <p><strong>👤 Organizer:</strong> {event.organizer}</p>
                {event.maxParticipants && (
                  <p>
                    <strong>👥 Participants:</strong>{' '}
                    {event.participants?.length || 0} / {event.maxParticipants}
                  </p>
                )}
              </div>

              {event.status === 'upcoming' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!event.participants?.includes(user.id) ? (
                    <ClayButton
                      onClick={() => handleRegister(event._id)}
                      disabled={event.maxParticipants && event.participants?.length >= event.maxParticipants}
                      style={{ flex: 1 }}
                    >
                      {event.participants?.length >= event.maxParticipants ? 'Event Full' : 'Register'}
                    </ClayButton>
                  ) : (
                    <EventTicket 
                      event={event} 
                      student={studentProfile || { _id: user.id, firstName: 'Student', lastName: '', studentNumber: '', course: '' }} 
                    />
                  )}
                </div>
              )}
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentEvents;

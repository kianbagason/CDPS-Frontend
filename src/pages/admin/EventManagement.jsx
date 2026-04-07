import { useState, useEffect } from 'react';
import api from '../../services/api';
import ClayCard from '../../components/UI/ClayCard';
import ClayButton from '../../components/UI/ClayButton';
import ClayInput from '../../components/UI/ClayInput';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'curricular',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    organizer: '',
    maxParticipants: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/events', formData);
      toast.success('Event created successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'curricular',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        organizer: '',
        maxParticipants: ''
      });
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--primary-orange)', marginBottom: '4px' }}>Event Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Create and manage events for students
          </p>
        </div>
        <ClayButton onClick={() => setShowModal(true)}>
          + Create Event
        </ClayButton>
      </div>

      {events.length === 0 ? (
        <ClayCard>
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No events created yet. Click "Create Event" to add one.
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

              <div style={{ lineHeight: '2', fontSize: '14px' }}>
                <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>🕐 Time:</strong> {event.startTime} - {event.endTime}</p>
                <p><strong>📍 Location:</strong> {event.location}</p>
                <p><strong>👤 Organizer:</strong> {event.organizer}</p>
                <p><strong>👥 Participants:</strong> {event.participants?.length || 0} / {event.maxParticipants || 'Unlimited'}</p>
              </div>
            </ClayCard>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="clay-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="clay-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'var(--primary-orange)' }}>Create New Event</h2>
              <ClayButton onClick={() => setShowModal(false)} variant="secondary">✕</ClayButton>
            </div>

            <form onSubmit={handleSubmit}>
              <ClayInput
                label="Event Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mb-md"
              />

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Event Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="clay-select"
                >
                  <option value="curricular">Curricular</option>
                  <option value="extracurricular">Extracurricular</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="clay-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <ClayInput
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="mb-md"
              />

              <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                <ClayInput
                  label="Start Time"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <ClayInput
                  label="End Time"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <ClayInput
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="mb-md"
              />

              <ClayInput
                label="Organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                required
                placeholder="e.g., CCS Department, Student Council"
                className="mb-md"
              />

              <ClayInput
                label="Max Participants (optional)"
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                className="mb-lg"
              />

              <ClayButton
                type="submit"
                disabled={submitting}
                style={{ width: '100%' }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </ClayButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;

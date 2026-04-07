import { useState } from 'react';
import { FaQrcode, FaDownload } from 'react-icons/fa';

const EventTicket = ({ event, student }) => {
  const [showTicket, setShowTicket] = useState(false);

  // Generate unique ticket code
  const generateTicketCode = () => {
    const eventCode = event._id.substring(0, 6).toUpperCase();
    const studentCode = student._id.substring(0, 6).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    return `CCS-${eventCode}-${studentCode}-${timestamp}`;
  };

  const ticketCode = generateTicketCode();

  if (!showTicket) {
    return (
      <button
        onClick={() => setShowTicket(true)}
        style={{
          background: 'var(--primary-orange)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '10px 20px',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        <FaQrcode /> View Ticket
      </button>
    );
  }

  return (
    <div className="clay-modal-overlay" onClick={() => setShowTicket(false)}>
      <div className="clay-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--primary-orange)', margin: 0 }}>🎫 Event Ticket</h2>
          <button
            onClick={() => setShowTicket(false)}
            className="clay-btn clay-btn-secondary"
          >
            ✕
          </button>
        </div>

        {/* Ticket Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(252, 94, 3, 0.15) 0%, rgba(252, 94, 3, 0.05) 100%)',
            border: '3px solid var(--primary-orange)',
            borderRadius: '20px',
            padding: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(252, 94, 3, 0.1)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(252, 94, 3, 0.08)'
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
            <h3 style={{ color: 'var(--primary-orange)', margin: '0 0 8px 0', fontSize: '20px' }}>
              CCS EVENT TICKET
            </h3>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'var(--primary-orange)',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>

          {/* Event Details */}
          <div
            style={{
              background: 'var(--clay-surface)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <h4 style={{ color: 'var(--text-primary)', margin: '0 0 12px 0', fontSize: '18px' }}>
              {event.title}
            </h4>
            
            <div style={{ lineHeight: '2', fontSize: '14px' }}>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                <strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                <strong>🕐 Time:</strong> {event.startTime} - {event.endTime}
              </p>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                <strong>📍 Location:</strong> {event.location}
              </p>
              <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                <strong>📋 Type:</strong> {event.type}
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div
            style={{
              background: 'var(--clay-surface)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Attendee:</strong>
            </p>
            <p style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {student.firstName} {student.lastName}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              {student.studentNumber} • {student.course}
            </p>
          </div>

          {/* Ticket Code */}
          <div
            style={{
              background: 'var(--clay-bg)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1,
              border: '2px dashed var(--primary-orange)'
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              TICKET CODE
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--primary-orange)',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                wordBreak: 'break-all'
              }}
            >
              {ticketCode}
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div
              style={{
                width: '150px',
                height: '150px',
                margin: '0 auto',
                background: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-orange)',
                fontSize: '48px'
              }}
            >
              <FaQrcode />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Present this ticket at the event
            </p>
          </div>

          {/* Warning */}
          <div
            style={{
              padding: '12px',
              background: 'rgba(244, 67, 54, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              ⚠️ This ticket is non-transferable. Please present this upon entry.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowTicket(false)}
          style={{
            width: '100%',
            marginTop: '16px',
            background: 'var(--primary-orange)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default EventTicket;

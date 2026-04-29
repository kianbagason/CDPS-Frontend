import React from 'react';
import ClayButton from '../../components/UI/ClayButton';
import './ViolationSidebar.css';

const SAMPLE_DESCRIPTIONS = {
  'Academic Dishonesty': 'Unauthorized collaboration, copying, or use of prohibited materials during an academic assessment. Provide details and evidence if available.',
  'Plagiarism': 'Using another person\'s work, ideas, or words without proper citation. Include source links or excerpts where applicable.',
  'Cheating': 'Any attempt to obtain unfair advantage during exams or assignments (e.g., using unauthorized devices).',
  'Disruptive Behavior': 'Behavior that interrupts the learning environment, including verbal or physical actions that disturb others.',
  'Attendance Violation': 'Failure to attend required classes or activities without approved leave or justification.',
  'Dress Code Violation': 'Failure to follow the institution\'s dress code policy; describe apparel and context.',
  'Unauthorized Use of Facilities': 'Using restricted facilities or equipment without permission.',
  'Cyber Misconduct': 'Misuse of school IT systems, harassment online, or unauthorized access of digital resources.',
  'Other': 'Provide a clear description of the incident and any supporting evidence or witnesses.'
};

const ViolationSidebar = ({ open, onClose, violations = [] }) => {
  if (!open) return null;

  return (
    <div className="violation-sidebar-overlay">
      <div className="violation-sidebar-panel">
        <div className="violation-sidebar-header">
          <h3>Violations & Reports</h3>
          <ClayButton onClick={onClose}>Close</ClayButton>
        </div>

        <div className="violation-sidebar-body">
          {(!violations || violations.length === 0) && (
            <div className="violation-empty">You have no recorded violations.</div>
          )}

          {violations.slice().reverse().map(v => (
            <div className="violation-item" key={v._id}>
              <div className="violation-meta">
                <div className="violation-type">{v.violationType}</div>
                <div className="violation-date">{new Date(v.date).toLocaleString()} • {v.status}</div>
              </div>

              <div className="violation-desc">
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Summary</div>
                <div style={{ marginBottom: 8 }}>{v.description || SAMPLE_DESCRIPTIONS[v.violationType] || SAMPLE_DESCRIPTIONS['Other']}</div>
                <div style={{ fontSize: 13, color: '#666' }}>Message: {v.message || '—'}</div>
              </div>

              <div className="violation-actions">
                {v.reportUrl ? (
                  <a href={v.reportUrl} target="_blank" rel="noreferrer">
                    <ClayButton>Download Report</ClayButton>
                  </a>
                ) : (
                  <div style={{ color: '#777', fontSize: 13 }}>Report not available</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViolationSidebar;

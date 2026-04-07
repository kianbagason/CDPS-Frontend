import { useEffect } from 'react';
import ClayButton from './ClayButton';

const ClayModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="clay-modal-overlay" onClick={onClose}>
      <div className="clay-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ color: 'var(--primary-orange)', fontSize: '24px' }}>
            {title}
          </h2>
          <ClayButton 
            onClick={onClose} 
            variant="secondary"
            style={{ padding: '8px 16px' }}
          >
            ✕
          </ClayButton>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ClayModal;

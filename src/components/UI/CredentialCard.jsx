import { useState } from 'react';
import { FaCopy, FaCheck } from 'react-icons/fa';

const CredentialCard = ({ username, password, facultyId, name }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(252, 94, 3, 0.1) 0%, rgba(252, 94, 3, 0.05) 100%)',
        border: '2px solid var(--primary-orange)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '16px'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary-orange)', margin: '0 0 8px 0' }}>
          ✅ Faculty Account Created!
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
          Please save these credentials securely
        </p>
      </div>

      <div
        style={{
          background: 'var(--clay-surface)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
            Faculty Name
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            {name}
          </p>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
            Faculty ID
          </p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary-orange)', margin: 0 }}>
            {facultyId}
          </p>
        </div>
      </div>

      <div
        style={{
          background: 'var(--clay-surface)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Username
          </p>
          <button
            onClick={() => copyToClipboard(username, 'username')}
            style={{
              background: copiedField === 'username' ? 'var(--success)' : 'var(--primary-orange)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            {copiedField === 'username' ? <FaCheck /> : <FaCopy />}
            {copiedField === 'username' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
            padding: '12px',
            background: 'var(--clay-bg)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}
        >
          {username}
        </p>
      </div>

      <div
        style={{
          background: 'var(--clay-surface)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Password
          </p>
          <button
            onClick={() => copyToClipboard(password, 'password')}
            style={{
              background: copiedField === 'password' ? 'var(--success)' : 'var(--primary-orange)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            {copiedField === 'password' ? <FaCheck /> : <FaCopy />}
            {copiedField === 'password' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
            padding: '12px',
            background: 'var(--clay-bg)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}
        >
          {password}
        </p>
      </div>

      <div
        style={{
          padding: '12px',
          background: 'rgba(244, 67, 54, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(244, 67, 54, 0.3)'
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
          ⚠️ <strong>Important:</strong> These credentials will only be shown once. Please copy and save them securely.
        </p>
      </div>
    </div>
  );
};

export default CredentialCard;

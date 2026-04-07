const ClayInput = ({ 
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  name,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600',
          color: 'var(--text-primary)'
        }}>
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        className="clay-input"
      />
    </div>
  );
};

export default ClayInput;

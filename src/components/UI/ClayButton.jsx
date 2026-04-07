const ClayButton = ({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const variantClass = variant === 'primary' 
    ? 'clay-btn'
    : variant === 'secondary'
    ? 'clay-btn clay-btn-secondary'
    : variant === 'success'
    ? 'clay-btn clay-btn-success'
    : variant === 'danger'
    ? 'clay-btn clay-btn-danger'
    : 'clay-btn';

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ClayButton;

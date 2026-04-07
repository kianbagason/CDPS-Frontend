const ClayCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`clay-card ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
};

export default ClayCard;

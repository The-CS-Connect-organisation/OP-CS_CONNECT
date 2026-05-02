import '../../styles/glassmorphism.css';

const GlassCard = ({ 
  children, 
  blur = 10, 
  opacity = 0.1, 
  borderOpacity = 0.2,
  className = '',
  ...props 
}) => {
  const style = {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity})`
  };

  return (
    <div 
      className={`glass-card ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

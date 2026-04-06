const colorMap = {
  default: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  indigo: 'badge-indigo',
  cyan: 'badge-cyan',
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const color = variant;
  return (
    <span className={`badge ${colorMap[color] || colorMap.default} ${className}`}>
      {children}
    </span>
  );
}

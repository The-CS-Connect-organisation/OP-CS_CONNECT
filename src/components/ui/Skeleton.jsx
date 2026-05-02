export const Skeleton = ({ className = '', ...props }) => (
  <div 
    className={`relative overflow-hidden rounded-xl bg-slate-800/60 ${className}`} 
    {...props}
  >
    <div 
      className="absolute inset-0 animate-shimmer"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }}
    />
  </div>
);

export const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-muted)]">{label}</label>
      )}
      <input className={`input-field ${className}`} {...props} />
    </div>
  );
}

import React, { useState } from 'react';
import '../../styles/glassmorphism.css';

const GlassInput = ({ 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  className = '',
  icon: Icon,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`glass-input-wrapper ${isFocused ? 'focused' : ''} ${className}`}>
      {Icon && <Icon className="glass-input-icon" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="glass-input"
        {...props}
      />
      <div className="glass-input-border" />
    </div>
  );
};

export default GlassInput;

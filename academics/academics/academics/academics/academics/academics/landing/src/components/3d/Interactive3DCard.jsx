import React, { useRef, useState } from 'react';
import useMousePosition from '../../hooks/useMousePosition';
import './Interactive3DCard.css';

const Interactive3DCard = ({ 
  children, 
  className = '',
  maxRotation = 15,
  glowColor = 'rgba(99, 102, 241, 0.4)',
  ...props 
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation angles (inverted for natural feel)
    const rotateYValue = (mouseX / (rect.width / 2)) * maxRotation;
    const rotateXValue = -(mouseY / (rect.height / 2)) * maxRotation;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth return to neutral position
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div 
      ref={cardRef}
      className={`interactive-3d-card ${isHovered ? 'hovered' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        '--rotate-x': `${rotateX}deg`,
        '--rotate-y': `${rotateY}deg`,
        '--glow-color': glowColor
      }}
      {...props}
    >
      <div className="interactive-3d-card-inner">
        {children}
      </div>
      <div className="interactive-3d-card-glow" />
    </div>
  );
};

export default Interactive3DCard;

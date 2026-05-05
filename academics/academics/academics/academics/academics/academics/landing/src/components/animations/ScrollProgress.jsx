import React from 'react';
import useScrollProgress from '../../hooks/useScrollProgress';
import './ScrollProgress.css';

const ScrollProgress = ({ 
  position = 'top', // 'top' or 'bottom'
  height = 4,
  colors = ['#6366f1', '#a855f7', '#ec4899'],
  showGlow = true,
  showPercentage = false
}) => {
  const scrollProgress = useScrollProgress();
  const progressPercent = Math.round(scrollProgress * 100);

  const gradientColors = colors.join(', ');

  return (
    <>
      <div 
        className={`scroll-progress ${position} ${showGlow ? 'glow' : ''}`}
        style={{
          height: `${height}px`
        }}
      >
        <div 
          className="scroll-progress-bar"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${gradientColors})`,
            boxShadow: showGlow ? `0 0 20px ${colors[0]}` : 'none'
          }}
        >
          {progressPercent === 100 && (
            <div className="scroll-progress-complete">
              <span className="completion-sparkle">✨</span>
            </div>
          )}
        </div>
      </div>
      
      {showPercentage && (
        <div className="scroll-percentage">
          {progressPercent}%
        </div>
      )}
    </>
  );
};

export default ScrollProgress;

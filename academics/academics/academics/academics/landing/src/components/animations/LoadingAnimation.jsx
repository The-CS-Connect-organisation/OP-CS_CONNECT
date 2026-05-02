import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ 
  onComplete,
  duration = 2000,
  showProgress = true
}) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    };
    
    requestAnimationFrame(updateProgress);
  }, [duration, onComplete]);

  return (
    <div className={`loading-animation ${isComplete ? 'complete' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-ring ring-1" />
          <div className="logo-ring ring-2" />
          <div className="logo-ring ring-3" />
          <div className="logo-center">
            <span className="logo-text">CS</span>
          </div>
        </div>
        
        {showProgress && (
          <div className="loading-progress">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {Math.round(progress)}%
            </div>
          </div>
        )}
        
        <div className="loading-text">
          <span className="loading-letter">L</span>
          <span className="loading-letter">o</span>
          <span className="loading-letter">a</span>
          <span className="loading-letter">d</span>
          <span className="loading-letter">i</span>
          <span className="loading-letter">n</span>
          <span className="loading-letter">g</span>
          <span className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;

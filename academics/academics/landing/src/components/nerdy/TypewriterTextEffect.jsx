import React, { useState, useEffect } from 'react';
import './TypewriterTextEffect.css';

const TypewriterTextEffect = ({ 
  text,
  speed = 50,
  delay = 0,
  showCursor = true,
  loop = false,
  onComplete,
  className = '',
  as: Component = 'p'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex === 0 && delay > 0) {
      const delayTimeout = setTimeout(() => {
        setCurrentIndex(1);
      }, delay);
      return () => clearTimeout(delayTimeout);
    }

    if (currentIndex > 0 && currentIndex <= text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }

    if (currentIndex > text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();

      if (loop) {
        setTimeout(() => {
          setCurrentIndex(0);
          setDisplayedText('');
          setIsComplete(false);
        }, 2000);
      }
    }
  }, [currentIndex, text, speed, delay, loop, isComplete, onComplete]);

  return (
    <Component className={`typewriter-text ${className}`}>
      {displayedText}
      {showCursor && (
        <span className={`typewriter-cursor ${isComplete && !loop ? 'blink' : ''}`}>
          |
        </span>
      )}
    </Component>
  );
};

export default TypewriterTextEffect;

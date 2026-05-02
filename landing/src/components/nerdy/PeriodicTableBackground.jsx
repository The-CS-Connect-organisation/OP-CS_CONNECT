import React, { useRef, useEffect } from 'react';
import usePerformanceMonitor from '../../hooks/usePerformanceMonitor';
import './PeriodicTableBackground.css';

const PeriodicTableBackground = ({ 
  elementCount = 20,
  glowIntensity = 0.5
}) => {
  const containerRef = useRef(null);
  const { shouldReduceQuality } = usePerformanceMonitor();

  const elements = [
    { symbol: 'H', name: 'Hydrogen', number: 1, color: '#60a5fa' },
    { symbol: 'He', name: 'Helium', number: 2, color: '#a78bfa' },
    { symbol: 'C', name: 'Carbon', number: 6, color: '#6366f1' },
    { symbol: 'N', name: 'Nitrogen', number: 7, color: '#8b5cf6' },
    { symbol: 'O', name: 'Oxygen', number: 8, color: '#a855f7' },
    { symbol: 'Na', name: 'Sodium', number: 11, color: '#ec4899' },
    { symbol: 'Mg', name: 'Magnesium', number: 12, color: '#f472b6' },
    { symbol: 'Al', name: 'Aluminum', number: 13, color: '#fb7185' },
    { symbol: 'Si', name: 'Silicon', number: 14, color: '#6366f1' },
    { symbol: 'P', name: 'Phosphorus', number: 15, color: '#8b5cf6' },
    { symbol: 'S', name: 'Sulfur', number: 16, color: '#a855f7' },
    { symbol: 'Cl', name: 'Chlorine', number: 17, color: '#60a5fa' },
    { symbol: 'K', name: 'Potassium', number: 19, color: '#ec4899' },
    { symbol: 'Ca', name: 'Calcium', number: 20, color: '#f472b6' },
    { symbol: 'Fe', name: 'Iron', number: 26, color: '#6366f1' },
    { symbol: 'Cu', name: 'Copper', number: 29, color: '#f59e0b' },
    { symbol: 'Zn', name: 'Zinc', number: 30, color: '#8b5cf6' },
    { symbol: 'Ag', name: 'Silver', number: 47, color: '#a855f7' },
    { symbol: 'Au', name: 'Gold', number: 79, color: '#f59e0b' },
    { symbol: 'Hg', name: 'Mercury', number: 80, color: '#60a5fa' }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const adjustedCount = shouldReduceQuality ? Math.floor(elementCount * 0.6) : elementCount;

    // Clear existing elements
    container.innerHTML = '';

    // Create random positioned elements
    for (let i = 0; i < adjustedCount; i++) {
      const element = elements[Math.floor(Math.random() * elements.length)];
      const elementDiv = document.createElement('div');
      elementDiv.className = 'periodic-element';
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      
      elementDiv.style.left = `${x}%`;
      elementDiv.style.top = `${y}%`;
      elementDiv.style.animationDelay = `${delay}s`;
      elementDiv.style.animationDuration = `${duration}s`;
      elementDiv.style.setProperty('--element-color', element.color);
      elementDiv.style.setProperty('--glow-intensity', glowIntensity);
      
      elementDiv.innerHTML = `
        <div class="element-number">${element.number}</div>
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-name">${element.name}</div>
      `;
      
      container.appendChild(elementDiv);
    }
  }, [elementCount, glowIntensity, shouldReduceQuality]);

  return <div ref={containerRef} className="periodic-table-background" />;
};

export default PeriodicTableBackground;

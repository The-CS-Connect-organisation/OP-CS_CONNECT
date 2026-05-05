import React, { useState, useEffect } from 'react';
import useScrollProgress from '../../hooks/useScrollProgress';
import '../../styles/glassmorphism.css';

const AnimatedNav = ({ links = [], logo, className = '' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Determine active section based on scroll position
      const sections = links.map(link => document.getElementById(link.href.replace('#', '')));
      const scrollPosition = window.scrollY + 100;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(links[i].href);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [links]);

  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav 
      className={`animated-nav ${isScrolled ? 'scrolled' : ''} ${className}`}
      style={{
        '--scroll-progress': scrollProgress
      }}
    >
      <div className="animated-nav-container">
        {logo && <div className="animated-nav-logo">{logo}</div>}
        
        <ul className="animated-nav-links">
          {links.map((link, index) => (
            <li key={index} className="animated-nav-item">
              <a
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className={`animated-nav-link ${activeSection === link.href ? 'active' : ''}`}
              >
                {link.label}
                <span className="nav-link-underline" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default AnimatedNav;

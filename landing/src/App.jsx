import { useRef, useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import LoginSection from './components/LoginSection.jsx';
import Footer from './components/Footer.jsx';

// New animated components
import AnimatedGradient from './components/animations/AnimatedGradient.jsx';
import ParticleSystem from './components/animations/ParticleSystem.jsx';
import ScrollProgress from './components/animations/ScrollProgress.jsx';
import LoadingAnimation from './components/animations/LoadingAnimation.jsx';
import AnimatedNav from './components/glassmorphism/AnimatedNav.jsx';
import usePerformanceMonitor from './hooks/usePerformanceMonitor.js';
import useReducedMotion from './hooks/useReducedMotion.js';

// Import mobile optimizations
import './styles/mobile-optimizations.css';

export default function App() {
  const loginRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const { shouldReduceQuality } = usePerformanceMonitor();
  const prefersReducedMotion = useReducedMotion();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'Login', href: '#login' }
  ];

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingAnimation onComplete={() => setIsLoading(false)} />;
  }

  return (
    <>
      {/* Animated background gradient */}
      {!prefersReducedMotion && (
        <AnimatedGradient 
          colors={['#0a0a0a', '#1a1a3e', '#2d1b4e', '#0a0a0a']}
          duration={12}
          opacity={0.9}
        />
      )}

      {/* Particle system */}
      {!prefersReducedMotion && !shouldReduceQuality && (
        <ParticleSystem 
          particleCount={40}
          particleColor="#6366f1"
          speed={0.3}
          mouseInteraction={true}
        />
      )}

      {/* Scroll progress indicator */}
      <ScrollProgress 
        position="top"
        height={3}
        colors={['#6366f1', '#a855f7', '#ec4899']}
        showGlow={true}
      />

      {/* Animated navigation */}
      <AnimatedNav 
        links={navLinks}
        logo={<span className="gradient-text font-bold">SchoolSync</span>}
      />

      <Navbar loginRef={loginRef} />
      <main id="home">
        <HeroSection loginRef={loginRef} />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="login">
          <LoginSection sectionRef={loginRef} />
        </div>
      </main>
      <Footer />
    </>
  );
}

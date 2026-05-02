# SchoolSync Landing Page - Hyperframes Edition

A highly animated, 3D-enhanced landing page built with React, Three.js, GSAP, and Framer Motion.

## Features

### 🎨 Visual Effects
- **Three.js 3D Scene**: Floating geometric shapes with mouse parallax
- **Glassmorphism UI**: Modern frosted glass aesthetic
- **Particle Systems**: Interactive particles, formula particles, code rain, binary streams
- **Animated Gradients**: Smooth color transitions
- **Parallax Scrolling**: Multi-layer depth effects

### 🧬 Nerdy Academic Theme
- DNA Helix Animation
- Atom Orbit Animation
- Floating Book Elements
- Periodic Table Background
- Formula Particle System
- Typewriter Text Effects

### ⚡ Performance
- Automatic quality reduction based on FPS monitoring
- Reduced motion support for accessibility
- GPU-accelerated animations
- Lazy loading for heavy components
- Mobile-optimized particle counts

### ♿ Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements
- Color contrast compliance
- Reduced motion preferences respected

## Project Structure

```
landing/
├── src/
│   ├── components/
│   │   ├── 3d/                    # Three.js 3D components
│   │   │   ├── HeroScene3D.jsx
│   │   │   └── Interactive3DCard.jsx
│   │   ├── animations/            # Animation components
│   │   │   ├── AnimatedGradient.jsx
│   │   │   ├── AnimatedText.jsx
│   │   │   ├── ParticleSystem.jsx
│   │   │   ├── FormulaParticleSystem.jsx
│   │   │   ├── CodeRainEffect.jsx
│   │   │   ├── BinaryDataStream.jsx
│   │   │   ├── ParallaxLayer.jsx
│   │   │   ├── ScrollProgress.jsx
│   │   │   ├── ScrollTriggerWrapper.jsx
│   │   │   └── LoadingAnimation.jsx
│   │   ├── glassmorphism/         # Glassmorphism UI
│   │   │   ├── GlassCard.jsx
│   │   │   ├── GlassButton.jsx
│   │   │   ├── GlassInput.jsx
│   │   │   └── AnimatedNav.jsx
│   │   ├── nerdy/                 # Academic theme components
│   │   │   ├── DNAHelixAnimation.jsx
│   │   │   ├── AtomOrbitAnimation.jsx
│   │   │   ├── FloatingBookElement3D.jsx
│   │   │   ├── TypewriterTextEffect.jsx
│   │   │   └── PeriodicTableBackground.jsx
│   │   ├── HeroSection.jsx
│   │   ├── FeaturesSection.jsx
│   │   └── ...
│   ├── hooks/                     # Custom React hooks
│   │   ├── useMousePosition.js
│   │   ├── useScrollProgress.js
│   │   ├── useReducedMotion.js
│   │   └── usePerformanceMonitor.js
│   ├── utils/                     # Utility functions
│   │   ├── animationController.js
│   │   ├── performanceOptimizer.js
│   │   ├── easingFunctions.js
│   │   └── accessibility.js
│   └── styles/
│       └── glassmorphism.css
```

## Performance Optimization

### Automatic Quality Adjustment
The app monitors FPS and automatically reduces quality when performance drops:
- Reduces particle counts
- Disables 3D effects on mobile
- Lowers pixel ratio
- Simplifies animations

### Manual Optimization
```javascript
// In usePerformanceMonitor hook
const { shouldReduceQuality, currentFPS } = usePerformanceMonitor();

// Conditionally render heavy components
{!shouldReduceQuality && <HeavyComponent />}
```

## Accessibility Features

### Reduced Motion
All animations respect `prefers-reduced-motion`:
```javascript
const prefersReducedMotion = useReducedMotion();

{!prefersReducedMotion && <AnimatedComponent />}
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators visible
- Logical tab order maintained

### Screen Readers
- Semantic HTML structure
- ARIA labels on decorative elements
- Live regions for dynamic content

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

### Fallbacks
- Backdrop-filter fallback for older browsers
- Transform fallback for 3D effects
- Graceful degradation for WebGL

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Performance Targets

- Lighthouse Performance Score: ≥90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Frame Rate: 60fps (or 30fps on low-end devices)

## Dependencies

- **React 18**: UI framework
- **Three.js**: 3D graphics
- **GSAP**: Advanced animations
- **Framer Motion**: React animations
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library

## License

Proprietary - Cornerstone SchoolSync Platform

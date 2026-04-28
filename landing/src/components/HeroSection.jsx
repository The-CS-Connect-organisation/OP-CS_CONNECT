import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
};

// Particle component with mouse interaction
const Particle = ({ x, y, size, color, velocity, mouseX, mouseY, id }) => {
  const distance = useTransform(
    () => {
      const dx = mouseX.get() - x;
      const dy = mouseY.get() - y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    [mouseX, mouseY]
  );

  const scale = useTransform(distance, [0, 300], [3, 0.8]);
  const opacity = useTransform(distance, [0, 300], [1, 0.2]);
  const blur = useTransform(distance, [0, 200], [0, 2]);

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
        scale,
        opacity,
        filter: `blur(${blur}px)`,
        boxShadow: `0 0 ${size}px ${color}`,
      }}
      animate={{
        x: [0, velocity.x * 150, velocity.x * -100, 0],
        y: [0, velocity.y * 150, velocity.y * -100, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
};

// Floating shape component
const FloatingShape = ({ delay, duration, size, color, position }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        ...position,
        width: size,
        height: size,
        background: color,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        boxShadow: `0 0 40px ${color}`,
      }}
      animate={{
        rotate: [0, 360, 720],
        scale: [1, 1.4, 0.8, 1.2, 1],
        borderRadius: [
          '30% 70% 70% 30% / 30% 30% 70% 70%',
          '50% 50% 20% 80% / 25% 80% 20% 75%',
          '80% 20% 50% 50% / 60% 40% 60% 40%',
          '30% 70% 70% 30% / 30% 30% 70% 70%',
        ],
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
};

// Glitch text component
const GlitchText = ({ children, className = "" }) => {
  return (
    <motion.div
      className={`relative inline-block z-10 ${className}`}
      whileHover={{
        textShadow: [
          "2px 2px 0 #f59e0b, -2px -2px 0 #ffffff",
          "-2px 2px 0 #f59e0b, 2px -2px 0 #ffffff",
          "2px 2px 0 #f59e0b, -2px -2px 0 #ffffff",
        ],
        x: [0, -2, 2, 0],
        y: [0, 2, -2, 0],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    >
      <motion.span
        className="absolute inset-0 text-orange-500 opacity-50"
        animate={{
          x: [0, -1, 1, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        {children}
      </motion.span>
      <motion.span
        className="absolute inset-0 text-white opacity-50"
        animate={{
          x: [0, 1, -1, 0],
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 2.5,
        }}
      >
        {children}
      </motion.span>
      <span>{children}</span>
    </motion.div>
  );
};

// HeyGen-style hyperframe components
const HyperframeContainer = ({ children }) => {
  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

const Hyperframe3DReveal = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{
        rotateX: -90,
        opacity: 0,
        transformPerspective: 1000,
      }}
      animate={{
        rotateX: 0,
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

const HyperframeSliceReveal = ({ children, direction = "left", delay = 0 }) => {
  return (
    <motion.div
      initial={{
        clipPath: direction === "left" 
          ? "inset(0 100% 0 0)"
          : direction === "right"
          ? "inset(0 0 0 100%)"
          : "inset(100% 0 0 0)",
        opacity: 0,
      }}
      animate={{
        clipPath: "inset(0 0 0 0)",
        opacity: 1,
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

const HyperframeGlitch = ({ children, intensity = 1 }) => {
  return (
    <motion.div
      whileHover={{
        x: [-2 * intensity, 2 * intensity, -1 * intensity, 1 * intensity, 0],
        y: [1 * intensity, -1 * intensity, 2 * intensity, -2 * intensity, 0],
        filter: [
          "hue-rotate(0deg)",
          "hue-rotate(90deg)",
          "hue-rotate(180deg)",
          "hue-rotate(270deg)",
          "hue-rotate(360deg)",
        ],
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 2,
      }}
    >
      {children}
    </motion.div>
  );
};

const HyperframeParallaxLayer = ({ children, depth = 1, mouseX, mouseY }) => {
  const x = useTransform(mouseX, [-500, 500], [depth * -20, depth * 20]);
  const y = useTransform(mouseY, [-500, 500], [depth * -20, depth * 20]);
  
  return (
    <motion.div
      style={{
        x,
        y,
        z: depth * -100,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

const HyperframeMorphText = ({ text, className = "" }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";
  const [isHovering, setIsHovering] = useState(false);
  
  useEffect(() => {
    if (isHovering) {
      let iterations = 0;
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char, index) => {
              if (index < iterations) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );
        
        if (iterations >= text.length) {
          clearInterval(interval);
        }
        
        iterations += 1 / 3;
      }, 30);
    } else {
      setDisplayText(text);
    }
  }, [isHovering, text]);
  
  return (
    <motion.span
      className={className}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      {displayText}
    </motion.span>
  );
};

// Siri Intro Hyperframe - Orb + Avatar Reveal
const SiriIntroHyperframe = ({ children }) => {
  return (
    <motion.div
      className="relative w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient Orb - Scene 1 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "power2.out" }}
      >
        <motion.div
          className="w-64 h-64 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 80px rgba(245,158,11,0.6)",
          }}
        >
          <motion.div
            className="absolute inset-4 bg-white/20 rounded-full"
            animate={{
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>
      
      {/* Avatar/Content Reveal - Scene 2 */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: "power2.out" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// UI 3D Reveal Hyperframe - Rotating Panel
const UI3DRevealHyperframe = ({ children }) => {
  return (
    <motion.div
      className="relative w-full h-full"
      style={{
        perspective: "1200px",
      }}
    >
      <motion.div
        initial={{
          rotateY: -35,
          rotateX: 15,
        }}
        animate={{
          rotateY: 0,
          rotateX: 0,
        }}
        transition={{
          duration: 2,
          ease: "power2.out",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

// Combined Peak Studio Logo with HeyGen Hyperframes
const PeakStudioLogo = ({ mouseX, mouseY }) => {
  return (
    <SiriIntroHyperframe>
      <UI3DRevealHyperframe>
        <motion.div
          className="relative w-full max-w-4xl mx-auto"
          style={{
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateY: useTransform(mouseX, [-500, 500], [-3, 3]),
            rotateX: useTransform(mouseY, [-500, 500], [3, -3]),
          }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          {/* 3D Logo Container */}
          <motion.div
            className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-12 rounded-3xl shadow-2xl"
            style={{
              transform: "translateZ(50px)",
              boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.5)",
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 30px 60px -12px rgba(245, 158, 11, 0.7)",
            }}
          >
            {/* Animated Background Pattern */}
            <motion.div
              className="absolute inset-0 rounded-3xl opacity-20"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)",
              }}
              animate={{
                x: [0, 20, 0],
                y: [0, 20, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            {/* SchoolSync Title */}
            <motion.h1
              className="text-6xl md:text-8xl font-black text-white text-center mb-4 relative z-10"
              style={{
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              SchoolSync
            </motion.h1>
            
            {/* Tagline */}
            <motion.p
              className="text-xl md:text-2xl text-white/90 text-center relative z-10"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Empowering Education Through Innovation
            </motion.p>
            
            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-white/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/20 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </UI3DRevealHyperframe>
    </SiriIntroHyperframe>
  );
};
const KnowledgeFlow = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-orange-500 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: "50%",
          }}
          animate={{
            x: [0, 100],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Student achievement stars
const AchievementStars = () => {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400 pointer-events-none"
          style={{
            left: `${10 + (i % 4) * 25}%`,
            top: `${10 + Math.floor(i / 4) * 40}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        >
          ⭐
        </motion.div>
      ))}
    </>
  );
};

// Hyperframe border animation
const HyperframeBorder = () => {
  return (
    <motion.div
      className="absolute inset-4 pointer-events-none"
      style={{
        border: "3px solid transparent",
        background: "linear-gradient(45deg, #f59e0b, #ffffff, #f59e0b) border-box",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
      animate={{
        background: [
          "linear-gradient(0deg, #f59e0b, #ffffff, #f59e0b)",
          "linear-gradient(90deg, #f59e0b, #ffffff, #f59e0b)",
          "linear-gradient(180deg, #f59e0b, #ffffff, #f59e0b)",
          "linear-gradient(270deg, #f59e0b, #ffffff, #f59e0b)",
          "linear-gradient(360deg, #f59e0b, #ffffff, #f59e0b)",
        ],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// Matrix rain effect
const MatrixRain = () => {
  const [drops, setDrops] = useState([]);

  useEffect(() => {
    const characters = "01";
    const newDrops = [];
    for (let i = 0; i < 20; i++) {
      newDrops.push({
        x: Math.random() * 100,
        delay: Math.random() * 5,
        chars: Array.from({ length: 10 }, () => characters[Math.floor(Math.random() * characters.length)]),
      });
    }
    setDrops(newDrops);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          className="absolute text-green-500 text-xs font-mono opacity-20"
          style={{
            left: `${drop.x}%`,
            top: -50,
          }}
          animate={{
            y: [0, window.innerHeight + 100],
          }}
          transition={{
            duration: 5 + drop.delay,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        >
          {drop.chars.join("\n")}
        </motion.div>
      ))}
    </div>
  );
};

// Magnetic field distortion
const MagneticField = ({ mouseX, mouseY }) => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle 200px at ${mouseX}px ${mouseY}px, rgba(245,158,11,0.1) 0%, transparent 50%)`,
      }}
    />
  );
};
const MorphingBlob = ({ delay, duration, size, color, position }) => {
  return (
    <motion.div
      className="absolute pointer-events-none blur-2xl"
      style={{
        ...position,
        width: size,
        height: size,
        background: color,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        rotate: [0, 180, 360],
        scale: [1, 1.3, 1],
        x: [0, 50, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
};

// Animated grid lines component
const AnimatedGrid = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </svg>
    </div>
  );
};

// Text scramble effect component
const ScrambleText = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let frame = 0;
    const totalFrames = 30;
    
    const animate = () => {
      frame++;
      const progress = frame / totalFrames;
      const currentText = text.split('').map((char, i) => {
        if (i < progress * text.length) {
          return char;
        }
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      setDisplayText(currentText);
      
      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };
    
    animate();
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

// Magnetic button component with animated gradient border
const MagneticButton = ({ children, onClick, primary, secondary }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative px-10 py-5 rounded-full font-semibold text-lg overflow-hidden"
      style={
        primary
          ? {
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              color: 'white',
            }
          : {
              background: 'white',
              color: '#f59e0b',
              border: '2px solid #f59e0b',
            }
      }
      animate={{
        x: position.x * 0.3,
        y: position.y * 0.3,
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileHover={{
        scale: 1.05,
        boxShadow: primary ? '0 20px 40px rgba(245,158,11,0.3)' : '0 20px 40px rgba(245,158,11,0.15)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated gradient border for secondary button */}
      {secondary && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            padding: '2px',
            background: 'linear-gradient(90deg, #f59e0b, #f97316, #fbbf24, #f59e0b)',
            backgroundSize: '300% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="absolute inset-[2px] bg-white rounded-full" />
        </motion.div>
      )}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative flex items-center z-10">
        {children}
        {primary && (
          <motion.span
            className="ml-2 inline-block"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            →
          </motion.span>
        )}
      </span>
    </motion.button>
  );
};

export default function HeroSection({ loginRef }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [burstTrigger, setBurstTrigger] = useState(false);
  const [burstPosition, setBurstPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Mouse spring values for smooth tracking
  const mouseX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  
  // Parallax effects
  const logoY = useTransform(scrollY, [0, 500], [0, -50]);
  const logoOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const contentY = useTransform(scrollY, [0, 500], [0, -80]);
  const orbY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Generate particles
  useEffect(() => {
    if (reducedMotion) return;
    
    const newParticles = Array.from({ length: 80 }, () => ({ // Increased from 50 to 80
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2, // Increased size range
      color: ['#f59e0b', '#f97316', '#fbbf24', '#fcd34d', '#ffffff', '#f3f4f6'][Math.floor(Math.random() * 6)], // White and orange colors only
      velocity: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
      },
    }));
    setParticles(newParticles);
  }, [reducedMotion]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
      
      // Trigger explosive burst randomly on mouse movement
      if (Math.random() > 0.95) {
        setBurstPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setBurstTrigger(true);
        setTimeout(() => setBurstTrigger(false), 100);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const scrollToLogin = () => {
    loginRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={containerRef}
      aria-label="Hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white px-6"
    >
      {/* Particle background */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle, i) => (
            <Particle key={i} {...particle} mouseX={mouseX} mouseY={mouseY} id={i} />
          ))}
        </div>
      )}

      {/* Hyperframe border */}
      {!reducedMotion && <HyperframeBorder />}

      {/* Education-themed floating elements */}
      {!reducedMotion && <EducationElements />}

      {/* Knowledge transfer animation */}
      {!reducedMotion && <KnowledgeFlow />}

      {/* Student achievement stars */}
      {!reducedMotion && <AchievementStars />}

      {/* Animated grid lines */}
      {!reducedMotion && <AnimatedGrid />}

      {/* Morphing blobs */}
      {!reducedMotion && (
        <>
          <MorphingBlob
            delay={0}
            duration={15}
            size={300}
            color="radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.05) 70%)"
            position={{ top: '20%', left: '20%' }}
          />
          <MorphingBlob
            delay={3}
            duration={18}
            size={250}
            color="radial-gradient(circle, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.04) 70%)"
            position={{ bottom: '30%', right: '15%' }}
          />
          <MorphingBlob
            delay={5}
            duration={20}
            size={280}
            color="radial-gradient(circle, rgba(252,211,77,0.1) 0%, rgba(251,191,36,0.03) 70%)"
            position={{ top: '50%', left: '10%' }}
          />
        </>
      )}

      {/* Mouse-following spotlight */}
      {!reducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(245,158,11,0.08), transparent 40%)`,
          }}
        />
      )}

      {/* Animated gradient orb with parallax */}
      <motion.div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none blur-3xl"
        style={{
          y: orbY,
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.1) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Wave gradient animation */}
      {!reducedMotion && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.03) 100%)',
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: contentY }}
      >
        {/* Peak Studio Logo */}
        <motion.div
          variants={itemVariants}
          className="mb-12"
          style={{ y: logoY, opacity: logoOpacity }}
        >
          <PeakStudioLogo mouseX={mouseX} mouseY={mouseY} />
        </motion.div>

        {/* Headline with hyperframe effects */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <HyperframeSliceReveal direction="left" delay={0.8}>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6" style={{ color: '#1f2937' }}>
              <HyperframeGlitch intensity={2}>
                <GlitchText className="inline-block">
                  One Platform.
                </GlitchText>
              </HyperframeGlitch>
            </h1>
          </HyperframeSliceReveal>
          
          <HyperframeSliceReveal direction="right" delay={1.0}>
            <motion.div
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-700 mb-8"
              whileHover={{
                scale: 1.02,
                textShadow: "0 0 20px rgba(245,158,11,0.3)",
              }}
              transition={{
                duration: 0.3,
              }}
            >
              Complete School Management
            </motion.div>
          </HyperframeSliceReveal>
        </motion.div>

        {/* Subtext with scramble effect */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-normal"
          style={{ color: '#6b7280' }}
        >
          {reducedMotion ? (
            'The unified school management system for students, teachers, parents, and administrators.'
          ) : (
            <ScrambleText
              text="The unified school management system for students, teachers, parents, and administrators."
            />
          )}
        </motion.p>

        {/* CTA Buttons with magnetic effect */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
        >
          <HyperframeSliceReveal direction="bottom" delay={1.2}>
            <MagneticButton
              primary
              onClick={scrollToLogin}
              className="mb-0"
            >
              Get Started
            </MagneticButton>
          </HyperframeSliceReveal>
          
          <HyperframeSliceReveal direction="bottom" delay={1.4}>
            <MagneticButton
              secondary
              onClick={() => window.open('#features', '_self')}
              className="mb-0"
            >
              Learn More
            </MagneticButton>
          </HyperframeSliceReveal>
        </motion.div>
        
        {/* Scroll indicator with proper spacing */}
        <motion.div
          variants={itemVariants}
          className="mt-8"
        >
          <motion.button
            onClick={scrollToLogin}
            className="flex flex-col items-center text-gray-500 hover:text-orange-500 transition-colors"
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowDown size={24} />
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Animated gradient orb with parallax */}
      <motion.div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none blur-3xl"
        style={{
          y: orbY,
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.1) 40%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </section>
  );
}

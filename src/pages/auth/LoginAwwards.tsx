
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, type UserRole } from '@/lib/store'
import { cn } from '@/lib/utils'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/all'
import {
  GraduationCap, BookOpen, Users, Shield, Bus,
  Sparkles, ArrowRight, Eye, EyeOff, Mail, Lock,
  Star, Zap, Brain, Globe, Loader2, ChevronDown
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

// --- AWWARDS-STYLE ANIMATED TITLE ---
function AnimatedTitle({ title, containerClass }: { title: string; containerClass?: string }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const titleAnimation = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "100 bottom",
          end: "center bottom",
          toggleActions: "play none none reverse",
        },
      })
      titleAnimation.to(".animated-word", {
        opacity: 1,
        transform: "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
        ease: "power2.inOut",
        stagger: 0.02,
      }, 0)
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className={cn("animated-title", containerClass)}>
      {title.split("<br />").map((line, index) => (
        <div key={index} className="flex-center max-w-full flex-wrap gap-2 px-10 md:gap-3">
          {line.split(" ").map((word, idx) => (
            <span key={idx} className="animated-word" dangerouslySetInnerHTML={{ __html: word }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// --- BENTO TILT ---
function BentoTilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [transformStyle, setTransformStyle] = useState("")
  const itemRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current) return
    const { left, top, width, height } = itemRef.current.getBoundingClientRect()
    const relativeX = (e.clientX - left) / width
    const relativeY = (e.clientY - top) / height
    const tiltX = (relativeY - 0.5) * 5
    const tiltY = (relativeX - 0.5) * -5
    setTransformStyle(`perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(.95, .95, .95)`)
  }

  return (
    <div ref={itemRef} className={className} onMouseMove={handleMouseMove} onMouseLeave={() => setTransformStyle("")} style={{ transform: transformStyle }}>
      {children}
    </div>
  )
}

// --- ROLE DATA ---
const accounts = [
  { role: 'student' as UserRole, label: 'Aarav Sharma', email: 'aarav@eduvault.ai', icon: BookOpen, desc: '10-A Student', gradient: 'from-orange-500 to-amber-500' },
  { role: 'student' as UserRole, label: 'Priya Patel', email: 'priya@eduvault.ai', icon: BookOpen, desc: '10-A Student', gradient: 'from-orange-400 to-yellow-500' },
  { role: 'teacher' as UserRole, label: 'Dr. Rajesh Gupta', email: 'rajesh@eduvault.ai', icon: Users, desc: 'Math, Physics, CS', gradient: 'from-amber-600 to-orange-600' },
  { role: 'teacher' as UserRole, label: 'Prof. Sunita Verma', email: 'sunita@eduvault.ai', icon: Users, desc: 'Chem, Bio, English', gradient: 'from-yellow-600 to-amber-600' },
  { role: 'admin' as UserRole, label: 'Principal Meera', email: 'meera@eduvault.ai', icon: Shield, desc: 'School Admin', gradient: 'from-orange-700 to-red-600' },
  { role: 'coordinator' as UserRole, label: 'Mr. Vikram', email: 'vikram@eduvault.ai', icon: Globe, desc: 'Coordinator', gradient: 'from-amber-500 to-orange-500' },
  { role: 'driver' as UserRole, label: 'Raju Kumar', email: 'raju@eduvault.ai', icon: Bus, desc: 'Bus Driver', gradient: 'from-orange-600 to-yellow-600' },
  { role: 'manager' as UserRole, label: 'Mr. Arjun Manager', email: 'manager@eduvault.ai', icon: Shield, desc: 'Full Operations Control', gradient: 'from-orange-600 to-amber-600' },
]

export default function Login() {
  const { loginWithCredentials } = useAuthStore()
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccountSelect = (idx: number) => {
    setSelectedAccount(idx)
    setEmail(accounts[idx].email)
    setPassword('demo1234')
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedAccount === null) return
    setIsLoading(true)
    setError('')
    try {
      await loginWithCredentials(email, password)
    } catch (err: any) {
      setError(err.message || 'Login failed. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-black">
      {/* ===== HERO SECTION - Awwards copy ===== */}
      <div className="relative h-dvh w-screen overflow-x-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/30 via-black to-black" />

        {/* Animated orbs */}
        <motion.div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full filter blur-[150px]" animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/8 rounded-full filter blur-[128px]" animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Hero content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8 backdrop-blur-xl" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-orange-400">AI-Powered Learning Platform</span>
            </motion.div>

            <motion.h1 className="special-font hero-heading text-orange-400" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
              C<b>o</b>rnerstone
            </motion.h1>

            <motion.p className="mt-4 max-w-64 font-robert-regular text-orange-200/60 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              Redefining Education <br /> with AI at Every Step
            </motion.p>

            <motion.div className="mt-8 flex items-center justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <ChevronDown className="w-6 h-6 text-orange-500/50 animate-bounce" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ===== ABOUT SECTION - Awwards copy ===== */}
      <div id="about" className="min-h-screen w-screen">
        <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
          <p className="font-general text-xl uppercase md:text-[30px] text-orange-400">
            Welcome to Cornerstone
          </p>
          <AnimatedTitle title="Disc<b>o</b>ver the world's <br /> smartest sch<b>o</b>ol platform" containerClass="mt-5 !text-white text-center" />
          <div className="about-subtext">
            <p className="text-white/70">The future of education begins — your school, now powered by AI</p>
            <p className="text-white/30">Cornerstone unites students, teachers, and administrators into a unified intelligent platform</p>
          </div>
        </div>

        {/* Image reveal */}
        <div className="h-dvh w-screen" id="clip">
          <div className="mask-clip-path about-image">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-orange-800/20 flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-32 h-32 text-orange-500/30 mx-auto mb-6" />
                <p className="text-4xl font-bold text-white/20 special-font">Cornerstone AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FEATURES BENTO GRID - Awwards copy ===== */}
      <section className="bg-black pb-52">
        <div className="container mx-auto px-3 md:px-10">
          <div className="px-5 py-32">
            <p className="font-circular-web text-lg text-orange-400">Into the AI Layer</p>
            <p className="max-w-md font-circular-web text-lg text-white/50">Immerse yourself in a rich ecosystem where AI powers every aspect of school life</p>
          </div>

          <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
            <div className="relative size-full bg-gradient-to-br from-orange-900/40 to-amber-900/20 flex items-center justify-center p-8">
              <div className="text-center z-10">
                <Brain className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h1 className="bento-title special-font text-white">AI G<b>r</b>ading</h1>
                <p className="mt-3 max-w-64 text-white/50 text-sm">Automatic essay grading with detailed feedback, rubric analysis, and improvement suggestions</p>
              </div>
            </div>
          </BentoTilt>

          <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
            <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
              <div className="relative size-full bg-gradient-to-br from-amber-900/30 to-orange-900/20 flex flex-col justify-between p-5 text-white">
                <div>
                  <h1 className="bento-title special-font">Sm<b>a</b>rt Plans</h1>
                  <p className="mt-3 max-w-64 text-white/50 text-sm">AI-generated study plans personalized for each student based on their performance and learning style</p>
                </div>
                <Sparkles className="m-5 scale-[3] self-end text-orange-500/30" />
              </div>
            </BentoTilt>

            <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
              <div className="relative size-full bg-gradient-to-br from-orange-900/30 to-red-900/20 flex flex-col justify-between p-5 text-white">
                <div>
                  <h1 className="bento-title special-font">Re<b>a</b>l-time</h1>
                  <p className="mt-3 max-w-64 text-white/50 text-sm">Live attendance tracking, bus GPS, and instant notifications</p>
                </div>
                <Zap className="m-5 scale-[3] self-end text-amber-500/30" />
              </div>
            </BentoTilt>

            <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
              <div className="relative size-full bg-gradient-to-br from-yellow-900/30 to-orange-900/20 flex flex-col justify-between p-5 text-white">
                <div>
                  <h1 className="bento-title special-font">An<b>a</b>lytics</h1>
                  <p className="mt-3 max-w-64 text-white/50 text-sm">Deep performance insights with predictive analytics and trend analysis</p>
                </div>
                <Star className="m-5 scale-[3] self-end text-orange-500/30" />
              </div>
            </BentoTilt>

            <BentoTilt className="bento-tilt_2">
              <div className="flex size-full flex-col justify-between bg-orange-500/10 p-5">
                <h1 className="bento-title special-font max-w-64 text-white">M<b>o</b>re c<b>o</b>ming s<b>o</b>on.</h1>
                <ArrowRight className="m-5 scale-[5] self-end text-orange-500/30" />
              </div>
            </BentoTilt>

            <BentoTilt className="bento-tilt_2">
              <div className="relative size-full bg-gradient-to-br from-orange-800/30 to-amber-900/20 flex flex-col justify-between p-5 text-white">
                <div>
                  <h1 className="bento-title special-font">V<b>o</b>ice AI</h1>
                  <p className="mt-3 max-w-64 text-white/50 text-sm">Whisper-powered speech-to-text and Orpheus text-to-speech</p>
                </div>
              </div>
            </BentoTilt>
          </div>
        </div>
      </section>

      {/* ===== LOGIN SECTION ===== */}
      <section id="login" className="min-h-screen w-screen bg-black text-white">
        <div className="flex size-full flex-col items-center py-10 pb-24">
          <p className="font-general text-sm uppercase md:text-[10px] text-orange-400">
            choose your account
          </p>

          <AnimatedTitle title="Sign in t<b>o</b> <br /> C<b>o</b>rnerstone" containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10" />

          <div className="mt-16 w-full max-w-4xl px-6">
            {/* Account cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-cols-2 gap-3 mb-8">
              {accounts.map((acc, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.06 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAccountSelect(i)}
                  className={cn(
                    "relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-300 overflow-hidden group backdrop-blur-xl",
                    selectedAccount === i
                      ? "border-orange-500/50 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-orange-500/20 hover:bg-white/[0.04]"
                  )}
                >
                  <div className={cn("relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", acc.gradient)}>
                    <acc.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="relative z-10 text-center">
                    <p className="font-semibold text-xs text-white/90">{acc.label.split(' ')[0]}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">{acc.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Login form */}
            <AnimatePresence>
              {selectedAccount !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-md mx-auto"
                >
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-6 space-y-4 shadow-2xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", accounts[selectedAccount].gradient)}>
                          {React.createElement(accounts[selectedAccount].icon, { className: "w-5 h-5 text-white" })}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{accounts[selectedAccount].label}</p>
                          <p className="text-xs text-white/30">Click Sign In to continue</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" placeholder="Email" />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all" placeholder="Password" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {error && <p className="text-red-400 text-xs">{error}</p>}

                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                          `bg-gradient-to-r ${accounts[selectedAccount].gradient}`,
                          isLoading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>Sign In <ArrowRight className="w-4 h-4" /></>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ===== NAVBAR - Floating, Awwards style ===== */}
      <div className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6 floating-nav">
        <header className="absolute top-1/2 w-full -translate-y-1/2">
          <nav className="flex size-full items-center justify-between p-4">
            <div className="flex items-center gap-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="hidden md:block text-white font-bold text-lg">Cornerstone AI</span>
            </div>
            <div className="flex h-full items-center gap-4">
              <a href="#about" className="nav-hover-btn">About</a>
              <a href="#login" className="nav-hover-btn">Login</a>
              <motion.a
                href="#login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1"
              >
                Get Started <ArrowRight className="w-3 h-3" />
              </motion.a>
            </div>
          </nav>
        </header>
      </div>
    </main>
  )
}


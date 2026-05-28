import { Suspense, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Cpu, Fingerprint, Pencil, Settings2, Sparkles } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { GridVignetteBackground } from '@/components/ui/vignette-grid-background';
import { DelicateAsciiDots } from '@/components/ui/delicate-ascii-dots';
import InfiniteGallery from '@/components/ui/3d-gallery-photography';
import { CinematicHero } from '@/components/ui/cinematic-landing-hero';
import { Marquee } from '@/components/ui/3d-testimonails';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { FeatureCard } from '@/components/ui/grid-feature-cards';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import Footer4Col from '@/components/ui/footer-column';
const farewellImages = [
  '/farewell/IMG_3890.JPG', '/farewell/IMG_3900.JPG', '/farewell/IMG_3901.JPG',
  '/farewell/IMG_3902.JPG', '/farewell/IMG_3903.JPG', '/farewell/IMG_3904.JPG',
  '/farewell/IMG_3905.JPG', '/farewell/IMG_3906.JPG', '/farewell/IMG_3907.JPG',
  '/farewell/IMG_3908.JPG', '/farewell/IMG_3909.JPG', '/farewell/IMG_3910.JPG',
  '/farewell/IMG_3911.JPG', '/farewell/IMG_3912.JPG', '/farewell/IMG_3913.JPG',
  '/farewell/IMG_3914.JPG', '/farewell/IMG_3915.JPG', '/farewell/IMG_3916.JPG',
  '/farewell/IMG_3917.JPG', '/farewell/IMG_3918.JPG', '/farewell/IMG_3919.JPG',
  '/farewell/IMG_3920.JPG', '/farewell/IMG_3921.JPG', '/farewell/IMG_3922.JPG',
  '/farewell/IMG_3923.JPG', '/farewell/IMG_3924.JPG', '/farewell/IMG_3925.JPG',
  '/farewell/IMG_3926.JPG', '/farewell/IMG_3927.JPG', '/farewell/IMG_3928.JPG',
  '/farewell/IMG_3929.JPG', '/farewell/IMG_3930.JPG', '/farewell/IMG_3932.JPG',
  '/farewell/IMG_3933.JPG', '/farewell/IMG_3934.JPG', '/farewell/IMG_3935.JPG',
  '/farewell/IMG_3936.JPG', '/farewell/IMG_3937.JPG', '/farewell/IMG_3938.JPG',
  '/farewell/IMG_3939.JPG', '/farewell/IMG_3940.JPG', '/farewell/IMG_3941.JPG',
  '/farewell/IMG_3942.JPG', '/farewell/IMG_3943.JPG', '/farewell/IMG_3944.JPG',
  '/farewell/IMG_3945.JPG', '/farewell/IMG_3947.JPG', '/farewell/IMG_3948.JPG',
  '/farewell/IMG_3949.JPG', '/farewell/IMG_3950.JPG', '/farewell/IMG_3951.JPG',
  '/farewell/IMG_3952.JPG', '/farewell/IMG_3953.JPG', '/farewell/IMG_3954.JPG',
  '/farewell/IMG_3957.JPG', '/farewell/IMG_3958.JPG', '/farewell/IMG_3959.JPG',
  '/farewell/IMG_3960.JPG', '/farewell/IMG_3961.JPG', '/farewell/IMG_3962.JPG',
  '/farewell/IMG_3963.JPG', '/farewell/IMG_3964.JPG', '/farewell/IMG_3965.JPG',
  '/farewell/IMG_3966.JPG', '/farewell/IMG_3967.JPG', '/farewell/IMG_3968.JPG',
  '/farewell/IMG_3969.JPG', '/farewell/IMG_3970.JPG', '/farewell/IMG_3971.JPG',
  '/farewell/IMG_3972.JPG', '/farewell/IMG_3973.JPG', '/farewell/IMG_3974.JPG',
  '/farewell/IMG_3975.JPG', '/farewell/IMG_3976.JPG', '/farewell/IMG_3977.JPG',
  '/farewell/IMG_3978.JPG', '/farewell/IMG_3979.JPG', '/farewell/IMG_3980.JPG',
  '/farewell/IMG_3981.JPG', '/farewell/IMG_3982.JPG', '/farewell/IMG_3983.JPG',
  '/farewell/IMG_3984.JPG', '/farewell/IMG_3985.JPG', '/farewell/IMG_3986.JPG',
  '/farewell/IMG_3987.JPG', '/farewell/IMG_3988.JPG', '/farewell/IMG_3989.JPG',
  '/farewell/IMG_3990.JPG', '/farewell/IMG_3991.JPG', '/farewell/IMG_3992.JPG',
  '/farewell/IMG_3993.JPG', '/farewell/IMG_3994.JPG', '/farewell/IMG_3995.JPG',
  '/farewell/IMG_3996.JPG', '/farewell/IMG_3997.JPG', '/farewell/IMG_3998.JPG',
  '/farewell/IMG_3999.JPG', '/farewell/IMG_4000.JPG', '/farewell/IMG_4001.JPG',
  '/farewell/IMG_4002.JPG', '/farewell/IMG_4003.JPG', '/farewell/IMG_4004.JPG',
  '/farewell/IMG_4005.JPG', '/farewell/IMG_4006.JPG', '/farewell/IMG_4007.JPG',
  '/farewell/IMG_4008.JPG', '/farewell/IMG_4009.JPG', '/farewell/IMG_4010.JPG',
  '/farewell/IMG_4011.JPG', '/farewell/IMG_4012.JPG', '/farewell/IMG_4013.JPG',
  '/farewell/IMG_4014.JPG', '/farewell/IMG_4015.JPG', '/farewell/IMG_4016.JPG',
  '/farewell/IMG_4017.JPG', '/farewell/IMG_4018.JPG', '/farewell/IMG_4019.JPG',
  '/farewell/IMG_4020.JPG', '/farewell/IMG_4021.JPG', '/farewell/IMG_4022.JPG',
  '/farewell/IMG_4023.JPG', '/farewell/IMG_4024.JPG', '/farewell/IMG_4025.JPG',
  '/farewell/IMG_4026.JPG', '/farewell/IMG_4027.JPG', '/farewell/IMG_4028.JPG',
  '/farewell/DSC05820.jpg.jpeg', '/farewell/DSC06091.jpg.jpeg', '/farewell/DSC06271.jpg.jpeg',
  '/farewell/DSC06844.jpg.jpeg', '/farewell/DSC07473.jpg.jpeg', '/farewell/DSC07473-300x200.jpg.jpeg',
  '/farewell/G-10-at-ICRISAT.png', '/farewell/G-10-at-ICRISAT-1024x683.png',
  '/farewell/RPB02324-1024x683.jpg.jpeg', '/farewell/RPB02687.jpg.jpeg', '/farewell/RPB03257.jpg.jpeg',
  '/farewell/slider-1.jpg.jpeg', '/farewell/visual-arts.jpg.jpeg', '/farewell/visual-arts-1536x953.jpg.jpeg',
  '/farewell/Screenshot-13-1.png',
  '/farewell/WhatsApp-Image-2023-08-07-at-00.47.33-1.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.32.40-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.33.00-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.33.00-PM-1536x1023.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-4.39.33-PM-1.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.15.52-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.15.52-PM-1-473x1024.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-5.31.16-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.08.47-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.22.54-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-08-at-7.22.54-PM-1536x1023.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-1.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-2.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.34.26-PM-3.jpeg',
  '/farewell/WhatsApp-Image-2023-12-11-at-9.42.20-PM.jpeg',
  '/farewell/a547a7_0800b1353b834b3fb9e6c3f47c553b6bmv2_d_3000_2000_s_2.jpg.jpeg',
  '/farewell/a547a7_76479b509f3d4e6f87b294bd44ee36famv2_d_2297_1557_s_2.jpg.jpeg',
].map(src => ({ src: `${import.meta.env.BASE_URL}${src.slice(1)}`, alt: 'Farewell memories' }));

const testimonials = [
  { name: 'Aarav S.', username: '@aarav', body: 'Cornerstone AI made studying so much easier!', img: 'https://randomuser.me/api/portraits/men/32.jpg', country: '🇮🇳 India' },
  { name: 'Priya P.', username: '@priya', body: 'The attendance tracking is a game changer!', img: 'https://randomuser.me/api/portraits/women/68.jpg', country: '🇮🇳 India' },
  { name: 'Rohan K.', username: '@rohan', body: 'AI study plans are incredibly helpful!', img: 'https://randomuser.me/api/portraits/men/51.jpg', country: '🇮🇳 India' },
  { name: 'Ananya S.', username: '@ananya', body: 'Best school platform ever!', img: 'https://randomuser.me/api/portraits/women/53.jpg', country: '🇮🇳 India' },
  { name: 'Dr. Gupta', username: '@gupta', body: 'Grading tools save me hours every week.', img: 'https://randomuser.me/api/portraits/men/33.jpg', country: '🇮🇳 India' },
  { name: 'Prof. Verma', username: '@verma', body: 'Analytics dashboard is very insightful.', img: 'https://randomuser.me/api/portraits/men/22.jpg', country: '🇮🇳 India' },
  { name: 'Haruto S.', username: '@haru', body: 'Impressive performance on mobile!', img: 'https://randomuser.me/api/portraits/men/85.jpg', country: '🇯🇵 Japan' },
  { name: 'Emma L.', username: '@emma', body: 'Love the AI assistant feature!', img: 'https://randomuser.me/api/portraits/women/45.jpg', country: '🇨🇦 Canada' },
  { name: 'Carlos R.', username: '@carl', body: 'Great for school administration.', img: 'https://randomuser.me/api/portraits/men/61.jpg', country: '🇪🇸 Spain' },
];

const features = [
  { title: 'Lightning Fast', icon: Zap, description: 'AI-powered responses in milliseconds for instant learning support.' },
  { title: 'Smart Analytics', icon: Cpu, description: 'Real-time dashboards for grades, attendance, and performance.' },
  { title: 'Secure Platform', icon: Fingerprint, description: 'Enterprise-grade security protecting student data.' },
  { title: 'Custom Workflows', icon: Pencil, description: 'Tailor the platform to your school unique needs.' },
  { title: 'Full Control', icon: Settings2, description: 'Admin panels with role-based access for every stakeholder.' },
  { title: 'Built for AI', icon: Sparkles, description: 'Integrated AI grading, study plans, and chat assistance.' },
];

function TestimonialCard({ img, name, username, body, country }: (typeof testimonials)[number]) {
  return (
    <Card className="w-50">
      <CardContent>
        <div className="flex items-center gap-2.5">
          <Avatar src={img} alt={name} size="sm" />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium text-foreground flex items-center gap-1">
              {name} <span className="text-xs">{country}</span>
            </figcaption>
            <p className="text-xs font-medium text-muted-foreground">{username}</p>
          </div>
        </div>
        <blockquote className="mt-3 text-sm text-muted-foreground">{body}</blockquote>
      </CardContent>
    </Card>
  );
}

function AnimatedContainer({ delay = 0.1, className, children }: { delay?: number; className?: string; children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GalleryLoader() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading memories...</p>
      </div>
    </div>
  );
}

function MobileAppPreview() {
  return (
    <div className="w-[260px] sm:w-[280px] h-[520px] sm:h-[560px] rounded-[2.5rem] bg-gray-900 p-[6px] shadow-2xl shadow-black/30">
      <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-50" />
        <div className="h-12 bg-gradient-to-r from-orange-500 to-amber-500 flex items-end justify-center pb-1">
          <span className="text-white text-[10px] font-medium">9:41</span>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-[10px]">Good morning,</p>
              <p className="text-white text-sm font-bold">Aarav 👋</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AS</span>
            </div>
          </div>
        </div>
        <div className="px-3 py-2 grid grid-cols-2 gap-2">
          {[
            { label: 'GPA', value: '9.2', color: 'from-orange-400 to-amber-500' },
            { label: 'Attendance', value: '94%', color: 'from-emerald-400 to-teal-500' },
            { label: 'Assignments', value: '3 due', color: 'from-orange-400 to-amber-500' },
            { label: 'Fees', value: '₹12K', color: 'from-red-400 to-pink-500' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-2.5 text-white`}>
              <p className="text-[9px] opacity-80">{stat.label}</p>
              <p className="text-lg font-bold leading-tight">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="mx-3 mt-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white text-[10px] font-semibold">AI Study Plan</span>
          </div>
          <p className="text-white/80 text-[9px]">Your Physics prep is on track! Focus on Optics today.</p>
        </div>
        <div className="px-3 mt-3">
          <p className="text-[10px] font-semibold text-gray-700 mb-1.5">Today's Schedule</p>
          {[
            { time: '9:00', subject: 'Mathematics', room: 'Room 201' },
            { time: '10:45', subject: 'Physics', room: 'Lab 3' },
            { time: '12:30', subject: 'English', room: 'Room 105' },
          ].map((cls) => (
            <div key={cls.time} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <span className="text-[9px] text-orange-500 font-mono font-bold w-8">{cls.time}</span>
              <div className="w-1 h-6 rounded-full bg-orange-400" />
              <div>
                <p className="text-[10px] font-medium text-gray-800">{cls.subject}</p>
                <p className="text-[8px] text-gray-400">{cls.room}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-100 flex items-center justify-around px-2">
          {['🏠', '📚', '🤖', '📊', '👤'].map((icon, i) => (
            <span key={i} className={`text-sm ${i === 0 ? 'opacity-100' : 'opacity-40'}`}>{icon}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [showBelow, setShowBelow] = useState(false);
  const belowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) html.classList.remove('dark');
    return () => {
      if (wasDark) html.classList.add('dark');
    };
  }, []);

  const scrollToBelow = useCallback(() => {
    setShowBelow(true);
    setTimeout(() => {
      belowRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setShowBelow(false), 500);
  }, []);

  return (
    <main className="min-h-screen h-full w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 text-gray-900">
      <Navbar />

      {/* Hero Section - Orange Grid + ASCII Dots Background */}
      <section className="h-screen w-full relative bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        {/* Grid Background - Orange lines with white strips */}
        <GridVignetteBackground
          size={48}
          intensity={20}
          horizontalVignetteSize={120}
          verticalVignetteSize={120}
          className="opacity-60 bg-[image:linear-gradient(to_right,rgba(249,115,22,0.2),transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.2),transparent_1px)]"
        />

        {/* ASCII Dots - Orange gradient tones */}
        <div className="absolute inset-0 z-[1]">
          <DelicateAsciiDots
            backgroundColor="transparent"
            textColor="249, 115, 22"
            gridSize={60}
            animationSpeed={0.5}
            removeWaveLine={true}
          />
        </div>

        {/* 3D Gallery - Farewell memories floating through */}
        <div className="absolute inset-0 z-[2]">
          <Suspense fallback={<GalleryLoader />}>
            <InfiniteGallery
              images={farewellImages}
              speed={0.8}
              visibleCount={5}
              className="h-full w-full"
              fadeSettings={{
                fadeIn: { start: 0.05, end: 0.2 },
                fadeOut: { start: 0.6, end: 0.7 },
              }}
              blurSettings={{
                blurIn: { start: 0.0, end: 0.1 },
                blurOut: { start: 0.6, end: 0.7 },
                maxBlur: 5.0,
              }}
            />
          </Suspense>
        </div>

        {/* Orange gradient overlays for depth - on top of gallery */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-orange-50/70 via-transparent to-amber-50/40 pointer-events-none" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-br from-orange-200/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-b from-orange-50/40 via-transparent to-transparent pointer-events-none" />
        {/* Side edge fades to blend text into gallery */}
        <div className="absolute inset-0 z-[3] bg-gradient-to-r from-orange-50/60 via-transparent to-orange-50/60 pointer-events-none" />

        {/* Left vertical text - "Cornerstone" */}
        <div className="absolute left-0 top-0 bottom-0 w-14 md:w-20 flex items-center justify-center z-[5] pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            <h1 className="font-serif text-3xl md:text-5xl tracking-[0.3em] text-orange-900/25 select-none">
              Cornerstone
            </h1>
          </motion.div>
        </div>

        {/* Right vertical text - "AI-Powered School Management" */}
        <div className="absolute right-0 top-0 bottom-0 w-14 md:w-20 flex items-center justify-center z-[5] pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
          >
            <p className="font-mono text-[10px] md:text-xs tracking-[0.4em] text-orange-800/20 uppercase select-none">
              AI-Powered Learning Platform
            </p>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[5] pointer-events-none">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="font-mono text-[10px] md:text-xs tracking-widest text-orange-700/40 uppercase text-center"
          >
            Scroll to navigate &middot; Arrow keys work too
          </motion.p>
        </div>

        {/* Explore Button - Liquid Glass Style */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <LiquidButton onClick={scrollToBelow} size="lg" className="text-orange-900">
              <span className="flex items-center gap-2">
                Explore
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </span>
            </LiquidButton>
          </motion.div>
        </div>
      </section>

      {/* Below the Fold */}
      <AnimatePresence>
        {showBelow && (
          <motion.div
            ref={belowRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-white to-orange-50/30"
          >
            {/* Cinematic Hero Section */}
            <section className="w-full relative">
              <GridVignetteBackground
                size={64}
                intensity={30}
                horizontalVignetteSize={140}
                verticalVignetteSize={140}
                className="opacity-30 bg-[image:linear-gradient(to_right,rgba(249,115,22,0.12),transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.12),transparent_1px)]"
              />
              <CinematicHero />
            </section>

            {/* App Preview + CTA Section */}
            <section className="py-16 md:py-32 w-full relative">
              <div className="mx-auto max-w-6xl px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div className="flex-1 text-center lg:text-left">
                  <AnimatedContainer>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                      Your school,{' '}
                      <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                        reimagined.
                      </span>
                    </h2>
                    <p className="text-gray-500 mt-4 text-sm md:text-base max-w-md mx-auto lg:mx-0">
                      From AI-powered study plans to real-time attendance tracking, Cornerstone brings every part of school life into one beautiful experience.
                    </p>
                  </AnimatedContainer>
                  <AnimatedContainer delay={0.2} className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <LiquidButton onClick={() => navigate('/login')} size="xl" className="text-white">
                      Get Started
                    </LiquidButton>
                    <LiquidButton onClick={() => navigate('/login')} variant="outline" size="xl" className="text-gray-700">
                      Sign In
                    </LiquidButton>
                  </AnimatedContainer>
                </div>
                <AnimatedContainer delay={0.3} className="flex-shrink-0">
                  <MobileAppPreview />
                </AnimatedContainer>
              </div>
            </section>

            {/* 3D Testimonials Section */}
            <section className="py-16 md:py-32 w-full bg-orange-50/50">
              <div className="mx-auto max-w-5xl px-4 mb-12 text-center">
                <AnimatedContainer>
                  <h2 className="text-3xl font-bold tracking-wide md:text-4xl lg:text-5xl">
                    Loved by Educators
                  </h2>
                  <p className="text-gray-500 mt-4 text-sm md:text-base">
                    See what our community has to say about Cornerstone
                  </p>
                </AnimatedContainer>
              </div>
              <AnimatedContainer delay={0.3} className="border border-gray-200 rounded-lg relative flex h-96 w-full mx-auto flex-row items-center justify-center overflow-hidden gap-1.5">
                <div
                  className="flex flex-row items-center gap-4 will-change-transform"
                  style={{
                    transform: 'translateX(-50px) rotateX(10deg) rotateY(-5deg) rotateZ(10deg)',
                  }}
                >
                  <Marquee vertical pauseOnHover repeat={2} className="[--duration:30s]">
                    {testimonials.map((review) => (
                      <TestimonialCard key={review.username} {...review} />
                    ))}
                  </Marquee>
                  <Marquee vertical pauseOnHover reverse repeat={2} className="[--duration:30s]">
                    {testimonials.map((review) => (
                      <TestimonialCard key={review.username} {...review} />
                    ))}
                  </Marquee>
                </div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-orange-50"></div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-orange-50"></div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-orange-50"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-orange-50"></div>
              </AnimatedContainer>
            </section>

            {/* Feature Cards Section */}
            <section className="py-16 md:py-32">
              <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
                <AnimatedContainer className="mx-auto max-w-3xl text-center">
                  <h2 className="text-3xl font-bold tracking-wide md:text-4xl lg:text-5xl xl:font-extrabold">
                    Power. Speed. Control.
                  </h2>
                  <p className="text-gray-500 mt-4 text-sm tracking-wide md:text-base">
                    Everything you need to run a modern school.
                  </p>
                </AnimatedContainer>
                <AnimatedContainer
                  delay={0.4}
                  className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3"
                >
                  {features.map((feature, i) => (
                    <FeatureCard key={i} feature={feature} />
                  ))}
                </AnimatedContainer>
              </div>
            </section>

            {/* Back to Top */}
            <div className="flex justify-center py-8">
              <button
                onClick={scrollToTop}
                className="flex items-center gap-2 text-orange-400 hover:text-orange-700 transition-colors text-sm"
              >
                <ChevronUp className="w-4 h-4" />
                Back to Memories
              </button>
            </div>

            {/* Footer */}
            <Footer4Col />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

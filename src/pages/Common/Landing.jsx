'use client';
import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, BookOpen, Users, Bus, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MynaHero } from '@/components/ui/MynaHero';
import { SmoothScrollHero } from '@/components/ui/SmoothScrollHero';
import { PoemAnimation } from '@/components/ui/PoemAnimation';
import { Marquee } from '@/components/ui/Marquee';
import { WaitlistHero } from '@/components/ui/WaitlistHero';

const PARTNER_LOGOS = [
  { name: 'Google Workspace', emoji: '🌐' },
  { name: 'Microsoft Teams', emoji: '💻' },
  { name: 'Zoom', emoji: '📹' },
  { name: 'Canva', emoji: '🎨' },
  { name: 'Notion', emoji: '📝' },
  { name: 'Figma', emoji: '✏️' },
  { name: 'GitHub', emoji: '💻' },
  { name: 'Slack', emoji: '💬' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Principal, Delhi Public School', text: 'Cornerstone transformed how we manage our 2000+ student institution.', avatar: '👩‍🏫' },
  { name: 'Rajesh Kumar', role: 'Parent', text: 'Real-time updates on my child\'s attendance and grades — amazing!', avatar: '👨‍💼' },
  { name: 'Ananya Reddy', role: 'Class 10 Student', text: 'The AI study planner helped me score 98% in my boards.', avatar: '📚' },
  { name: 'Dr. Amit Patel', role: 'Admin, Sunshine International', text: 'Fee collection efficiency improved by 340% in the first month.', avatar: '🎓' },
];

const ROLES_PREVIEW = [
  { icon: GraduationCap, label: 'Student', color: '#ff6b9d', desc: 'Track grades, attendance & assignments' },
  { icon: BookOpen, label: 'Teacher', color: '#a855f7', desc: 'Manage classes, grading & communications' },
  { icon: UserCog, label: 'Admin', color: '#10b981', desc: 'Full control over school operations' },
  { icon: Users, label: 'Parent', color: '#3b82f6', desc: 'Monitor child progress in real-time' },
  { icon: Bus, label: 'Driver', color: '#f59e0b', desc: 'Track routes & student pickups' },
];

export const Landing = memo(function Landing({ user, onLogin }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      setTheme(isDark ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-zinc-900 dark:text-white">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <img src="/cornerstone-logo.svg" alt="Cornerstone" className="w-8 h-8 rounded-xl object-contain" />
          <span className="font-bold text-sm tracking-tight">Cornerstone SchoolSync</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate(`/${user.role}/dashboard`)}
              className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Sign In
              </button>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold">
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="pt-16">
        <MynaHero />
      </div>

      {/* ── Partner Marquee ── */}
      <div className="py-12 border-y border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50">
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-center text-slate-400 dark:text-zinc-600">
            Trusted by 500+ schools worldwide
          </p>
        </div>
        <Marquee pauseOnHover className="py-4">
          {PARTNER_LOGOS.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2 px-6">
              <span className="text-2xl">{logo.emoji}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">{logo.name}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* ── Scroll Hero ── */}
      <SmoothScrollHero
        scrollHeight={200}
        initialClipPercentage={5}
        finalClipPercentage={95}
        desktopImage="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2071"
        mobileImage="https://images.unsplash.com/photo-1511207538754-e8555f2bc187?q=80&w=2412"
      >
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              Where Learning Meets Innovation
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/70 max-w-xl mx-auto"
            >
              The complete school management platform built for the modern education era.
            </motion.p>
          </div>
        </div>
      </SmoothScrollHero>

      {/* ── Role Cards ── */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-zinc-900 dark:text-white">
              One Platform, Every Role
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Tailored experiences for every member of your school community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ROLES_PREVIEW.map((role, i) => (
              <motion.div
                key={role.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}
                >
                  <role.icon size={18} style={{ color: role.color }} />
                </div>
                <h3 className="text-sm font-semibold mb-1 text-zinc-900 dark:text-white">{role.label}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Poem Animation ── */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-900">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
            Our Vision
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Built with love for education</p>
        </div>
        <PoemAnimation theme={theme} />
      </section>

      {/* ── Testimonials Marquee ── */}
      <section className="py-12 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-900 dark:text-white">
            Loved by Schools
          </h2>
        </div>
        <Marquee pauseOnHover>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="mx-4 w-72 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{t.avatar}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{t.role}</p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic">"{t.text}"</p>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ── Waitlist CTA ── */}
      <WaitlistHero theme={theme} />

      {/* ── Footer ── */}
      <footer className="py-12 px-4 md:px-8 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/cornerstone-logo.svg" alt="Cornerstone" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-sm">Cornerstone SchoolSync</span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-zinc-600">
            © 2026 Cornerstone SchoolSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
});

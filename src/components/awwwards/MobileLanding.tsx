import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, LayoutDashboard, CircleUserRound, School, Cpu, Users, BadgeCheck, ChevronRight } from 'lucide-react';
import { TiLocationArrow } from "react-icons/ti";
import { useAuthStore } from "@/lib/store";

const navItems = ["About", "Features", "Story"];

interface Props {
  showPrompt?: boolean;
}

export default function MobileLanding({ showPrompt }: Props) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 1.0;

    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setAudioStarted(true);
      audio.play().catch(() => {});
      document.removeEventListener("click", start);
      document.removeEventListener("touchstart", start);
      document.removeEventListener("scroll", start, { capture: true });
    };

    document.addEventListener("click", start);
    document.addEventListener("touchstart", start);
    document.addEventListener("scroll", start, { capture: true });
  }, []);

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "student": return "/student";
      case "teacher": return "/teacher";
      case "admin": return "/admin";
      case "parent": return "/parent";
      case "driver": return "/driver";
      case "librarian": return "/librarian";
      case "coordinator": return "/coordinator";
      case "manager": return "/manager";
      default: return "/login";
    }
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    { icon: Cpu, label: "AI-Powered Analytics", desc: "Predictive intelligence that forecasts student performance, identifies at-risk learners, and surfaces actionable insights before problems arise — powered by cutting-edge machine learning models trained on your school's unique data." },
    { icon: Users, label: "Unified School Ecosystem", desc: "One seamless platform connecting students, teachers, parents, admin, management, drivers, and librarians — with role-based dashboards, real-time messaging, and cross-department collaboration baked into every workflow." },
    { icon: BadgeCheck, label: "Real-Time Intelligence", desc: "Live attendance tracking, instant grade updates, automated fee reminders, and push notifications across every channel — SMS, email, and in-app — so no stakeholder ever misses a beat." },
    { icon: School, label: "Smart Scheduling & Timetables", desc: "AI-driven timetable generation that optimizes teacher allocation, room utilization, and period distribution — resolving conflicts in seconds instead of hours." },
    { icon: LayoutDashboard, label: "Executive Command Center", desc: "A centralized admin dashboard with live charts, attendance heatmaps, financial summaries, and custom reports — giving school leadership a panoramic view of operations at a glance." },
    { icon: CircleUserRound, label: "Multi-Role Access Control", desc: "Granular permission system that ensures students see grades, teachers manage classes, admins control finance, and parents track progress — all within a single secure platform." },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900 font-circular-web page-enter">
      <audio ref={audioRef} src={`${import.meta.env.BASE_URL}audio/loop2.0.m4a`} loop preload="auto" />

      {/* Navbar */}
      <nav className={`fixed inset-x-0 z-50 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 ${showPrompt ? "top-[68px]" : "top-0"}`}>
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`} alt="CS Connect" className="w-6 h-6 object-contain" />
          <span className="font-zentry text-sm font-black uppercase tracking-wider text-gray-900">CS Connect</span>
        </button>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(getDashboardRoute())} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-general uppercase tracking-wide">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <CircleUserRound className="w-5 h-5 text-gray-400" />
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-general uppercase tracking-wide">
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col gap-1 p-1.5">
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-14">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="font-general text-2xl uppercase tracking-wide text-gray-800 hover:text-orange-500 transition-colors"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => { setMenuOpen(false); navigate("/about"); }}
              className="font-general text-2xl uppercase tracking-wide text-orange-500"
            >
              About CS Connect
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-dvh w-full overflow-hidden">
        <video
          src="videos/hero-1.mp4"
          autoPlay
          loop
          muted
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h1 className="font-zentry text-5xl font-black uppercase tracking-wider text-white leading-tight">
            CS C<b className="text-white">O</b>NNECT
          </h1>
          <p className="mt-2 text-white/80 text-sm max-w-xs leading-relaxed">
            AI-Powered School Management for the Next Generation
          </p>
          <a
            href="https://www.youtube.com/watch?v=WxKBhquOGzw"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-fit flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 text-white text-xs font-general uppercase tracking-wide"
          >
            <TiLocationArrow />
            Watch trailer
          </a>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-16 bg-white">
        <p className="font-general text-xs uppercase tracking-widest text-orange-500 mb-2">Welcome to</p>
        <h2 className="font-zentry text-3xl font-black uppercase tracking-wider text-gray-900 mb-4">
          CS Connect
        </h2>
        <div className="flex items-center gap-2 mb-6">
          <School className="w-5 h-5 text-orange-500" />
          <span className="font-general text-xs uppercase tracking-wide text-gray-500">By Cornerstone School</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">
          CS Connect unites every aspect of school life into one intelligent
          platform — from attendance and grades to communication and analytics.
        </p>
        <img
          src={`${import.meta.env.BASE_URL}img/about.webp`}
          alt="CS Connect"
          className="w-full rounded-xl object-cover h-48"
        />
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 bg-gray-50">
        <p className="font-general text-xs uppercase tracking-widest text-orange-500 mb-2">The Platform</p>
        <h2 className="font-zentry text-2xl font-black uppercase tracking-wider text-gray-900 mb-3">
          Intelligent School Platform
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Powerful school management tools converging into an interconnected intelligence layer.
        </p>
        <div className="flex flex-col gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-general text-xs font-bold uppercase tracking-wide text-gray-800">{f.label}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-general uppercase tracking-wide">coming soon</span>
                </div>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white text-center">
          <h3 className="font-zentry text-xl font-black uppercase tracking-wider mb-1">More coming soon.</h3>
          <p className="text-xs text-white/80">Stay tuned for exciting new features</p>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="px-6 py-16 bg-white">
        <p className="font-general text-xs uppercase tracking-widest text-orange-500 mb-2">Our Journey</p>
        <h2 className="font-zentry text-3xl font-black uppercase tracking-wider text-gray-900 mb-6 leading-tight">
          The Story of a Connected School
        </h2>
        <img
          src={`${import.meta.env.BASE_URL}img/entrance.webp`}
          alt="School entrance"
          className="w-full rounded-xl object-cover h-56 mb-6"
        />
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Where education meets innovation, lies CS Connect and the boundless
          pillar of knowledge. Discover its potential and shape your school's
          future amidst infinite possibilities.
        </p>
        <button
          onClick={() => navigate("/about")}
          className="w-full py-3 rounded-full bg-orange-500 text-white text-xs font-general uppercase tracking-wide flex items-center justify-center gap-2"
        >
          Discover our story
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-b from-orange-500 to-orange-700 text-white px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <img
              src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`}
              alt="Cornerstone School"
              className="h-8 w-8 object-contain brightness-0 invert"
            />
            <span className="font-bold text-base tracking-wide">Cornerstone Public School</span>
          </div>
          <p className="text-xs text-white/80 max-w-xs mb-4">
            Empowering the next generation through innovation, technology, and a commitment to excellence in education.
          </p>
          <a
            href="https://www.cornerstoneschool.edu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2 rounded-full border border-white/30 text-white/90 text-xs font-medium"
          >
            Visit our school website &rarr;
          </a>
          <div className="flex items-center gap-4 mt-4 mb-3">
            <a href="#" className="hover:-translate-y-0.5 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#" className="hover:-translate-y-0.5 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11.37a4 4 0 1 1-7.914 1.173A4 4 0 0 1 16 11.37m1.5-4.87h.01" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#" className="hover:-translate-y-0.5 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6M6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a href="#" className="hover:-translate-y-0.5 transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
          </div>
          <p className="text-[11px] text-white/70">&copy; 2026 Cornerstone Public School Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>

      {/* Audio prompt */}
      <div
        className={`fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-[10px] font-general uppercase tracking-wider transition-all duration-700 select-none ${
          audioStarted ? "opacity-0 scale-90 pointer-events-none" : "opacity-100"
        }`}
      >
        tap or scroll to start audio
      </div>
    </main>
  );
}

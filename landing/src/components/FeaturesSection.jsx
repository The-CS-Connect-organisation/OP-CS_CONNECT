import { motion } from 'framer-motion';
import {
  BookOpen,
  BarChart3,
  Clock,
  FlaskConical,
  MessageSquare,
  CreditCard,
  Users,
  CalendarDays,
} from 'lucide-react';
import ScrollTriggerWrapper from './animations/ScrollTriggerWrapper.jsx';
import GlassCard from './glassmorphism/GlassCard.jsx';
import Interactive3DCard from './3d/Interactive3DCard.jsx';

const FEATURES = [
  {
    id: 'attendance',
    icon: Clock,
    title: 'Smart Attendance',
    description: 'Real-time tracking with instant parent notifications.',
    portal: 'academic',
    accent: '#ff6b9d',
  },
  {
    id: 'grades',
    icon: BarChart3,
    title: 'Grades & Analytics',
    description: 'Detailed performance insights across all subjects.',
    portal: 'academic',
    accent: '#c44dff',
  },
  {
    id: 'timetable',
    icon: CalendarDays,
    title: 'Timetable Manager',
    description: 'Drag-and-drop scheduling for classes and exams.',
    portal: 'shared',
    accent: '#6366f1',
  },
  {
    id: 'ai-lab',
    icon: FlaskConical,
    title: 'AI Lab',
    description: 'AI-powered tutoring and assignment assistance.',
    portal: 'academic',
    accent: '#ff6b9d',
  },
  {
    id: 'comms',
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Unified messaging between staff, students, and parents.',
    portal: 'shared',
    accent: '#c44dff',
  },
  {
    id: 'fees',
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Automated invoicing, payments, and payroll tracking.',
    portal: 'management',
    accent: '#6366f1',
  },
  {
    id: 'users',
    icon: Users,
    title: 'User Management',
    description: 'Role-based access control for every stakeholder.',
    portal: 'management',
    accent: '#ff6b9d',
  },
  {
    id: 'assignments',
    icon: BookOpen,
    title: 'Assignments',
    description: 'Submit, grade, and track coursework in one place.',
    portal: 'academic',
    accent: '#c44dff',
  },
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <Interactive3DCard
      maxRotation={10}
      glowColor={`${feature.accent}60`}
      className="h-full"
    >
      <GlassCard className="group relative p-6 h-full hover:border-white/[0.12] transition-all duration-300 cursor-default">
        {/* Glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${feature.accent}12 0%, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{ background: `${feature.accent}18`, border: `1px solid ${feature.accent}30` }}
        >
          <Icon size={20} style={{ color: feature.accent }} />
        </div>

        {/* Text */}
        <h3 className="text-sm font-bold text-white mb-1.5">{feature.title}</h3>
        <p className="text-xs text-white/40 leading-relaxed">{feature.description}</p>

        {/* Portal badge */}
        <div className="mt-4">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              color: feature.accent,
              background: `${feature.accent}15`,
            }}
          >
            {feature.portal === 'shared' ? 'All Portals' : feature.portal === 'academic' ? 'Academic' : 'Management'}
          </span>
        </div>
      </GlassCard>
    </Interactive3DCard>
  );
}

export default function FeaturesSection() {
  return (
    <section aria-label="Features" className="relative py-28 px-6 bg-[#0a0a0a]">
      {/* Section header */}
      <ScrollTriggerWrapper animation="fadeUp" duration={0.8}>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-white/50 tracking-wide uppercase mb-6">
            Everything You Need
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Built for every role in your school
          </h2>
          <p className="text-white/40 text-base leading-relaxed">
            From attendance to AI-powered tutoring — SchoolSync covers the full lifecycle of school management.
          </p>
        </div>
      </ScrollTriggerWrapper>

      {/* Cards grid with stagger animation */}
      <ScrollTriggerWrapper animation="fadeUp" stagger={0.1} duration={0.6}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </ScrollTriggerWrapper>
    </section>
  );
}

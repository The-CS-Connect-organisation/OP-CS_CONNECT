import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
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

const FEATURES = [
  {
    id: 'attendance',
    icon: Clock,
    title: 'Smart Attendance',
    description: 'Real-time tracking with instant parent notifications.',
  },
  {
    id: 'grades',
    icon: BarChart3,
    title: 'Grades & Analytics',
    description: 'Detailed performance insights across all subjects.',
  },
  {
    id: 'timetable',
    icon: CalendarDays,
    title: 'Timetable Manager',
    description: 'Drag-and-drop scheduling for classes and exams.',
  },
  {
    id: 'ai-lab',
    icon: FlaskConical,
    title: 'AI Lab',
    description: 'AI-powered tutoring and assignment assistance.',
  },
  {
    id: 'comms',
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Unified messaging between staff, students, and parents.',
  },
  {
    id: 'fees',
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Automated invoicing, payments, and payroll tracking.',
  },
  {
    id: 'users',
    icon: Users,
    title: 'User Management',
    description: 'Role-based access control for every stakeholder.',
  },
  {
    id: 'assignments',
    icon: BookOpen,
    title: 'Assignments',
    description: 'Submit, grade, and track coursework in one place.',
  },
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  const cardRef = useRef(null);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.1, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
      }}
      className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300"
    >
      {/* Hover gradient effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(249,115,22,0.05) 100%)',
        }}
      />

      {/* Icon */}
      <motion.div
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        }}
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.4 }
        }}
      >
        <Icon size={28} className="text-white" />
      </motion.div>

      {/* Text */}
      <h3 className="relative text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="relative text-sm text-gray-600 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section 
      ref={sectionRef}
      aria-label="Features" 
      className="relative py-32 px-6 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden"
    >
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          y,
          background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
        }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{
          y: useTransform(scrollYProgress, [0, 1], [-50, 50]),
          background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Section header */}
      <motion.div
        className="relative text-center max-w-3xl mx-auto mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-semibold text-orange-600 tracking-wide uppercase mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Everything You Need
        </motion.div>
        <motion.h2 
          className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Built for every role in your school
        </motion.h2>
        <motion.p 
          className="text-xl text-gray-600 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          From attendance to AI-powered tutoring — SchoolSync covers the full lifecycle of school management.
        </motion.p>
      </motion.div>

      {/* Cards grid */}
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      className="group relative p-8 rounded-3xl bg-white border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
        }}
      >
        <Icon size={28} className="text-white" />
      </div>

      {/* Text */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesSection() {
  return (
    <section aria-label="Features" className="relative py-32 px-6 bg-gray-50">
      {/* Section header */}
      <motion.div
        className="text-center max-w-3xl mx-auto mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-semibold text-orange-600 tracking-wide uppercase mb-6">
          Everything You Need
        </div>
        <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6">
          Built for every role in your school
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          From attendance to AI-powered tutoring — SchoolSync covers the full lifecycle of school management.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

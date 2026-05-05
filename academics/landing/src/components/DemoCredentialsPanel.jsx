import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, ShieldCheck, Car } from 'lucide-react';

export const DEMO_CREDENTIALS = [
  {
    role: 'student',
    label: 'Student',
    icon: GraduationCap,
    email: 'student@schoolsync.edu',
    password: 'student123',
    portal: 'academics',
    accent: '#f59e0b',
  },
  {
    role: 'teacher',
    label: 'Teacher',
    icon: BookOpen,
    email: 'teacher@schoolsync.edu',
    password: 'teacher123',
    portal: 'academics',
    accent: '#f97316',
  },
  {
    role: 'parent',
    label: 'Parent',
    icon: Users,
    email: 'parent@schoolsync.edu',
    password: 'parent123',
    portal: 'academics',
    accent: '#ea580c',
  },
  {
    role: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    email: 'admin@schoolsync.edu',
    password: 'admin123',
    portal: 'management',
    accent: '#ffffff',
  },
  {
    role: 'driver',
    label: 'Driver',
    icon: Car,
    email: 'driver@schoolsync.edu',
    password: 'driver123',
    portal: 'academics',
    accent: '#10b981',
  },
];

export default function DemoCredentialsPanel({ portal, onSelect }) {
  const filtered = DEMO_CREDENTIALS.filter((c) => c.portal === portal);

  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
        Demo Credentials — click to fill
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={portal}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="space-y-2"
        >
          {filtered.map((cred) => {
            const Icon = cred.icon;
            return (
              <button
                key={cred.role}
                type="button"
                onClick={() => onSelect(cred.email, cred.password)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl glass border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200 text-left group"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cred.accent}18`, border: `1px solid ${cred.accent}30` }}
                >
                  <Icon size={14} style={{ color: cred.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: cred.accent }}
                    >
                      {cred.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate font-mono mt-0.5">{cred.email}</p>
                </div>
                <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors font-medium">
                  Use →
                </span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

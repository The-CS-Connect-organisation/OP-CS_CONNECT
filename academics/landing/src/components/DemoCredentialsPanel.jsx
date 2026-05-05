import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, ShieldCheck, Bus, UserCog } from 'lucide-react';

const ALL_CREDENTIALS = [
  // Students
  { role: 'student', label: 'Student', num: 1, icon: GraduationCap, email: 'student@schoolsync.edu',  password: 'student123', portal: 'academics',   accent: '#f59e0b' },
  { role: 'student', label: 'Student', num: 2, icon: GraduationCap, email: 'student2@schoolsync.edu', password: 'student123', portal: 'academics',   accent: '#f59e0b' },
  { role: 'student', label: 'Student', num: 3, icon: GraduationCap, email: 'student3@schoolsync.edu', password: 'student123', portal: 'academics',   accent: '#f59e0b' },
  // Teachers
  { role: 'teacher', label: 'Teacher', num: 1, icon: BookOpen,      email: 'teacher@schoolsync.edu',  password: 'teacher123', portal: 'academics',   accent: '#f97316' },
  { role: 'teacher', label: 'Teacher', num: 2, icon: BookOpen,      email: 'teacher2@schoolsync.edu', password: 'teacher123', portal: 'academics',   accent: '#f97316' },
  { role: 'teacher', label: 'Teacher', num: 3, icon: BookOpen,      email: 'teacher3@schoolsync.edu', password: 'teacher123', portal: 'academics',   accent: '#f97316' },
  // Parents
  { role: 'parent',  label: 'Parent',  num: 1, icon: Users,         email: 'parent@schoolsync.edu',   password: 'parent123',  portal: 'academics',   accent: '#ea580c' },
  { role: 'parent',  label: 'Parent',  num: 2, icon: Users,         email: 'parent2@schoolsync.edu',  password: 'parent123',  portal: 'academics',   accent: '#ea580c' },
  { role: 'parent',  label: 'Parent',  num: 3, icon: Users,         email: 'parent3@schoolsync.edu',  password: 'parent123',  portal: 'academics',   accent: '#ea580c' },
  // Drivers
  { role: 'driver',  label: 'Driver',  num: 1, icon: Bus,           email: 'driver@schoolsync.edu',   password: 'driver123',  portal: 'academics',   accent: '#10b981' },
  { role: 'driver',  label: 'Driver',  num: 2, icon: Bus,           email: 'driver2@schoolsync.edu',  password: 'driver123',  portal: 'academics',   accent: '#10b981' },
  { role: 'driver',  label: 'Driver',  num: 3, icon: Bus,           email: 'driver3@schoolsync.edu',  password: 'driver123',  portal: 'academics',   accent: '#10b981' },
  // Admins
  { role: 'admin',   label: 'Admin',   num: 1, icon: UserCog,       email: 'admin@schoolsync.edu',    password: 'admin123',   portal: 'management',  accent: '#ffffff' },
  { role: 'admin',   label: 'Admin',   num: 2, icon: UserCog,       email: 'admin2@schoolsync.edu',   password: 'admin123',   portal: 'management',  accent: '#ffffff' },
  { role: 'admin',   label: 'Admin',   num: 3, icon: UserCog,       email: 'admin3@schoolsync.edu',   password: 'admin123',   portal: 'management',  accent: '#ffffff' },
];

const ROLE_TABS = {
  academics:   ['student', 'teacher', 'parent', 'driver'],
  management:  ['admin'],
};

const ROLE_META = {
  student: { icon: GraduationCap, accent: '#f59e0b' },
  teacher: { icon: BookOpen,      accent: '#f97316' },
  parent:  { icon: Users,         accent: '#ea580c' },
  driver:  { icon: Bus,           accent: '#10b981' },
  admin:   { icon: UserCog,       accent: '#ffffff' },
};

export const DEMO_CREDENTIALS = ALL_CREDENTIALS;

export default function DemoCredentialsPanel({ portal, onSelect }) {
  const tabs = ROLE_TABS[portal] || ['student'];
  const [activeRole, setActiveRole] = useState(tabs[0]);

  const filtered = ALL_CREDENTIALS.filter(c => c.portal === portal && c.role === activeRole);

  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
        Demo Credentials — click to fill
      </p>

      {/* Role tabs */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {tabs.map(role => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
              style={{
                background: isActive ? `${meta.accent}20` : 'rgba(255,255,255,0.04)',
                color: isActive ? meta.accent : 'rgba(255,255,255,0.35)',
                border: `1px solid ${isActive ? meta.accent + '40' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <Icon size={11} />
              {role}
            </button>
          );
        })}
      </div>

      {/* 3 accounts for active role */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${portal}-${activeRole}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-1.5"
        >
          {filtered.map((cred) => {
            const Icon = cred.icon;
            return (
              <button
                key={cred.email}
                type="button"
                onClick={() => onSelect(cred.email, cred.password)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.18] transition-all duration-200 text-left group"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                  style={{ background: cred.accent }}
                >
                  {cred.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/60 truncate font-mono">{cred.email}</p>
                </div>
                <span className="text-[10px] text-white/25 group-hover:text-white/50 transition-colors font-mono flex-shrink-0">
                  {cred.password}
                </span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

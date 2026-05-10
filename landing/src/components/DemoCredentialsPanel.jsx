import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, ShieldCheck, Bus, UserCog } from 'lucide-react';

const ALL_CREDENTIALS = [
  // Students
  { role: 'student', label: 'Student', num: 1, icon: GraduationCap, email: 'student@schoolsync.edu',  password: 'student123', accent: '#f59e0b' },
  { role: 'student', label: 'Student', num: 2, icon: GraduationCap, email: 'student2@schoolsync.edu', password: 'student123', accent: '#f59e0b' },
  { role: 'student', label: 'Student', num: 3, icon: GraduationCap, email: 'student3@schoolsync.edu', password: 'student123', accent: '#f59e0b' },
  // Teachers
  { role: 'teacher', label: 'Teacher', num: 1, icon: BookOpen,      email: 'teacher@schoolsync.edu',  password: 'teacher123', accent: '#f97316' },
  { role: 'teacher', label: 'Teacher', num: 2, icon: BookOpen,      email: 'teacher2@schoolsync.edu', password: 'teacher123', accent: '#f97316' },
  { role: 'teacher', label: 'Teacher', num: 3, icon: BookOpen,      email: 'teacher3@schoolsync.edu', password: 'teacher123', accent: '#f97316' },
  // Parents
  { role: 'parent',  label: 'Parent',  num: 1, icon: Users,         email: 'parent@schoolsync.edu',   password: 'parent123',  accent: '#ea580c' },
  { role: 'parent',  label: 'Parent',  num: 2, icon: Users,         email: 'parent2@schoolsync.edu',  password: 'parent123',  accent: '#ea580c' },
  { role: 'parent',  label: 'Parent',  num: 3, icon: Users,         email: 'parent3@schoolsync.edu',  password: 'parent123',  accent: '#ea580c' },
  // Drivers
  { role: 'driver',  label: 'Driver',  num: 1, icon: Bus,           email: 'driver@schoolsync.edu',   password: 'driver123',  accent: '#10b981' },
  { role: 'driver',  label: 'Driver',  num: 2, icon: Bus,           email: 'driver2@schoolsync.edu',  password: 'driver123',  accent: '#10b981' },
  { role: 'driver',  label: 'Driver',  num: 3, icon: Bus,           email: 'driver3@schoolsync.edu',  password: 'driver123',  accent: '#10b981' },
  // Admins
  { role: 'admin',   label: 'Admin',   num: 1, icon: UserCog,       email: 'admin@schoolsync.edu',    password: 'admin123',   accent: '#f59e0b' },
  { role: 'admin',   label: 'Admin',   num: 2, icon: UserCog,       email: 'admin2@schoolsync.edu',   password: 'admin123',   accent: '#f59e0b' },
  { role: 'admin',   label: 'Admin',   num: 3, icon: UserCog,       email: 'admin3@schoolsync.edu',   password: 'admin123',   accent: '#f59e0b' },
];

const ROLE_TABS = ['student', 'teacher', 'parent', 'driver', 'admin'];

const ROLE_META = {
  student: { icon: GraduationCap, accent: '#f59e0b', label: 'Student' },
  teacher: { icon: BookOpen,      accent: '#f97316', label: 'Teacher' },
  parent:  { icon: Users,         accent: '#ea580c', label: 'Parent' },
  driver:  { icon: Bus,           accent: '#10b981', label: 'Driver' },
  admin:   { icon: UserCog,       accent: '#f59e0b', label: 'Admin' },
};

export const DEMO_CREDENTIALS = ALL_CREDENTIALS;

export default function DemoCredentialsPanel({ portal, onSelect }) {
  const [activeRole, setActiveRole] = useState('student');

  // Filter by portal AND role - admins go to management, rest go to academics
  const filtered = ALL_CREDENTIALS.filter(c => {
    const roleMatch = c.role === activeRole;
    if (activeRole === 'admin') return roleMatch; // admins always shown
    return roleMatch && portal === 'academics'; // non-admins only in academics portal
  });

  const counts = ROLE_TABS.reduce((acc, role) => {
    acc[role] = ALL_CREDENTIALS.filter(c => c.role === role).length;
    return acc;
  }, {});

  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-3">
        Demo Credentials — click to fill
      </p>

      {/* Role tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {ROLE_TABS.map(role => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          const isActive = activeRole === role;
          const count = counts[role];

          return (
            <motion.button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all"
              style={{
                background: isActive ? `${meta.accent}20` : 'rgba(255,255,255,0.04)',
                color: isActive ? meta.accent : 'rgba(255,255,255,0.35)',
                border: `1px solid ${isActive ? meta.accent + '40' : 'rgba(255,255,255,0.06)'}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={11} />
              {role}
              <span className="ml-0.5 opacity-50">({count})</span>
            </motion.button>
          );
        })}
      </div>

      {/* Credentials list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${portal}-${activeRole}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="space-y-1.5"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-4 text-white/30 text-xs">
              No {activeRole} accounts in this portal
            </div>
          ) : (
            filtered.map((cred) => {
              const Icon = cred.icon;
              return (
                <motion.button
                  key={cred.email}
                  type="button"
                  onClick={() => onSelect(cred.email, cred.password)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] hover:border-white/[0.18] transition-all duration-200 text-left group"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ x: 2, background: 'rgba(255,255,255,0.07)' }}
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
                </motion.button>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
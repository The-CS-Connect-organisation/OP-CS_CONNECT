import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Palette, Monitor } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../hooks/useTheme';

export const SettingsPanel = ({ user }) => {
  const { theme, toggleTheme } = useTheme();

  const settingsItems = useMemo(() => {
    return [
      {
        icon: Shield,
        label: 'Account',
        value: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} access`,
        color: '#ffffff',
      },
      {
        icon: Bell,
        label: 'Notifications',
        value: 'In-app notifications enabled',
        color: '#a1a1aa',
      },
    ];
  }, [user.role]);

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pt-2 pb-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
          <span className="w-1 h-8 rounded-full" style={{ background: 'white' }} />
          Settings
        </h1>
        <p className="text-sm mt-1 ml-4" style={{ color: 'var(--text-muted)' }}>Theme and account preferences</p>
      </motion.div>

      {/* Theme Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <Palette size={22} style={{ color: 'var(--white-50)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Active Theme</p>
                <p className="text-xl font-bold text-[var(--text-primary)]">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>You can also toggle from the sidebar</p>
              </div>
            </div>
            <Button variant="primary" onClick={toggleTheme} icon={Monitor}>
              Toggle Theme
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Settings Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsItems.map((s) => (
              <div key={s.label} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}15` }}
                  >
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Role</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Permissions are role-based</p>
                </div>
                <Badge variant="indigo">{user.role}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};


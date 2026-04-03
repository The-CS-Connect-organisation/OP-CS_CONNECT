import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../hooks/useTheme';

export const SettingsPanel = ({ user }) => {
  const { theme, toggleTheme } = useTheme();

  const settingsItems = useMemo(() => {
    return [
      {
        icon: Shield,
        label: 'Account',
        value: `${user.role.toUpperCase()} access`,
      },
      {
        icon: Bell,
        label: 'Notifications',
        value: 'In-app (demo)',
      },
    ];
  }, [user.role]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Settings className="text-primary-500" /> Settings
        </h1>
        <p className="text-gray-500 mt-1">Theme and account preferences</p>
      </motion.div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Theme</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{theme === 'dark' ? 'Dark' : 'Light'}</p>
            <p className="text-xs text-gray-400 mt-1">You can also toggle from the sidebar.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" onClick={toggleTheme}>
              Toggle Theme
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsItems.map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                  <s.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Role</p>
                <p className="text-xs text-gray-500 mt-1">Permissions are role-based</p>
              </div>
              <Badge color="gray">{user.role}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};


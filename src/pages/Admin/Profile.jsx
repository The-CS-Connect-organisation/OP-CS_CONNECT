import { motion } from 'framer-motion';
import { UserCircle, Mail, Phone, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const Profile = ({ user }) => {
  const infoFields = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: Shield, label: 'Role', value: 'Admin' },
    { icon: UserCircle, label: 'Joined', value: user.joined },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-8 text-white"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl">
            {user.avatar || '👩‍💼'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-white/70 mt-1">Admin • Management</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge color="gray" className="bg-white/10 text-white border-none">
                Superuser
              </Badge>
              <Badge color="gray" className="bg-white/10 text-white border-none">
                {user.email}
              </Badge>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity }}
          className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full"
        />
      </motion.div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Account Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoFields.map((field) => (
            <div
              key={field.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                <field.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{field.label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{field.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};


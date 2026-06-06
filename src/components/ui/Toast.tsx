import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'rgba(16, 185, 129, 0.08)',
  error: 'rgba(239, 68, 68, 0.08)',
  warning: 'rgba(245, 158, 11, 0.08)',
  info: 'rgba(249, 115, 22, 0.08)',
};

const borderColors = {
  success: 'rgba(16, 185, 129, 0.30)',
  error: 'rgba(239, 68, 68, 0.30)',
  warning: 'rgba(245, 158, 11, 0.30)',
  info: 'rgba(249, 115, 22, 0.30)',
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl min-w-[280px] sm:min-w-[320px] max-w-md nova-glass"
            style={{
              background: colors[toast.type],
              borderLeft: `3px solid ${borderColors[toast.type]}`,
            }}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: borderColors[toast.type] }} />
            <p className="text-sm text-[var(--text-primary)] flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-black/5 transition-colors"
            >
              <X size={14} className="text-[var(--text-muted)]" />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

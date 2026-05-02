import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

const styles = {
  success: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', color: 'var(--semantic-success)', accent: '#10b981' },
  warning: { bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.2)', color: 'var(--semantic-warning)', accent: '#f59e0b' },
  error: { bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.2)', color: 'var(--semantic-error)', accent: '#f43f5e' },
  info: { bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', color: 'var(--semantic-info)', accent: '#3b82f6' },
};

export const Toast = ({ message, type = 'info', onClose }) => {
  const s = styles[type] || styles.info;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-6 right-6 z-[100] max-w-sm nova-glass overflow-hidden"
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderLeft: `3px solid ${s.accent}`,
          }}
        >
          <div className="flex items-start gap-3 px-4 py-3">
            <span style={{ color: s.color }}>{icons[type]}</span>
            <p className="text-sm font-medium flex-1" style={{ color: s.color }}>{message}</p>
            {onClose && (
              <button onClick={onClose} className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <X size={14} style={{ color: s.color }} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const sheet = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
};

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:hidden"
          {...overlay}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        >
          <motion.div
            className="w-full bg-background rounded-t-xl shadow-xl"
            style={{ maxHeight: '90vh' }}
            {...sheet}
            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/30 mx-auto sm:hidden" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(90vh - 52px)' }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type PickerOption = string | { label: string; value: string };

interface PickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: readonly PickerOption[] | PickerOption[];
  value: string;
  onChange: (value: string) => void;
}

const resolve = (opt: PickerOption): { label: string; value: string } =>
  typeof opt === 'string' ? { label: opt, value: opt } : opt;

export const PickerSheet: React.FC<PickerSheetProps> = ({ isOpen, onClose, title, options, value, onChange }) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-1">
        {options.map((opt) => {
          const { label, value: v } = resolve(opt);
          return (
            <button
              key={v}
              onClick={() => { onChange(v); onClose(); }}
              className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors ${
                value === v
                  ? 'bg-orange-500/10 text-orange-600 font-medium'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
};

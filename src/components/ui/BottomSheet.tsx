import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 transition-colors duration-250 sm:hidden ${visible ? 'bg-black/40 pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
          onClick={onClose}
        >
          <div
            className={`absolute left-0 right-0 bottom-[88px] bg-background rounded-t-xl shadow-xl transition-transform duration-250 ease-out will-change-transform ${visible ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ maxHeight: '80vh' }}
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
            <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: 'calc(80vh - 52px)' }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
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

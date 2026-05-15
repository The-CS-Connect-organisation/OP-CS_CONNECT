import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Select({ options = [], labels = [], value, onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedLabel = value
    ? (labels[options.indexOf(value)] || value)
    : 'Select...';

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
          isOpen
            ? 'border-blue-400 bg-white/5 text-white'
            : 'border-slate-700/40 bg-white/5 text-slate-300 hover:border-slate-600 hover:text-slate-200'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="shrink-0 opacity-50" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-600/50 rounded-xl shadow-xl overflow-hidden"
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {options.map((opt, i) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  value === opt
                    ? 'bg-white/5 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {labels[i] || opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import React from 'react';

interface NavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const NavSheet: React.FC<NavSheetProps> = ({ isOpen, onClose, title, children }) => {
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

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
          className={`fixed inset-0 z-50 transition-colors duration-300 lg:hidden ${visible ? 'bg-black/30 pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
          onClick={onClose}
        >
          {/* sheet anchored at the top edge of the bottom nav pill (bottom-[76px]) — same centered width (280px) */}
          <div className="absolute inset-x-0 bottom-[76px] flex justify-center">
            <div
              ref={sheetRef}
              className={`w-[280px] transition-all duration-300 ease-out origin-bottom ${visible ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-[1.75rem] rounded-b-[1.25rem] border border-white/25 bg-white/[0.07] shadow-2xl shadow-black/8 backdrop-blur-[40px] backdrop-saturate-[1.8] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent pointer-events-none rounded-[1.75rem] rounded-b-[1.25rem]" />
                <div className="absolute inset-0 rounded-[1.75rem] rounded-b-[1.25rem] shimmer-overlay pointer-events-none" />
                <div className="relative flex items-center justify-between px-5 pt-4 pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-500" />
                    </svg>
                  </button>
                </div>
                <div className="px-3 pb-4 max-h-[60vh] overflow-y-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface NavSheetItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  index?: number;
  onClick: () => void;
}

export const NavSheetItem: React.FC<NavSheetItemProps> = ({ icon, label, active, index = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-black/5 ${
        active
          ? 'text-orange-600 bg-orange-500/10 shadow-sm'
          : 'text-gray-900'
      }`}
      style={{
        transitionDelay: `${80 + index * 50}ms`,
      }}
    >
      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        active ? 'bg-orange-500 text-white' : 'bg-black/5 text-gray-500'
      }`}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
      )}
    </button>
  );
};

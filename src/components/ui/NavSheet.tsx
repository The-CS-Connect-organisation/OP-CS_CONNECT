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
          {/* spacer pushes sheet up above the nav pill */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-6">
            <div
              ref={sheetRef}
              className={`w-[calc(100%-2rem)] max-w-sm transition-all duration-300 ease-out origin-bottom ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-[1.75rem] rounded-b-none border border-white/30 bg-white/40 shadow-2xl backdrop-blur-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
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
                <div className="px-3 pb-3 max-h-[50vh] overflow-y-auto">
                  {children}
                </div>
              </div>
              {/* visual connector - same glass pill style */}
              <div className="h-[2px] mx-6 bg-white/20 backdrop-blur-2xl" />
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
          : 'text-gray-700'
      }`}
      style={{
        transitionDelay: `${80 + index * 50}ms`,
        opacity: 1,
        transform: 'translateY(0)',
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

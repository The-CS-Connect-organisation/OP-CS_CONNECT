/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          base: '#06060a',
          surface: '#0c0c14',
          elevated: '#12121e',
          floating: '#1a1a2e',
        },
        accent: {
          indigo: '#6366f1',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float-gentle 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'gradient-x': 'gradient-x 3s ease infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      boxShadow: {
        'glow': '0 0 24px rgba(99, 102, 241, 0.12)',
        'glow-strong': '0 0 40px rgba(99, 102, 241, 0.2)',
        'cyan-glow': '0 0 24px rgba(34, 211, 238, 0.12)',
        'obsidian-sm': '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
        'obsidian-md': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'obsidian-lg': '0 12px 40px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
}

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  base: '/OP-CS_CONNECT/academics/',
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
          if (id.includes('framer-motion') || id.includes('lucide-react')) return 'ui-vendor';
          if (id.includes('recharts')) return 'chart-vendor';
          return undefined;
        }
      },
    },
  },
});

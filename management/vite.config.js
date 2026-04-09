import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/OP-CS_CONNECT/management/',
  server: {
    port: 5174
  },
  build: {
    rollupOptions: {
      output: {
        // Vite/Rolldown expects `manualChunks` to be a function.
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

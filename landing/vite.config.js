import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/OP-CS_CONNECT/',
  server: {
    port: 5175,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
          if (id.includes('framer-motion') || id.includes('lucide-react')) return 'ui-vendor';
          return undefined;
        },
      },
    },
  },
});

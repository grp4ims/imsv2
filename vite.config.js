import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['jwt-decode'], 
    exclude: ['path', 'url'], 
  },
  resolve: {
    alias: {
      
      '@': '/src',
    },
  },
});

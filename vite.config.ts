import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/generative-art/',
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
  },
});

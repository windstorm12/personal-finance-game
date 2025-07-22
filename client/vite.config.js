import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/start': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/next-scenario': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/choose-action': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/stats': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/train-skill': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/leaderboard': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/player-stats': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/debt-info': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/pay-debt': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/achievements': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001',
      '/auth': process.env.NODE_ENV === 'production' ? 'https://your-backend-url.onrender.com' : 'http://localhost:3001'
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'recharts',
        'date-fns'
      ]
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api/leaves': {
          target: env.VITE_LEAVE_MANAGEMENT_SHEET_URL,
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api\/leaves/, '') + '?e=list',
        },
        '/api/login': {
          target: env.VITE_LOGIN_SHEET_URL,
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api\/login/, ''),
        },
        '/api/noc': {
          target: env.VITE_NOC_URL,
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api\/noc/, '') + '?e=list',
        },
        '/api/feedback': {
          target: env.VITE_FEEDBACK_URL,
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api\/feedback/, '') + '?sheet=' + encodeURIComponent('Form Responses 1'),
        },
        '/api/articles': {
          target: env.VITE_ARTICLE_URL,
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) => path.replace(/^\/api\/articles/, '') + '?e=list',
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: true
    }
  };
});
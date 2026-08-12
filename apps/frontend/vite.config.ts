import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react({})],
    server: {
      port: Number(env.FRONTEND_PORT ?? 3600),
      // The backend CORS allowlist is pinned to this port, so fail loudly
      // instead of silently falling back to the next free one.
      strictPort: true,
    },
  };
});

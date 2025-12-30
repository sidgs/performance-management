import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Automatically set ENV_TYPE to 'dev' in development mode
  const envType = mode === 'development' ? 'dev' : 'prod';

  return {
    base: './', // Use relative paths for assets in dist/index.html
    plugins: [react()],
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', '*.gosami.ai', 'apps.sidglobal.cloud'],
      proxy: {
        // Proxy all API calls for the EPM backend to the Spring Boot app
        '/api/v1/epm': {
          target: 'http://localhost:9081',
          changeOrigin: true,
          secure: false,
        },
        // Proxy all API calls for the agent API to the FastAPI app
        '/api/v1/pulse-epm-agent': {
          target: 'http://localhost:8001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Expose ENV_TYPE to the client via define
    // This replaces import.meta.env.ENV_TYPE at build time
    define: {
      'import.meta.env.ENV_TYPE': JSON.stringify(envType),
    },
  };
});

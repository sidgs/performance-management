import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; // Keep only resolve from path
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types',
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      staticImport: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.tsx'),
      name: 'SIDGSPerformance', // Global variable name (for UMD)
      fileName: (format) => `sidgs-performance.${format}.js`,
      formats: ['umd', 'es'], // UMD is required, ES is optional but recommended
    },
    rollupOptions: {
      // Externalize React and ReactDOM (and other peer dependencies)
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
        },
        exports: 'named',
      },
    },
    minify: true,
    sourcemap: true,
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy all API calls for the EPM backend to the Spring Boot app
      '/api/v1/epm': {
        target: 'http://localhost:9081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
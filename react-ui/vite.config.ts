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
      entry: resolve(__dirname, 'src/lib.tsx'), // Your library entry point
      name: 'SIDGSPerformance', // Global variable name for UMD
      fileName: (format) => `sidgs-performance.${format}.js`,
      formats: ['umd', 'es'], // Generate both formats
    },
    rollupOptions: {
      // Externalize peer dependencies
      external: [
        'react', 
        'react-dom', 
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled'
      ],
      output: {
        // UMD globals
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          '@emotion/react': 'EmotionReact',
          '@emotion/styled': 'EmotionStyled',
        },
        // Provide exports
        exports: 'named',
      },
    },
    // Optimize build
    minify: 'terser',
    sourcemap: true,
    emptyOutDir: true, // Clean dist before building
  },
  // Remove the resolve.alias section completely
});
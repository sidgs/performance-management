import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Create index.html for ES module distribution
// This assumes peer dependencies are available via npm/node_modules or CDN
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Performance Management Application</title>
    <!-- Inter font from Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Import maps for ES module peer dependencies -->
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18",
        "react-dom": "https://esm.sh/react-dom@18",
        "react-dom/client": "https://esm.sh/react-dom@18/client",
        "react-router-dom": "https://esm.sh/react-router-dom@6",
        "@mui/material": "https://esm.sh/@mui/material@5",
        "@mui/icons-material": "https://esm.sh/@mui/icons-material@5",
        "@emotion/react": "https://esm.sh/@emotion/react@11",
        "@emotion/styled": "https://esm.sh/@emotion/styled@11"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      // Import peer dependencies via import map (ESM CDN)
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import { SIDGSPerformanceApp } from './sidgs-performance.es.js';
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(SIDGSPerformanceApp));
    </script>
  </body>
</html>`;

const distPath = resolve(process.cwd(), 'dist');
const htmlPath = resolve(distPath, 'index.html');

// Only create if ES bundle exists
const esBundlePath = resolve(distPath, 'sidgs-performance.es.js');
if (existsSync(esBundlePath)) {
  writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('✓ Created index.html in dist/ for standalone ES module usage');
  console.log('  Note: Requires peer dependencies (React, ReactDOM, MUI) to be available');
} else {
  console.log('⚠ ES bundle not found, skipping index.html creation');
}


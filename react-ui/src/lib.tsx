import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Re-export all your components
export { default as App } from './App';
export { default as HomePage } from './pages/HomePage';
export { default as GoalsPage } from './pages/GoalsPage';
export { default as Header } from './components/layout/Header';
export { default as Footer } from './components/layout/Footer';
export { default as SideNavigation } from './components/layout/SideNavigation';
export { default as Breadcrumbs } from './components/layout/Breadcrumbs';
export { default as Layout } from './components/layout/Layout';

// Export types
export type { User, Goal, GoalStatus, Department } from './types'; // Create this file

// Export theme
export const sidgsTheme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // SIDGS blue
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00b0ff', // SIDGS accent blue
      light: '#69e2ff',
      dark: '#0081cb',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#1a237e',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#1a237e',
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Optional: Pre-configured App wrapper
export const SIDGSPerformanceApp: React.FC = () => {
  return (
    <ThemeProvider theme={sidgsTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
};

// Default export
export default SIDGSPerformanceApp;
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import theme from './theme/theme';
import HomePage from './pages/HomePage';
import Layout from './components/layout/Layout';
import WidgetLayout from './components/layout/WidgetLayout';
import GoalsPage from './pages/GoalsPage';
import LoginPage from './pages/LoginPage';
import NotAuthenticatedPage from './pages/NotAuthenticatedPage';
import BulkUploadPage from './pages/BulkUploadPage';
import TeamManagementPage from './pages/TeamManagementPage';
import HRAdminPage from './pages/HRAdminPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import { isAuthenticated, isDevMode, setupParentTokenListener, initializeWidgetAuth } from './api/authService';
import { isWidgetMode } from './utils/widgetMode';

function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const widgetMode = isWidgetMode();

  useEffect(() => {
    // Initialize widget authentication (checks Authorization header and sets epm_user_auth_token)
    if (widgetMode) {
      initializeWidgetAuth();
      setupParentTokenListener();
    }

    // Check authentication status on mount
    setAuthenticated(isAuthenticated());

    // Listen for storage changes (e.g., when token is set/removed in another tab)
    const handleStorageChange = () => {
      setAuthenticated(isAuthenticated());
    };

    // Listen for custom auth change event (when token is set in same window)
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authchange', handleAuthChange);
    
    // Also check periodically in case token is set in same window
    // In widget mode, check more frequently as parent might send token
    const interval = setInterval(() => {
      setAuthenticated(isAuthenticated());
    }, widgetMode ? 200 : 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authchange', handleAuthChange);
      clearInterval(interval);
    };
  }, [widgetMode]);

  const devMode = isDevMode();
  const LayoutComponent = widgetMode ? WidgetLayout : Layout;

  // Show nothing while checking authentication
  if (authenticated === null) {
    const loadingContent = (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
    
    // In widget mode, PerformanceManagementWidget provides ThemeProvider/CssBaseline
    if (widgetMode) {
      return loadingContent;
    }
    
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {loadingContent}
      </ThemeProvider>
    );
  }

  // Routes content - always needs to be inside Router
  // Routes content - always needs to be inside Router
  const routesContent = (
    <Routes>
      {/* Only show login page in dev mode and not in widget mode */}
      {devMode && !widgetMode && <Route path="/login" element={<LoginPage />} />}
      <Route
        path="/*"
        element={
          authenticated ? (
            <LayoutComponent>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<div>Dashboard Page</div>} />
                <Route path="/performance" element={<div>Performance Page</div>} />
                <Route path="/reports" element={<div>Reports Page</div>} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/bulk-upload" element={<BulkUploadPage />} />
                <Route path="/hr-admin" element={<HRAdminPage />} />
                <Route path="/departments" element={<DepartmentManagementPage />} />
              </Routes>
            </LayoutComponent>
          ) : widgetMode ? (
            // In widget mode, show loading/not authenticated (parent handles auth)
            <NotAuthenticatedPage />
          ) : devMode ? (
            // In dev mode, redirect to login
            <Navigate to="/login" replace />
          ) : (
            // In non-dev mode, show not authenticated message
            <NotAuthenticatedPage />
          )
        }
      />
    </Routes>
  );

  // In widget mode, PerformanceManagementWidget provides ThemeProvider, CssBaseline, and Router
  // So we just return Routes (which will be inside Router from PerformanceManagementWidget)
  if (widgetMode) {
    return routesContent;
  }

  // Standalone mode - provide all wrappers
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {routesContent}
      </Router>
    </ThemeProvider>
  );
}

export default App;
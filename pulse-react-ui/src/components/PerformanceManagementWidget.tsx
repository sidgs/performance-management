import React, { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HashRouter } from 'react-router-dom';
import App from '../App';
import { setWidgetMode } from '../utils/widgetMode';
import { initializeWidgetAuth } from '../api/authService';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../theme/theme';

interface PerformanceManagementWidgetProps {
  /**
   * Optional JWT token passed as prop (alternative to Authorization header)
   * If provided, will be stored in epm_user_auth_token if user_auth_token is not set
   */
  token?: string;
  /**
   * Optional base URL for API calls (defaults to /api/v1/epm)
   * Note: Currently not used, API endpoint is hardcoded in graphqlClient
   */
  apiBaseUrl?: string;
}

/**
 * PerformanceManagementWidget - UMD library component for widget mode
 * 
 * This component:
 * - Automatically enables widget mode
 * - Initializes authentication from user_auth_token or Authorization header
 * - Uses WidgetLayout (no header/footer)
 * - Can be embedded in another React app as a UMD library
 * 
 * Usage in parent React app:
 * ```tsx
 * import { PerformanceManagementWidget } from '@sidgs/performance-management';
 * 
 * function MyApp() {
 *   return (
 *     <PerformanceManagementWidget 
 *       token="eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0..." 
 *     />
 *   );
 * }
 * ```
 * 
 * Or set token via:
 * - localStorage: user_auth_token (primary) or epm_user_auth_token (backup)
 * - Authorization header: <meta name="authorization" content="Bearer <token>">
 * - Global variable: window.__EPM_AUTH_TOKEN__ = "Bearer <token>"
 */
const PerformanceManagementWidget: React.FC<PerformanceManagementWidgetProps> = ({ 
  token,
  apiBaseUrl: _apiBaseUrl 
}) => {
  // Enable widget mode IMMEDIATELY (synchronously) - this must happen before App renders
  // so that App can detect widget mode on first render
  setWidgetMode(true);
  
  useEffect(() => {
    // Initialize authentication
    // Priority: user_auth_token > token prop > Authorization header > epm_user_auth_token
    if (token) {
      // Check if user_auth_token already exists
      const primaryToken = localStorage.getItem('user_auth_token');
      if (!primaryToken) {
        // Store token in epm_user_auth_token as backup
        localStorage.setItem('epm_user_auth_token', token);
        window.dispatchEvent(new Event('authchange'));
      }
      // If primary token exists, ignore the prop token (user_auth_token takes precedence)
    } else {
      // Initialize from localStorage and Authorization header
      // This checks user_auth_token first, then Authorization header, and stores in epm_user_auth_token if needed
      initializeWidgetAuth();
    }
  }, [token]);

  // App component already includes ThemeProvider, CssBaseline, and Router
  // But we need to provide them here since this is the entry point for UMD
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default PerformanceManagementWidget;


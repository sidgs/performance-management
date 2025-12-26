import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PerformanceManagementWidget from './components/PerformanceManagementWidget';
import './styles/global.css';

// Check if we should start in widget mode
// Can be enabled via:
// 1. Environment variable: VITE_WIDGET_MODE=true
// 2. URL parameter: ?widget=true
// 3. localStorage: widgetMode=true
const isWidgetModeEnv = import.meta.env.VITE_WIDGET_MODE === 'true';
const urlParams = new URLSearchParams(window.location.search);
const isWidgetModeUrl = urlParams.get('widget') === 'true';
const isWidgetModeStorage = localStorage.getItem('widgetMode') === 'true';

const shouldUseWidget = isWidgetModeEnv || isWidgetModeUrl || isWidgetModeStorage;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {shouldUseWidget ? <PerformanceManagementWidget /> : <App />}
  </React.StrictMode>
);
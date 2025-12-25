/**
 * Widget mode utilities
 * Detects if the app is running in widget/embedded mode
 */

// Global flag to indicate widget mode (set when loaded as PerformanceManagementWidget)
let widgetModeFlag: boolean | null = null;

/**
 * Set widget mode explicitly (called when loaded as PerformanceManagementWidget)
 */
export function setWidgetMode(enabled: boolean): void {
  widgetModeFlag = enabled;
}

/**
 * Check if the app is running in widget mode
 * Widget mode is detected via:
 * 1. Explicit flag set by PerformanceManagementWidget component
 * 2. URL query parameter: ?widget=true
 * 3. localStorage flag: widgetMode=true
 * 4. window.parent !== window (running in iframe)
 */
export function isWidgetMode(): boolean {
  // Check explicit flag first (set by PerformanceManagementWidget)
  if (widgetModeFlag !== null) {
    return widgetModeFlag;
  }

  // Check URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('widget') === 'true') {
    return true;
  }

  // Check localStorage flag
  if (localStorage.getItem('widgetMode') === 'true') {
    return true;
  }

  // Check if running in iframe
  try {
    return window.self !== window.top;
  } catch (e) {
    // Cross-origin iframe - assume widget mode
    return true;
  }
}

/**
 * Enable widget mode programmatically
 */
export function enableWidgetMode(): void {
  localStorage.setItem('widgetMode', 'true');
}

/**
 * Disable widget mode
 */
export function disableWidgetMode(): void {
  localStorage.removeItem('widgetMode');
}


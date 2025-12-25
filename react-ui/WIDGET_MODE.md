# Widget Mode Documentation

The Performance Management application supports **Widget Mode** as a UMD library component (`PerformanceManagementWidget`), allowing it to be embedded in a parent React application where login/logout are handled externally.

## Features

- **UMD Library**: Can be loaded as a UMD library in another React app
- **No Header/Footer**: Widget mode hides the header and footer for a cleaner embedded experience
- **External Authentication**: Authentication tokens are received from parent app via props, localStorage, or Authorization header
- **Automatic Detection**: Widget mode is automatically enabled when using `PerformanceManagementWidget` component
- **Token Priority**: Uses `user_auth_token` (primary) or `epm_user_auth_token` (backup) from localStorage

## How Widget Mode Works

### Component-Based Widget Mode

Widget mode is enabled when using the `PerformanceManagementWidget` component. This component:
- Automatically sets widget mode flag
- Initializes authentication from multiple sources
- Uses `WidgetLayout` (no header/footer)

### Authentication Flow

The widget checks for authentication tokens in this priority order:

1. **`user_auth_token`** in localStorage (primary) - set by parent app
2. **Token prop** passed to `PerformanceManagementWidget` component
3. **Authorization header** - via meta tag, script tag, or global variable
4. **`epm_user_auth_token`** in localStorage (backup) - set automatically from Authorization header if `user_auth_token` is missing

**Important**: `epm_user_auth_token` is only set if `user_auth_token` is not present. The widget always prefers `user_auth_token` over `epm_user_auth_token`.

## Integration Guide

### 1. Install/Import the Widget

#### As UMD Library

```html
<!-- Load the UMD bundle -->
<script src="https://your-cdn.com/sidgs-performance.umd.js"></script>
<script>
  // Widget is available as SIDGSPerformance.PerformanceManagementWidget
</script>
```

#### As ES Module (if published to npm)

```bash
npm install @sidgs/performance-management
```

```javascript
import { PerformanceManagementWidget } from '@sidgs/performance-management';
```

### 2. Use in Your React App

```tsx
import React, { useState, useEffect } from 'react';
import { PerformanceManagementWidget } from '@sidgs/performance-management';

function MyPortalApp() {
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Your login logic
  const handleLogin = async () => {
    const response = await fetch('/api/login', { ... });
    const data = await response.json();
    setAuthToken(data.token);
    
    // Option 1: Pass token as prop
    // The widget will use it if user_auth_token is not set
    
    // Option 2: Store in localStorage (preferred)
    localStorage.setItem('user_auth_token', data.token);
  };

  return (
    <div>
      <h1>My Portal</h1>
      <button onClick={handleLogin}>Login</button>
      
      {/* Option 1: Pass token as prop */}
      <PerformanceManagementWidget token={authToken} />
      
      {/* Option 2: Set in localStorage (no prop needed) */}
      {/* <PerformanceManagementWidget /> */}
    </div>
  );
}
```

### 3. Authentication Methods

#### Method 1: localStorage (Recommended)

```javascript
// Set primary token (highest priority)
localStorage.setItem('user_auth_token', 'your-jwt-token-here');

// Or set backup token (used if user_auth_token is missing)
localStorage.setItem('epm_user_auth_token', 'your-jwt-token-here');
```

#### Method 2: Component Prop

```tsx
<PerformanceManagementWidget token="your-jwt-token-here" />
```

#### Method 3: Authorization Header (Meta Tag)

```html
<meta name="authorization" content="Bearer your-jwt-token-here">
```

#### Method 4: Authorization Header (Global Variable)

```javascript
window.__EPM_AUTH_TOKEN__ = 'Bearer your-jwt-token-here';
// Or just the token
window.__EPM_AUTH_TOKEN__ = 'your-jwt-token-here';
```

#### Method 5: Authorization Header (Script Tag)

```html
<script data-authorization="Bearer your-jwt-token-here"></script>
```

### 4. Token Priority

The widget uses tokens in this order:
1. `user_auth_token` from localStorage (primary)
2. Token prop passed to component
3. Authorization header (meta/script/global variable)
4. `epm_user_auth_token` from localStorage (backup)

**Note**: `epm_user_auth_token` is only set automatically from Authorization header if `user_auth_token` is missing.

## Security Considerations

### Production Setup

1. **Origin Verification**: Always verify `event.origin` in production:
   ```javascript
   if (event.origin !== 'https://your-widget-domain.com') {
     return; // Reject messages from unknown origins
   }
   ```

2. **CORS Configuration**: The backend allows all origins for development. Restrict in production:
   ```java
   configuration.setAllowedOrigins(Arrays.asList(
     "https://your-portal-domain.com"
   ));
   ```

3. **X-Frame-Options**: The backend is configured to allow iframe embedding. Review for production needs.

## API Reference

### Widget Mode Detection

```typescript
import { isWidgetMode, enableWidgetMode, disableWidgetMode } from './utils/widgetMode';

// Check if in widget mode
const isWidget = isWidgetMode();

// Enable widget mode programmatically
enableWidgetMode();

// Disable widget mode
disableWidgetMode();
```

### Authentication Functions

```typescript
import { setAuthTokenFromParent, setupParentTokenListener } from './api/authService';

// Setup listener for tokens from parent (called automatically in widget mode)
setupParentTokenListener();

// Set token from parent portal
setAuthTokenFromParent('jwt-token-here');
```

## Message Format

### Token Message

```javascript
{
  type: 'EPM_AUTH_TOKEN',
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0...'
}
```

### Token Request

```javascript
{
  type: 'EPM_REQUEST_TOKEN'
}
```

## Example: Complete Integration

### React App Integration

```tsx
import React, { useState, useEffect } from 'react';
import { PerformanceManagementWidget } from '@sidgs/performance-management';

function MyPortalApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Login handler
  const handleLogin = async () => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    
    // Store token in localStorage (preferred method)
    localStorage.setItem('user_auth_token', data.token);
    setToken(data.token);
    setIsAuthenticated(true);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('user_auth_token');
    localStorage.removeItem('epm_user_auth_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('user_auth_token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div>
      <header>
        <h1>My Portal</h1>
        {isAuthenticated ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </header>

      {isAuthenticated && (
        <PerformanceManagementWidget 
          token={token} // Optional: widget will use localStorage if not provided
        />
      )}
    </div>
  );
}
```

### HTML/JavaScript Integration (UMD)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Portal with EPM Widget</title>
  <!-- Load React and ReactDOM -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Load EPM Widget UMD bundle -->
  <script src="https://your-cdn.com/sidgs-performance.umd.js"></script>
</head>
<body>
  <div id="root"></div>
  
  <script>
    const { PerformanceManagementWidget } = SIDGSPerformance;
    const { createElement: h, useState, useEffect } = React;
    
    function MyPortal() {
      const [token, setToken] = React.useState(null);
      
      // Login handler
      async function login() {
        const response = await fetch('/api/login', { ... });
        const data = await response.json();
        
        // Store in localStorage
        localStorage.setItem('user_auth_token', data.token);
        setToken(data.token);
      }
      
      // Logout handler
      function logout() {
        localStorage.removeItem('user_auth_token');
        localStorage.removeItem('epm_user_auth_token');
        setToken(null);
      }
      
      // Check for existing token
      React.useEffect(() => {
        const stored = localStorage.getItem('user_auth_token');
        if (stored) setToken(stored);
      }, []);
      
      return h('div', null,
        h('h1', null, 'My Portal'),
        token ? 
          h('button', { onClick: logout }, 'Logout') :
          h('button', { onClick: login }, 'Login'),
        token && h(PerformanceManagementWidget, { token })
      );
    }
    
    ReactDOM.render(h(MyPortal), document.getElementById('root'));
  </script>
</body>
</html>
```

## Troubleshooting

### Widget Not Receiving Token

1. Check browser console for postMessage errors
2. Verify iframe is loaded: `iframe.contentWindow` should not be null
3. Check token format: Should be a valid JWT string
4. Verify CORS settings allow your portal domain

### Widget Shows "Authentication Required"

1. Ensure token is being sent after iframe loads
2. Check token expiration (tokens expire after 1 hour)
3. Verify token format is correct
4. Check browser console for authentication errors

### CORS Errors

1. Verify backend CORS configuration allows your portal origin
2. Check that `Access-Control-Allow-Origin` header is present
3. Ensure credentials are allowed if using cookies

## Testing Widget Mode Locally

1. Create a simple HTML file with an iframe
2. Embed the app: `http://localhost:5173/?widget=true`
3. Use browser console to send test token:
   ```javascript
   document.querySelector('iframe').contentWindow.postMessage({
     type: 'EPM_AUTH_TOKEN',
     token: 'your-test-token'
   }, '*');
   ```


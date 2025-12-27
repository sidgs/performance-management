const JWT_ENDPOINT = '/api/v1/epm/jwt';
const TOKEN_STORAGE_KEY = 'user_auth_token';
const WIDGET_TOKEN_STORAGE_KEY = 'epm_user_auth_token'; // Backup token key for widget mode

/**
 * Check if we're in development mode
 */
export function isDevMode(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
}

interface JwtRequest {
  name: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions?: string[];
}

interface JwtResponse {
  token: string;
}

interface LoginCredentials {
  name: string;
  email: string;
  roles: string[];
}

/**
 * Create a JWT token with custom credentials
 * Used by the login page
 */
export async function createAuthToken(credentials: LoginCredentials): Promise<string | null> {
  try {
    const jwtRequest: JwtRequest = {
      name: credentials.name,
      email: credentials.email,
      tenantId: 'localhost',
      roles: credentials.roles,
      permissions: [],
    };

    const response = await fetch(JWT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jwtRequest),
    });

    if (!response.ok) {
      console.error('Failed to create JWT token:', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as JwtResponse;
    
    if (data.token) {
      // Store the token for future use
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data.token;
    }

    return null;
  } catch (error) {
    console.error('Error creating JWT token:', error);
    throw error;
  }
}

/**
 * Get JWT token from Authorization header
 * Extracts Bearer token from:
 * 1. Meta tag: <meta name="authorization" content="Bearer <token>">
 * 2. Script tag: <script data-authorization="Bearer <token>">
 * 3. Global variable: window.__EPM_AUTH_TOKEN__
 * 4. Data attribute on root element: <div data-authorization="Bearer <token>">
 */
function getTokenFromAuthorizationHeader(): string | null {
  // Check global variable (set by parent app)
  if (typeof window !== 'undefined' && (window as any).__EPM_AUTH_TOKEN__) {
    const token = (window as any).__EPM_AUTH_TOKEN__;
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      return token.substring(7);
    }
    if (typeof token === 'string') {
      return token;
    }
  }

  // Check for Authorization header in meta tag
  const authMeta = document.querySelector('meta[name="authorization"]');
  if (authMeta) {
    const content = authMeta.getAttribute('content');
    if (content && content.startsWith('Bearer ')) {
      return content.substring(7); // Remove "Bearer " prefix
    }
    if (content) {
      return content; // Assume it's the token itself
    }
  }

  // Check for Authorization in script tag data attribute
  const authScript = document.querySelector('script[data-authorization]');
  if (authScript) {
    const auth = authScript.getAttribute('data-authorization');
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    if (auth) {
      return auth; // Assume it's the token itself
    }
  }

  // Check root element data attribute
  const rootElement = document.getElementById('root') || document.body;
  if (rootElement) {
    const auth = rootElement.getAttribute('data-authorization');
    if (auth && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    if (auth) {
      return auth;
    }
  }

  return null;
}

/**
 * Initialize widget mode authentication
 * Checks for user_auth_token, then Authorization header, and stores in epm_user_auth_token if needed
 */
export function initializeWidgetAuth(): void {
  // Check if user_auth_token already exists
  const primaryToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (primaryToken) {
    // Primary token exists, no need to check header
    return;
  }

  // Check Authorization header
  const headerToken = getTokenFromAuthorizationHeader();
  if (headerToken) {
    // Store in backup key (epm_user_auth_token)
    localStorage.setItem(WIDGET_TOKEN_STORAGE_KEY, headerToken);
    // Dispatch event to notify app
    window.dispatchEvent(new Event('authchange'));
  }
}

/**
 * Get or create a JWT token for the current user
 * Priority:
 * 1. user_auth_token (primary)
 * 2. epm_user_auth_token (backup for widget mode)
 * 3. Authorization header (widget mode)
 */
export async function getAuthToken(): Promise<string | null> {
  // First, check primary token (user_auth_token)
  const primaryToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (primaryToken) {
    return primaryToken;
  }

  // Second, check backup token (epm_user_auth_token) - widget mode
  const backupToken = localStorage.getItem(WIDGET_TOKEN_STORAGE_KEY);
  if (backupToken) {
    return backupToken;
  }

  // Third, check Authorization header (widget mode)
  const headerToken = getTokenFromAuthorizationHeader();
  if (headerToken) {
    // Store in backup key for future use
    localStorage.setItem(WIDGET_TOKEN_STORAGE_KEY, headerToken);
    return headerToken;
  }

  // No token found
  return null;
}

/**
 * Clear the stored JWT token
 * Clears both primary and backup tokens, plus any legacy 'token' key
 */
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(WIDGET_TOKEN_STORAGE_KEY);
  localStorage.removeItem('token'); // Clear legacy 'token' key if it exists
}

/**
 * Get the stored token without making a new request
 * Priority: user_auth_token > epm_user_auth_token
 */
export function getStoredToken(): string | null {
  // Check primary token first
  const primaryToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (primaryToken) {
    return primaryToken;
  }

  // Check backup token (widget mode)
  return localStorage.getItem(WIDGET_TOKEN_STORAGE_KEY);
}

/**
 * Check if user is authenticated (has a valid token)
 */
export function isAuthenticated(): boolean {
  return getStoredToken() !== null;
}

/**
 * Set authentication token from external source (e.g., parent portal)
 * This is used in widget mode where the parent portal handles authentication
 */
export function setAuthTokenFromParent(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    // Dispatch event to notify App component
    window.dispatchEvent(new Event('authchange'));
  }
}

/**
 * Listen for authentication tokens from parent window (for widget/iframe mode)
 * The parent portal can send tokens via postMessage
 */
export function setupParentTokenListener(): void {
  // Listen for messages from parent window
  window.addEventListener('message', (event) => {
    // Security: In production, verify event.origin
    // For now, accept from any origin (adjust for production)
    
    if (event.data && event.data.type === 'EPM_AUTH_TOKEN') {
      const token = event.data.token;
      if (token) {
        setAuthTokenFromParent(token);
      }
    }
    
    // Also support direct token in data
    if (event.data && typeof event.data === 'string' && event.data.startsWith('eyJ')) {
      // Looks like a JWT token
      setAuthTokenFromParent(event.data);
    }
  });
  
  // Request token from parent on load (if in iframe)
  if (window.self !== window.top) {
    try {
      window.parent.postMessage({ type: 'EPM_REQUEST_TOKEN' }, '*');
    } catch (e) {
      // Cross-origin - can't send message
      console.debug('Cannot request token from parent (cross-origin)');
    }
  }
}

/**
 * Get the current user's email from the JWT token
 * Returns null if token is invalid or email is not present
 */
export function getCurrentUserEmail(): string | null {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    // Note: Our JWT is unsigned (alg=none), so the signature part is empty
    const payload = parts[1];
    
    // Add padding if needed (base64url decoding)
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayload);

    // Extract email from JWT claims
    return claims.email || null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

/**
 * Get the current user's roles from the JWT token
 * Returns empty array if token is invalid or roles are not present
 */
export function getCurrentUserRoles(): string[] {
  const token = getStoredToken();
  if (!token) {
    return [];
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return [];
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayload);

    // Extract roles from JWT claims
    if (claims.roles && Array.isArray(claims.roles)) {
      return claims.roles;
    }
    return [];
  } catch (error) {
    console.error('Error parsing JWT token for roles:', error);
    return [];
  }
}

/**
 * Check if the current user has EPM_ADMIN role
 */
export function isEpmAdmin(): boolean {
  const roles = getCurrentUserRoles();
  return roles.includes('EPM_ADMIN') || roles.includes('epm_admin');
}

/**
 * Check if the current user has HR_ADMIN role
 */
export function isHrAdmin(): boolean {
  const roles = getCurrentUserRoles();
  return roles.includes('HR_ADMIN') || roles.includes('hr_admin');
}


import { getAuthToken, getCurrentUserEmail, getStoredToken } from './authService';

// Agent API base URL - can be overridden via environment variable
const AGENT_API_BASE_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8000';
const AGENT_API_PATH = '/api/v1/pulse-epm-agent';

/**
 * Extract user_id from JWT token
 * Priority: sub > user_id > username > email
 */
export function getUserIdFromToken(): string | null {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayload);

    // Extract user_id with priority: sub > user_id > username > email
    return claims.sub || claims.user_id || claims.username || claims.email || null;
  } catch (error) {
    console.error('Error parsing JWT token for user_id:', error);
    return null;
  }
}

/**
 * Get user name from JWT token
 */
export function getUserNameFromToken(): string | null {
  const token = getStoredToken();
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const claims = JSON.parse(decodedPayload);

    return claims.name || claims.username || null;
  } catch (error) {
    console.error('Error parsing JWT token for name:', error);
    return null;
  }
}

/**
 * Make an authenticated request to the agent API
 */
async function agentApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Build headers object, ensuring Authorization header is always included
  // Convert options.headers to a plain object if it's a Headers instance
  const optionsHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        optionsHeaders[key] = value;
      });
    } else if (typeof options.headers === 'object') {
      Object.assign(optionsHeaders, options.headers);
    }
  }

  // Merge headers, ensuring Authorization header is always set and cannot be overridden
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...optionsHeaders,
    'Authorization': `Bearer ${token}`, // Always set Authorization last to ensure it's never overridden
  };

  // Use relative URL when proxied (when VITE_AGENT_API_URL is not set), otherwise use full URL
  // In development, Vite proxy will handle /api/v1/pulse-epm-agent requests
  // In production or when VITE_AGENT_API_URL is explicitly set, use the full URL
  const useProxy = !import.meta.env.VITE_AGENT_API_URL;
  const url = useProxy && endpoint.startsWith('/')
    ? endpoint  // Use relative URL for Vite proxy
    : endpoint.startsWith('/')
    ? `${AGENT_API_BASE_URL}${endpoint}`  // Use full URL when VITE_AGENT_API_URL is set
    : endpoint;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('user_auth_token');
      localStorage.removeItem('epm_user_auth_token');
      window.dispatchEvent(new Event('authchange'));
      throw new Error('Authentication failed. Please log in again.');
    }
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} ${errorText || response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Session information from the API
 */
export interface SessionInfo {
  session_id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  token_expiration?: string;
  is_expired: boolean;
  interaction_count: number;
  created_at?: string;
}

/**
 * Response from listing sessions
 */
export interface SessionsListResponse {
  user_id: string;
  total_sessions: number;
  active_sessions: number;
  sessions: SessionInfo[];
}

/**
 * Response from creating a session
 */
export interface CreateSessionResponse {
  session_id: string;
  message: string;
}

/**
 * Response from chat endpoint
 */
export interface ChatResponse {
  response: string;
  agent_name?: string;
}

/**
 * Session state response
 */
export interface SessionStateResponse {
  session_id: string;
  state: {
    jwt_token?: string;
    user_email?: string;
    user_name?: string;
    interaction_history?: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp?: string;
      agent_name?: string;
    }>;
    token_expiration?: string;
    token_expires_at?: number;
  };
}

/**
 * Create a new session with the agent
 */
export async function createSession(
  userId: string,
  userEmail?: string,
  userName?: string
): Promise<CreateSessionResponse> {
  const email = userEmail || getCurrentUserEmail();
  const name = userName || getUserNameFromToken();

  return agentApiRequest<CreateSessionResponse>(
    `${AGENT_API_PATH}/sessions`,
    {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        user_email: email,
        user_name: name,
      }),
    }
  );
}

/**
 * List all active sessions for the current user
 */
export async function listSessions(): Promise<SessionsListResponse> {
  return agentApiRequest<SessionsListResponse>(
    `${AGENT_API_PATH}/sessions`,
    {
      method: 'GET',
    }
  );
}

/**
 * Get the state of a specific session
 */
export async function getSessionState(
  sessionId: string,
  userId: string
): Promise<SessionStateResponse> {
  return agentApiRequest<SessionStateResponse>(
    `${AGENT_API_PATH}/sessions/${sessionId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'GET',
    }
  );
}

/**
 * Send a chat message to the agent
 */
export async function sendChatMessage(
  sessionId: string,
  userId: string,
  message: string
): Promise<ChatResponse> {
  return agentApiRequest<ChatResponse>(
    `${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
      }),
    }
  );
}

/**
 * Send a chat message with file attachment to the agent
 */
export async function sendChatMessageWithFile(
  sessionId: string,
  userId: string,
  message: string,
  file: File
): Promise<ChatResponse> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  // Create FormData for multipart/form-data
  const formData = new FormData();
  formData.append('message', message || '');
  formData.append('file', file);

  // Use relative URL when proxied (when VITE_AGENT_API_URL is not set), otherwise use full URL
  const useProxy = !import.meta.env.VITE_AGENT_API_URL;
  const url = useProxy && `${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`.startsWith('/')
    ? `${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`  // Use relative URL for Vite proxy
    : `${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`.startsWith('/')
    ? `${AGENT_API_BASE_URL}${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`  // Use full URL when VITE_AGENT_API_URL is set
    : `${AGENT_API_PATH}/chat/${sessionId}?user_id=${encodeURIComponent(userId)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('user_auth_token');
      localStorage.removeItem('epm_user_auth_token');
      window.dispatchEvent(new Event('authchange'));
      throw new Error('Authentication failed. Please log in again.');
    }
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a session
 */
export async function deleteSession(
  sessionId: string,
  userId: string
): Promise<{ message: string; session_id: string }> {
  return agentApiRequest<{ message: string; session_id: string }>(
    `${AGENT_API_PATH}/sessions/${sessionId}?user_id=${encodeURIComponent(userId)}`,
    {
      method: 'DELETE',
    }
  );
}


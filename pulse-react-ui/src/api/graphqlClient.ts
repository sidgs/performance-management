import { getAuthToken } from './authService';

const GRAPHQL_ENDPOINT = '/api/v1/epm/graphql';

interface GraphQLError {
  message: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  // Get authentication token
  const token = await getAuthToken();
  
  // If no token, user needs to log in
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Add tenant header if needed by backend TenantResolver
    'X-Tenant-Id': '1',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    // If we get a 401 or 403, clear the tokens and dispatch event for App.tsx to handle redirect
    if (response.status === 401 || response.status === 403) {
      // Clear both primary and backup tokens
      localStorage.removeItem('user_auth_token');
      localStorage.removeItem('epm_user_auth_token');
      // Dispatch custom event to notify App.tsx that authentication state changed
      window.dispatchEvent(new Event('authchange'));
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GraphQLResponse<T>;

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((e) => e.message).join(', '));
  }

  if (!json.data) {
    throw new Error('No data returned from GraphQL API');
  }

  return json.data;
}



import { getAuthToken } from './authService';
import { Territory } from '../types';
import { graphqlRequest } from './graphqlClient';

const API_BASE_URL = '/api/v1/epm';

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

export async function getAllTerritories(): Promise<Territory[]> {
  const query = `
    query {
      territories {
        id
        name
        description
      }
    }
  `;
  const response = await graphqlRequest<{ territories: Territory[] }>(query);
  return response.territories;
}

export async function getTerritoryById(id: string): Promise<Territory> {
  const query = `
    query GetTerritory($id: ID!) {
      territory(id: $id) {
        id
        name
        description
      }
    }
  `;
  const response = await graphqlRequest<{ territory: Territory }>(query, { id });
  return response.territory;
}

export async function createTerritory(territory: { name: string; description?: string }): Promise<Territory> {
  const mutation = `
    mutation CreateTerritory($input: TerritoryInput!) {
      createTerritory(input: $input) {
        id
        name
        description
      }
    }
  `;
  const variables = {
    input: {
      name: territory.name,
      description: territory.description || null,
    },
  };
  const response = await graphqlRequest<{ createTerritory: Territory }>(mutation, variables);
  return response.createTerritory;
}

export async function updateTerritory(id: string, territory: { name: string; description?: string }): Promise<Territory> {
  const mutation = `
    mutation UpdateTerritory($id: ID!, $input: TerritoryInput!) {
      updateTerritory(id: $id, input: $input) {
        id
        name
        description
      }
    }
  `;
  const variables = {
    id,
    input: {
      name: territory.name,
      description: territory.description || null,
    },
  };
  const response = await graphqlRequest<{ updateTerritory: Territory }>(mutation, variables);
  return response.updateTerritory;
}

export async function deleteTerritory(id: string): Promise<boolean> {
  const mutation = `
    mutation DeleteTerritory($id: ID!) {
      deleteTerritory(id: $id)
    }
  `;
  const response = await graphqlRequest<{ deleteTerritory: boolean }>(mutation, { id });
  return response.deleteTerritory;
}


import { Territory } from '../types';
import { graphqlRequest } from './graphqlClient';

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


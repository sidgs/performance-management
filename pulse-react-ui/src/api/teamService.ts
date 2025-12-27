import { getAuthToken } from './authService';
import { Team, User } from '../types';

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

interface TeamDTO {
  id: number;
  name: string;
  description?: string;
  departmentId: number;
  departmentName: string;
  teamLeadId: number;
  teamLeadEmail: string;
  teamLeadName: string;
  userIds?: number[];
  userCount?: number;
}

function mapTeamDTO(dto: TeamDTO, department?: any, teamLead?: User, users?: User[]): Team {
  return {
    id: dto.id.toString(),
    name: dto.name,
    description: dto.description,
    department: department || { id: dto.departmentId.toString(), name: dto.departmentName } as any,
    teamLead: teamLead || { id: dto.teamLeadId.toString(), email: dto.teamLeadEmail, firstName: dto.teamLeadName.split(' ')[0] || '', lastName: dto.teamLeadName.split(' ').slice(1).join(' ') || '' } as User,
    users: users || [],
  } as Team;
}

export async function getAllTeams(): Promise<Team[]> {
  const teams = await apiRequest<TeamDTO[]>('/teams');
  // For now, return basic mapping. In a full implementation, you'd fetch related entities
  return teams.map(dto => mapTeamDTO(dto));
}

export async function getTeamById(id: string): Promise<Team> {
  const team = await apiRequest<TeamDTO>(`/teams/${id}`);
  return mapTeamDTO(team);
}

export async function getTeamsByDepartment(departmentId: string): Promise<Team[]> {
  const teams = await apiRequest<TeamDTO[]>(`/teams/department/${departmentId}`);
  return teams.map(dto => mapTeamDTO(dto));
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  departmentId: number;
  teamLeadEmail: string;
}

export async function createTeam(teamData: CreateTeamRequest): Promise<Team> {
  const teamDTO: TeamDTO = await apiRequest<TeamDTO>('/teams', {
    method: 'POST',
    body: JSON.stringify({
      name: teamData.name,
      description: teamData.description,
      departmentId: teamData.departmentId,
      teamLeadEmail: teamData.teamLeadEmail,
    }),
  });
  
  return mapTeamDTO(teamDTO);
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  teamLeadEmail?: string;
}

export async function updateTeam(id: string, teamData: UpdateTeamRequest): Promise<Team> {
  const teamDTO: TeamDTO = await apiRequest<TeamDTO>(`/teams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teamData),
  });
  
  return mapTeamDTO(teamDTO);
}

export async function deleteTeam(id: string): Promise<void> {
  return apiRequest<void>(`/teams/${id}`, {
    method: 'DELETE',
  });
}

export async function assignUserToTeam(teamId: string, userEmail: string): Promise<Team> {
  const teamDTO: TeamDTO = await apiRequest<TeamDTO>(`/teams/${teamId}/assign/${encodeURIComponent(userEmail)}`, {
    method: 'POST',
  });
  
  return mapTeamDTO(teamDTO);
}

export async function removeUserFromTeam(teamId: string, userEmail: string): Promise<Team> {
  const teamDTO: TeamDTO = await apiRequest<TeamDTO>(`/teams/${teamId}/remove/${encodeURIComponent(userEmail)}`, {
    method: 'POST',
  });
  
  return mapTeamDTO(teamDTO);
}


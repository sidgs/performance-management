import { getAuthToken } from './authService';
import { Goal } from '../types';

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

export async function approveGoal(goalId: string): Promise<Goal> {
  return apiRequest<Goal>(`/goals/${goalId}/approve`, {
    method: 'POST',
  });
}

export async function getGoalsPendingApproval(departmentId: string): Promise<Goal[]> {
  return apiRequest<Goal[]>(`/goals/pending-approval?departmentId=${departmentId}`);
}

export async function getDepartmentMembersGoals(departmentId: string): Promise<Goal[]> {
  return apiRequest<Goal[]>(`/goals/department/${departmentId}/members`);
}


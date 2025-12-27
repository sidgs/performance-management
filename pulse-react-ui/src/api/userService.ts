import { getAuthToken } from './authService';
import { User } from '../types';

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

interface UserDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  role?: string;
  departmentId?: number;
  managerId?: number;
}

function mapUserDTO(dto: UserDTO): User {
  return {
    id: dto.id?.toString() || '',
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    title: dto.title || '',
    role: dto.role,
  } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const users = await apiRequest<UserDTO[]>('/users');
  return users.map(mapUserDTO);
}

export async function getUserById(id: string): Promise<User> {
  const user = await apiRequest<UserDTO>(`/users/${id}`);
  return mapUserDTO(user);
}

export async function getUserByEmail(email: string): Promise<User> {
  const user = await apiRequest<UserDTO>(`/users/email/${encodeURIComponent(email)}`);
  return mapUserDTO(user);
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  title?: string;
  role?: string;
  departmentId?: number;
  managerId?: number;
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  const userDTO: UserDTO = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    title: userData.title,
    role: userData.role,
    departmentId: userData.departmentId,
    managerId: userData.managerId,
  };
  
  const created = await apiRequest<UserDTO>('/users', {
    method: 'POST',
    body: JSON.stringify(userDTO),
  });
  
  return mapUserDTO(created);
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  role?: string;
  departmentId?: number;
  managerId?: number;
}

export async function updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
  const userDTO: UserDTO = {
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    title: userData.title,
    role: userData.role,
    departmentId: userData.departmentId,
    managerId: userData.managerId,
  };
  
  const updated = await apiRequest<UserDTO>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userDTO),
  });
  
  return mapUserDTO(updated);
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}


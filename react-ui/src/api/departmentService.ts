import { getAuthToken } from './authService';
import { Department, User } from '../types';

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

// Helper functions to convert DTO fields to User objects
function createUserFromNameAndEmail(email?: string, name?: string): User | undefined {
  if (!email || !name) {
    return undefined;
  }
  // Parse "FirstName LastName" into firstName and lastName
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: '', // ID not available from DTO
    firstName,
    lastName,
    email,
    title: undefined,
  } as User;
}

function mapDepartmentDTO(dept: any): Department {
  return {
    ...dept,
    id: String(dept.id),
    manager: createUserFromNameAndEmail(dept.managerEmail, dept.managerName),
    managerAssistant: createUserFromNameAndEmail(dept.managerAssistantEmail, dept.managerAssistantName),
    coOwner: createUserFromNameAndEmail(dept.coOwnerEmail, dept.coOwnerName),
    childDepartments: dept.childDepartments || [],
    users: dept.users || [],
  } as Department;
}

export async function getAllDepartments(): Promise<Department[]> {
  const departments = await apiRequest<any[]>('/departments');
  
  // Map parentDepartmentId to parentDepartment object
  return departments.map(dept => {
    const parentDept = dept.parentDepartmentId 
      ? departments.find(d => d.id === dept.parentDepartmentId)
      : null;
    
    const mappedDept = mapDepartmentDTO(dept);
    
    return {
      ...mappedDept,
      parentDepartment: parentDept ? {
        ...mapDepartmentDTO(parentDept),
        childDepartments: [],
        users: [],
      } : undefined,
    } as Department;
  });
}

export async function getDepartmentById(id: string): Promise<Department> {
  const dept = await apiRequest<any>(`/departments/${id}`);
  const mappedDept = mapDepartmentDTO(dept);
  
  return {
    ...mappedDept,
    parentDepartment: dept.parentDepartmentId ? {
      id: String(dept.parentDepartmentId),
      name: '',
      smallDescription: '',
      creationDate: '',
      status: dept.status,
      childDepartments: [],
      users: [],
    } : undefined,
  } as Department;
}

export async function getRootDepartments(): Promise<Department[]> {
  return apiRequest<Department[]>('/departments/root');
}

export async function createDepartment(department: {
  name: string;
  smallDescription: string;
  managerEmail?: string;
  managerAssistantEmail?: string;
  coOwnerEmail?: string;
  creationDate?: string;
  status?: string;
  parentDepartmentId?: number;
}): Promise<Department> {
  return apiRequest<Department>('/departments', {
    method: 'POST',
    body: JSON.stringify(department),
  });
}

export async function updateDepartment(
  id: string,
  department: {
    name?: string;
    smallDescription?: string;
    managerAssistantEmail?: string;
    coOwnerEmail?: string;
    status?: string;
    parentDepartmentId?: number;
  }
): Promise<Department> {
  return apiRequest<Department>(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(department),
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  return apiRequest<void>(`/departments/${id}`, {
    method: 'DELETE',
  });
}

export async function assignUserToDepartment(
  departmentId: string,
  userEmail: string
): Promise<Department> {
  return apiRequest<Department>(`/departments/${departmentId}/assign/${userEmail}`, {
    method: 'POST',
  });
}

export async function getDepartmentsManagedByMe(): Promise<Department[]> {
  return apiRequest<Department[]>('/departments/managed-by-me');
}

export async function setDepartmentManager(
  departmentId: string,
  userEmail: string
): Promise<Department> {
  return apiRequest<Department>(`/departments/${departmentId}/set-manager/${userEmail}`, {
    method: 'POST',
  });
}

export async function assignManagerAssistant(
  departmentId: string,
  userEmail: string
): Promise<Department> {
  return apiRequest<Department>(`/departments/${departmentId}/assign-assistant/${userEmail}`, {
    method: 'POST',
  });
}

export async function moveUserToDepartment(
  userId: string,
  departmentId: string
): Promise<Department> {
  return apiRequest<Department>(`/departments/${departmentId}/move-user/${userId}`, {
    method: 'POST',
  });
}

export async function getDepartmentMembers(departmentId: string): Promise<User[]> {
  return apiRequest<User[]>(`/departments/${departmentId}/members`);
}

export async function getEligibleManagersForDepartment(departmentId: string): Promise<User[]> {
  return apiRequest<User[]>(`/departments/${departmentId}/eligible-managers`);
}


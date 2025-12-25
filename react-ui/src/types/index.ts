export type GoalStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'ACHIEVED' | 'RETIRED';
export type DepartmentStatus = 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department?: Department;
  manager?: User;
  teamMembers?: User[];
}

export interface Goal {
  id: string;
  shortDescription: string;
  longDescription: string;
  owner: User;
  creationDate: string;
  completionDate?: string;
  assignedDate?: string;
  targetCompletionDate?: string;
  status: GoalStatus;
  parentGoal?: Goal;
  childGoals: Goal[];
  assignedUsers: User[];
  locked: boolean;
  kpis: KPI[];
}

export interface KPI {
  id: string;
  description: string;
  status: KPIStatus;
  completionPercentage: number;
  dueDate: string;
  goal: Goal;
}

export enum KPIStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  ACHIEVED = 'ACHIEVED',
  NOT_ACHIEVED = 'NOT_ACHIEVED',
  COMPLETED = 'COMPLETED',
}

export interface Department {
  id: string;
  name: string;
  smallDescription: string;
  manager: User;
  managerAssistant?: User;
  coOwner?: User;
  creationDate: string;
  status: DepartmentStatus;
  parentDepartment?: Department;
  childDepartments: Department[];
  users: User[];
}

// Component Props Types
export interface HomePageProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export interface GoalsPageProps {
  initialGoals?: Goal[];
  onGoalSelect?: (goal: Goal) => void;
}
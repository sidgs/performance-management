export type GoalStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'ACHIEVED' | 'RETIRED';
export type DepartmentStatus = 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department?: Department;
  manager?: User;
}

export interface Goal {
  id: string;
  shortDescription: string;
  longDescription: string;
  owner: User;
  creationDate: string;
  completionDate?: string;
  status: GoalStatus;
  parentGoal?: Goal;
  childGoals: Goal[];
  assignedUsers: User[];
}

export interface Department {
  id: string;
  name: string;
  smallDescription: string;
  owner: User;
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
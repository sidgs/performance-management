import { default as default_2 } from 'react';
import { JSX as JSX_2 } from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { Theme } from '@mui/material';

export declare function App(): JSX_2.Element;

export declare const Breadcrumbs: default_2.FC;

export declare interface Department {
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

declare type DepartmentStatus = 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

export declare const Footer: default_2.FC;

export declare interface Goal {
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

export declare const GoalsPage: default_2.FC;

export declare type GoalStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'ACHIEVED' | 'RETIRED';

export declare const Header: default_2.FC<HeaderProps>;

declare interface HeaderProps {
    onSearchChange?: (query: string) => void;
}

export declare const HomePage: default_2.FC;

export declare const Layout: default_2.FC<LayoutProps>;

declare interface LayoutProps {
    children: ReactNode;
}

export declare const SideNavigation: default_2.FC;

declare const SIDGSPerformanceApp: default_2.FC;
export { SIDGSPerformanceApp }
export default SIDGSPerformanceApp;

export declare const sidgsTheme: Theme;

export declare interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    department?: Department;
    manager?: User;
}

export { }

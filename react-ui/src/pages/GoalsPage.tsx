import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  //SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Avatar,
  Tooltip,
  Checkbox,
  FormGroup,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  //Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Visibility as VisibilityIcon,
  //CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

import { graphqlRequest } from '../api/graphqlClient';
import { getCurrentUserEmail } from '../api/authService';
import { approveGoal } from '../api/goalService';
import type { Goal, GoalStatus, User, KPI, KPIStatus } from '../types';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editLongDesc, setEditLongDesc] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editStatus, setEditStatus] = useState<GoalStatus>('DRAFT');
  const [editCompletionDate, setEditCompletionDate] = useState('');
  const [editConfidential, setEditConfidential] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Current user and team members
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  
  // Create goal dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedParentGoal, setSelectedParentGoal] = useState<string>('root');
  const [newGoalShortDesc, setNewGoalShortDesc] = useState('');
  const [newGoalLongDesc, setNewGoalLongDesc] = useState('');
  const [newGoalOwnerEmail, setNewGoalOwnerEmail] = useState('');
  const [newGoalStatus, setNewGoalStatus] = useState<GoalStatus>('DRAFT');
  const [newGoalConfidential, setNewGoalConfidential] = useState(false);
  const [newGoalAssignedUsers, setNewGoalAssignedUsers] = useState<string[]>([]);
  const [createGoalLoading, setCreateGoalLoading] = useState(false);
  const [createGoalError, setCreateGoalError] = useState<string | null>(null);
  
  // Assignment dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigningGoal, setAssigningGoal] = useState<Goal | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  
  // Lock/unlock state
  const [lockLoading, setLockLoading] = useState<string | null>(null);
  
  // Approval state
  const [approvingGoalId, setApprovingGoalId] = useState<string | null>(null);

  // KPI management state
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [kpiGoalId, setKpiGoalId] = useState<string | null>(null);
  const [kpiDescription, setKpiDescription] = useState('');
  const [kpiStatus, setKpiStatus] = useState<KPIStatus>('NOT_STARTED');
  const [kpiCompletionPercentage, setKpiCompletionPercentage] = useState<number>(0);
  const [kpiDueDate, setKpiDueDate] = useState('');
  const [kpiLoading, setKpiLoading] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [deleteKpiDialogOpen, setDeleteKpiDialogOpen] = useState(false);
  const [deletingKpiId, setDeletingKpiId] = useState<string | null>(null);
  const [deleteKpiLoading, setDeleteKpiLoading] = useState(false);

  // Load goals and users from GraphQL API
  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await graphqlRequest<{ goals: Goal[]; users: User[] }>(
          `
            query GetGoalsAndUsers {
              goals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                locked
                confidential
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
                childGoals {
                  id
                  shortDescription
                  longDescription
                  creationDate
                  completionDate
                  status
                  locked
                  owner {
                    id
                    firstName
                    lastName
                    email
                    title
                  }
                }
                assignedUsers {
                  id
                  firstName
                  lastName
                  email
                  title
                }
                kpis {
                  id
                  description
                  status
                  completionPercentage
                  dueDate
                }
              }
              users {
                id
                firstName
                lastName
                email
                title
              }
            }
          `,
        );

        setGoals(data.goals ?? []);
        setUsers(data.users ?? []);
        
        // Fetch current user and team members
        const currentUserEmail = getCurrentUserEmail();
        if (currentUserEmail) {
          try {
            const userData = await graphqlRequest<{ userByEmail: User }>(
              `
                query GetCurrentUser($email: String!) {
                  userByEmail(email: $email) {
                    id
                    firstName
                    lastName
                    email
                    title
                    department {
                      id
                      name
                      users {
                        id
                        firstName
                        lastName
                        email
                        title
                      }
                    }
                    teamMembers {
                      id
                      firstName
                      lastName
                      email
                      title
                    }
                  }
                }
              `,
              { email: currentUserEmail }
            );
            
            if (userData.userByEmail) {
              setCurrentUser(userData.userByEmail);
              setTeamMembers(userData.userByEmail.teamMembers || []);
            }
          } catch (err) {
            // Silently fail - user might not exist yet
            console.error('Failed to fetch current user:', err);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = 
      goal.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.longDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesOwner = filterOwner === 'all' || goal.owner.id === filterOwner;

    return matchesSearch && matchesStatus && matchesOwner;
  });

  // Get unique statuses for filter
  const statuses: GoalStatus[] = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ACHIEVED', 'RETIRED'];

  // Status configuration
  const statusConfig = {
    PENDING_APPROVAL: { label: 'Pending Approval', color: 'warning' as const, icon: <PendingIcon /> },
    DRAFT: { label: 'Draft', color: 'default' as const, icon: <DraftIcon /> },
    APPROVED: { label: 'Approved', color: 'info' as const, icon: <CheckCircleIcon /> },
    PUBLISHED: { label: 'Published', color: 'primary' as const, icon: <PublishedIcon /> },
    ACHIEVED: { label: 'Achieved', color: 'success' as const, icon: <CheckCircleIcon /> },
    RETIRED: { label: 'Retired', color: 'warning' as const, icon: <PendingIcon /> },
  };

  // KPI Status configuration
  const kpiStatusConfig = {
    NOT_STARTED: { label: 'Not Started', color: 'default' as const },
    IN_PROGRESS: { label: 'In Progress', color: 'primary' as const },
    ACHIEVED: { label: 'Achieved', color: 'success' as const },
    NOT_ACHIEVED: { label: 'Not Achieved', color: 'error' as const },
    COMPLETED: { label: 'Completed', color: 'success' as const },
  };

  // Toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  // Handle view details
  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setOpenDialog(true);
  };

  // Handle edit goal
  const handleEditGoal = (goal: Goal) => {
    if (goal.locked) {
      const currentUserEmail = getCurrentUserEmail();
      if (goal.owner.email !== currentUserEmail) {
        setError('This goal is locked. Only the owner can unlock and edit it.');
        return;
      }
      // Owner can edit locked goals, but show a warning
      setEditError('This goal is locked. You can unlock it to make changes.');
    }
    
    setEditingGoal(goal);
    setEditShortDesc(goal.shortDescription);
    setEditLongDesc(goal.longDescription);
    setEditOwnerEmail(goal.owner.email);
    setEditStatus(goal.status);
    setEditCompletionDate(goal.completionDate || '');
    setEditConfidential(goal.confidential || false);
    setEditError(null);
    setEditDialogOpen(true);
  };

  // Handle save edited goal
  const handleSaveEdit = async () => {
    if (!editingGoal) return;
    
    if (!editShortDesc.trim() || !editLongDesc.trim() || !editOwnerEmail) {
      setEditError('Short description, long description, and owner are required.');
      return;
    }

    // Check if goal is locked
    if (editingGoal.locked) {
      const currentUserEmail = getCurrentUserEmail();
      if (editingGoal.owner.email !== currentUserEmail) {
        setEditError('This goal is locked. Only the owner can unlock and edit it.');
        setEditLoading(false);
        return;
      }
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const data = await graphqlRequest<{ updateGoal: Goal }>(
        `
          mutation UpdateGoal($id: ID!, $input: GoalInput!) {
            updateGoal(id: $id, input: $input) {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              locked
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                status
                locked
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
              kpis {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          }
        `,
        {
          id: editingGoal.id,
          input: {
            shortDescription: editShortDesc.trim(),
            longDescription: editLongDesc.trim(),
            ownerEmail: editOwnerEmail,
            status: editStatus,
            completionDate: editCompletionDate || null,
            parentGoalId: editingGoal.parentGoal?.id || null,
            confidential: editConfidential,
          },
        }
      );

      // Refresh goals list to get updated data including locked status
      const refreshData = await graphqlRequest<{ goals: Goal[] }>(
        `
          query GetGoals {
            goals {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              locked
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                locked
                confidential
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
              kpis {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          }
        `
      );
      
      setGoals(refreshData.goals ?? []);
      
      setEditDialogOpen(false);
      setEditingGoal(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete goal
  const handleDeleteGoal = (goalId: string) => {
    setDeletingGoalId(goalId);
    setDeleteDialogOpen(true);
  };

  // Handle approve goal
  const handleApproveGoal = async (goalId: string) => {
    setApprovingGoalId(goalId);
    setLoading(true);
    setError(null);
    try {
      await approveGoal(goalId);
      // Refresh goals
      const refreshData = await graphqlRequest<{ goals: Goal[] }>(
        `
          query GetGoals {
            goals {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              locked
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                status
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
              kpis {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          }
        `
      );
      setGoals(refreshData.goals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve goal');
    } finally {
      setLoading(false);
      setApprovingGoalId(null);
    }
  };

  // Confirm delete goal
  const handleConfirmDelete = async () => {
    if (!deletingGoalId) return;

    setDeleteLoading(true);
    try {
      const data = await graphqlRequest<{ deleteGoal: boolean }>(
        `
          mutation DeleteGoal($id: ID!) {
            deleteGoal(id: $id)
          }
        `,
        { id: deletingGoalId }
      );

      if (data.deleteGoal) {
        // Remove the goal from local state
        setGoals(goals.filter(goal => goal.id !== deletingGoalId));
        setDeleteDialogOpen(false);
        setDeletingGoalId(null);
      } else {
        setError('Failed to delete goal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle create goal dialog
  const handleOpenCreateDialog = () => {
    if (users.length === 0) {
      setCreateGoalError('No users available. Please wait for users to load or create a user first.');
      return;
    }
    
    // Get the logged-in user's email from JWT token
    const currentUserEmail = getCurrentUserEmail();
    
    // Try to find the logged-in user in the users list, otherwise use first user
    let defaultOwnerEmail = users[0].email;
    if (currentUserEmail) {
      const currentUser = users.find(user => user.email.toLowerCase() === currentUserEmail.toLowerCase());
      if (currentUser) {
        defaultOwnerEmail = currentUser.email;
      }
    }
    
    setSelectedParentGoal('root');
    setNewGoalShortDesc('');
    setNewGoalLongDesc('');
    setNewGoalOwnerEmail(defaultOwnerEmail);
    setNewGoalStatus('DRAFT');
    setNewGoalConfidential(false);
    setNewGoalAssignedUsers([]);
    setCreateGoalError(null);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateGoalError(null);
  };

  // Handle create goal mutation
  const handleCreateGoal = async () => {
    if (!newGoalShortDesc.trim() || !newGoalLongDesc.trim() || !newGoalOwnerEmail.trim()) {
      setCreateGoalError('Please fill in all required fields');
      return;
    }

    setCreateGoalLoading(true);
    setCreateGoalError(null);

    try {
      const mutation = `
        mutation CreateGoal($input: GoalInput!) {
          createGoal(input: $input) {
            id
            shortDescription
            longDescription
            creationDate
            completionDate
            status
            owner {
              id
              firstName
              lastName
              email
              title
            }
            parentGoal {
              id
            }
            childGoals {
              id
              status
            }
            assignedUsers {
              id
              firstName
              lastName
              email
              title
            }
            kpis {
              id
              description
              status
              completionPercentage
              dueDate
            }
          }
        }
      `;

      const variables = {
          input: {
            shortDescription: newGoalShortDesc.trim(),
            longDescription: newGoalLongDesc.trim(),
            ownerEmail: newGoalOwnerEmail.trim(),
            status: newGoalStatus,
            parentGoalId: selectedParentGoal && selectedParentGoal !== 'root' ? selectedParentGoal : null,
            confidential: newGoalConfidential,
          },
      };

      const createResult = await graphqlRequest<{ createGoal: Goal }>(mutation, variables);
      
      // Assign users to the goal if any were selected
      if (newGoalAssignedUsers.length > 0 && createResult.createGoal) {
        for (const userEmail of newGoalAssignedUsers) {
          try {
            await graphqlRequest<{ assignGoalToUser: Goal }>(
              `
                mutation AssignGoalToUser($goalId: ID!, $userEmail: String!) {
                  assignGoalToUser(goalId: $goalId, userEmail: $userEmail) {
                    id
                  }
                }
              `,
              { goalId: createResult.createGoal.id, userEmail }
            );
          } catch (err) {
            console.error(`Failed to assign goal to ${userEmail}:`, err);
          }
        }
      }
      
      // Refresh goals list
      const refreshData = await graphqlRequest<{ goals: Goal[]; users: User[] }>(
        `
          query GetGoalsAndUsers {
            goals {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              locked
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                locked
                confidential
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
              kpis {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
            users {
              id
              firstName
              lastName
              email
              title
            }
          }
        `,
      );

      setGoals(refreshData.goals ?? []);
      setUsers(refreshData.users ?? []);
      
      handleCloseCreateDialog();
    } catch (err) {
      setCreateGoalError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setCreateGoalLoading(false);
    }
  };

  // Get assignable users (self + team members)
  const getAssignableUsers = (): User[] => {
    const assignable: User[] = [];
    
    // Add current user
    if (currentUser) {
      assignable.push(currentUser);
    }
    
    // Add department members
    if (currentUser?.department?.users) {
      currentUser.department.users.forEach(member => {
        if (!assignable.find(u => u.email === member.email)) {
          assignable.push(member);
        }
      });
    }
    
    return assignable;
  };

  // Get filterable owners (current user + department members)
  const getFilterableOwners = (): User[] => {
    const filterable: User[] = [];
    
    // Add current user
    if (currentUser) {
      filterable.push(currentUser);
    }
    
    // Add department members
    if (currentUser?.department?.users) {
      currentUser.department.users.forEach(user => {
        if (!filterable.find(u => u.id === user.id)) {
          filterable.push(user);
        }
      });
    }
    
    return filterable;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate progress based on child goals
  const calculateProgress = (goal: Goal): number => {
    if (goal.childGoals.length === 0) {
      return goal.status === 'ACHIEVED' ? 100 : 
             goal.status === 'RETIRED' ? 0 : 
             goal.status === 'DRAFT' ? 10 :
             goal.status === 'APPROVED' ? 30 : 60;
    }
    
    const completedChildren = goal.childGoals.filter(child => child.status === 'ACHIEVED').length;
    return Math.round((completedChildren / goal.childGoals.length) * 100);
  };

  // Handle create/update KPI
  const handleSaveKPI = async () => {
    if (!kpiGoalId || !kpiDescription.trim() || !kpiDueDate) {
      setKpiError('Description and due date are required.');
      return;
    }

    setKpiLoading(true);
    setKpiError(null);

    try {
      if (editingKpi) {
        // Update existing KPI
        await graphqlRequest<{ updateKPI: KPI }>(
          `
            mutation UpdateKPI($id: ID!, $input: KPIUpdateInput!) {
              updateKPI(id: $id, input: $input) {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          `,
          {
            id: editingKpi.id,
            input: {
              description: kpiDescription.trim(),
              status: kpiStatus,
              completionPercentage: kpiCompletionPercentage,
              dueDate: kpiDueDate,
            },
          }
        );
      } else {
        // Create new KPI
        await graphqlRequest<{ createKPI: KPI }>(
          `
            mutation CreateKPI($goalId: ID!, $input: KPIInput!) {
              createKPI(goalId: $goalId, input: $input) {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          `,
          {
            goalId: kpiGoalId,
            input: {
              description: kpiDescription.trim(),
              status: kpiStatus,
              completionPercentage: kpiCompletionPercentage,
              dueDate: kpiDueDate,
            },
          }
        );
      }

      // Refresh goals to get updated KPIs
      const refreshData = await graphqlRequest<{ goals: Goal[] }>(
        `
          query GetGoals {
            goals {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              locked
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                locked
                confidential
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
              kpis {
                id
                description
                status
                completionPercentage
                dueDate
              }
            }
          }
        `
      );

      setGoals(refreshData.goals ?? []);
      
      // Update selectedGoal if it's the one we just modified
      if (selectedGoal && selectedGoal.id === kpiGoalId) {
        const updatedGoal = refreshData.goals?.find(g => g.id === kpiGoalId);
        if (updatedGoal) {
          setSelectedGoal(updatedGoal);
        }
      }

      setKpiDialogOpen(false);
      setEditingKpi(null);
      setKpiDescription('');
      setKpiStatus('NOT_STARTED');
      setKpiCompletionPercentage(0);
      setKpiDueDate('');
    } catch (err) {
      setKpiError(err instanceof Error ? err.message : 'Failed to save KPI');
    } finally {
      setKpiLoading(false);
    }
  };

  // Handle delete KPI
  const handleConfirmDeleteKPI = async () => {
    if (!deletingKpiId) return;

    setDeleteKpiLoading(true);
    try {
      const result = await graphqlRequest<{ deleteKPI: boolean }>(
        `
          mutation DeleteKPI($id: ID!) {
            deleteKPI(id: $id)
          }
        `,
        { id: deletingKpiId }
      );

      if (result.deleteKPI) {
        // Refresh goals to get updated KPIs
        const refreshData = await graphqlRequest<{ goals: Goal[] }>(
          `
            query GetGoals {
              goals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                locked
                confidential
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
                childGoals {
                  id
                  shortDescription
                  longDescription
                  creationDate
                  completionDate
                  status
                  locked
                  owner {
                    id
                    firstName
                    lastName
                    email
                    title
                  }
                }
                assignedUsers {
                  id
                  firstName
                  lastName
                  email
                  title
                }
                kpis {
                  id
                  description
                  status
                  completionPercentage
                  dueDate
                }
              }
            }
          `
        );

        setGoals(refreshData.goals ?? []);
        
        // Update selectedGoal if it's the one we just modified
        if (selectedGoal) {
          const updatedGoal = refreshData.goals?.find(g => g.id === selectedGoal.id);
          if (updatedGoal) {
            setSelectedGoal(updatedGoal);
          }
        }

        setDeleteKpiDialogOpen(false);
        setDeletingKpiId(null);
      } else {
        setKpiError('Failed to delete KPI');
      }
    } catch (err) {
      setKpiError(err instanceof Error ? err.message : 'Failed to delete KPI');
    } finally {
      setDeleteKpiLoading(false);
    }
  };

  // Custom Avatar Group Component
  const CustomAvatarGroup = ({ users, max = 3 }: { users: User[], max?: number }) => {
    const displayUsers = users.slice(0, max);
    const extraCount = users.length - max;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {displayUsers.map((user, index) => (
          <Tooltip key={user.id} title={`${user.firstName} ${user.lastName}`}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                border: '2px solid white',
                marginLeft: index > 0 ? '-8px' : 0,
                zIndex: displayUsers.length - index,
              }}
            >
              {user.firstName[0]}
            </Avatar>
          </Tooltip>
        ))}
        {extraCount > 0 && (
          <Tooltip title={`${extraCount} more user${extraCount !== 1 ? 's' : ''}`}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'grey.400',
                marginLeft: '-8px',
                fontSize: '0.75rem',
              }}
            >
              +{extraCount}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    );
  };

  // Render goal hierarchy recursively
  const renderGoalHierarchy = (goal: Goal, level: number = 0) => {
    const progress = calculateProgress(goal);
    const hasChildren = goal.childGoals.length > 0;
    
    return (
      <Box key={goal.id}>
        <Card sx={{ mb: 1, ml: level * 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {hasChildren && (
                  <IconButton size="small" onClick={() => toggleGoalExpansion(goal.id)}>
                    {expandedGoals.has(goal.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {goal.shortDescription}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={statusConfig[goal.status].label}
                      color={statusConfig[goal.status].color}
                      icon={statusConfig[goal.status].icon}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Owner: {goal.owner.firstName} {goal.owner.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(goal.creationDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {goal.locked && (
                  <Tooltip title="Goal is locked">
                    <LockIcon fontSize="small" color="action" />
                  </Tooltip>
                )}
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => handleViewDetails(goal)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={goal.locked ? "Unlock to edit" : "Edit"}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditGoal(goal)} 
                    color="primary"
                    disabled={goal.locked && goal.owner.email !== getCurrentUserEmail()}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={goal.locked ? "Unlock Goal" : "Lock Goal"}>
                  <IconButton
                    size="small"
                    onClick={() => goal.locked ? handleUnlockGoal(goal.id) : handleLockGoal(goal.id)}
                    color={goal.locked ? "warning" : "default"}
                    disabled={lockLoading === goal.id || (goal.locked && goal.owner.email !== getCurrentUserEmail())}
                  >
                    {goal.locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Assign to Department Member">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setAssigningGoal(goal);
                      setAssignDialogOpen(true);
                      setAssignError(null);
                    }}
                    color="secondary"
                    disabled={goal.locked}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
                {goal.status === 'PENDING_APPROVAL' && (
                  <Tooltip title="Approve Goal">
                    <IconButton
                      size="small"
                      onClick={() => handleApproveGoal(goal.id)}
                      color="success"
                      disabled={approvingGoalId === goal.id || loading}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Delete">
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteGoal(goal.id)} 
                    color="error"
                    disabled={goal.locked}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {goal.longDescription}
            </Typography>

            {/* Progress and assigned users */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">Progress</Typography>
                    {goal.kpis && goal.kpis.length > 0 && (
                      <Tooltip title={`${goal.kpis.length} KPI${goal.kpis.length !== 1 ? 's' : ''}`}>
                        <Chip
                          label={`${goal.kpis.length} KPI${goal.kpis.length !== 1 ? 's' : ''}`}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={500}>{progress}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress === 100 ? 'success.main' : 
                                     progress >= 70 ? 'primary.main' : 'warning.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <CustomAvatarGroup users={goal.assignedUsers} max={3} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Child goals */}
        {hasChildren && expandedGoals.has(goal.id) && (
          <Box sx={{ ml: 4 }}>
            {goal.childGoals.map(childGoal => renderGoalHierarchy(childGoal, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  // Render goals in list view
  const renderGoalList = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Goal Description</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>KPIs</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Child Goals</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGoals.map((goal) => (
            <React.Fragment key={goal.id}>
              <TableRow>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {goal.shortDescription}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.longDescription.substring(0, 100)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {goal.owner.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {goal.owner.firstName} {goal.owner.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {goal.owner.title}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusConfig[goal.status].label}
                    color={statusConfig[goal.status].color}
                    icon={statusConfig[goal.status].icon}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {goal.kpis && goal.kpis.length > 0 ? (
                    <Tooltip title={`${goal.kpis.length} KPI${goal.kpis.length !== 1 ? 's' : ''} - Click to view details`}>
                      <Chip
                        label={`${goal.kpis.length} KPI${goal.kpis.length !== 1 ? 's' : ''}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewDetails(goal)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      None
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(goal.creationDate)}
                </TableCell>
                <TableCell>
                  <CustomAvatarGroup users={goal.assignedUsers} max={3} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${goal.childGoals.length} child${goal.childGoals.length !== 1 ? 'ren' : ''}`}
                    variant="outlined"
                    size="small"
                    onClick={() => toggleGoalExpansion(goal.id)}
                    icon={expandedGoals.has(goal.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {goal.locked && (
                      <Tooltip title="Goal is locked">
                        <LockIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(goal)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={goal.locked ? "Unlock to edit" : "Edit"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditGoal(goal)} 
                        color="primary"
                        disabled={goal.locked && goal.owner.email !== getCurrentUserEmail()}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={goal.locked ? "Unlock Goal" : "Lock Goal"}>
                      <IconButton
                        size="small"
                        onClick={() => goal.locked ? handleUnlockGoal(goal.id) : handleLockGoal(goal.id)}
                        color={goal.locked ? "warning" : "default"}
                        disabled={lockLoading === goal.id || (goal.locked && goal.owner.email !== getCurrentUserEmail())}
                      >
                        {goal.locked ? <LockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Assign to Department Member">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setAssigningGoal(goal);
                          setAssignDialogOpen(true);
                          setAssignError(null);
                        }}
                        color="secondary"
                        disabled={goal.locked}
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                    {goal.status === 'PENDING_APPROVAL' && (
                      <Tooltip title="Approve Goal">
                        <IconButton
                          size="small"
                          onClick={() => handleApproveGoal(goal.id)}
                          color="success"
                          disabled={approvingGoalId === goal.id || loading}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteGoal(goal.id)} 
                        color="error"
                        disabled={goal.locked}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
              
              {/* Child goals in table */}
              {goal.childGoals.length > 0 && expandedGoals.has(goal.id) && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ backgroundColor: 'grey.50', py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Child Goals
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {goal.childGoals.map(childGoal => (
                        <Card key={childGoal.id} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {childGoal.shortDescription}
                                </Typography>
                                <Chip
                                  label={statusConfig[childGoal.status].label}
                                  color={statusConfig[childGoal.status].color}
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Owner: {childGoal.owner.firstName} {childGoal.owner.lastName}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Goals Management
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Define, track, and manage organizational goals with hierarchical structure.
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Goals
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {goals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All statuses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Published
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {goals.filter(g => g.status === 'PUBLISHED').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Achieved
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {goals.filter(g => g.status === 'ACHIEVED').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Draft
              </Typography>
              <Typography variant="h3" fontWeight={700} color="default">
                {goals.filter(g => g.status === 'DRAFT').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hierarchical
              </Typography>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {goals.filter(g => g.childGoals.length > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                With child goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusConfig[status].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Owner</InputLabel>
                <Select
                  value={filterOwner}
                  label="Owner"
                  onChange={(e) => setFilterOwner(e.target.value)}
                >
                  <MenuItem value="all">All Owners</MenuItem>
                  {getFilterableOwners().map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'list' ? 'hierarchy' : 'list')}
                startIcon={viewMode === 'list' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              >
                {viewMode === 'list' ? 'Hierarchy View' : 'List View'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleOpenCreateDialog}
                startIcon={<AddIcon fontSize="small" />}
                size="small"
              >
                Add Goal
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Goals Display */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No goals found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterOwner('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {viewMode === 'list' ? (
            renderGoalList()
          ) : (
            <Box>
              {filteredGoals.map(goal => renderGoalHierarchy(goal))}
            </Box>
          )}
        </Box>
      )}

      {/* Goal Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedGoal && (
          <>
            <DialogTitle>
              <Typography variant="h5" component="div">
                {selectedGoal.shortDescription}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedGoal.id}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Status:</strong></Typography>
                      <Chip
                        label={statusConfig[selectedGoal.status].label}
                        color={statusConfig[selectedGoal.status].color}
                        icon={statusConfig[selectedGoal.status].icon}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Created:</strong> {formatDate(selectedGoal.creationDate)}</Typography>
                    </Grid>
                    {selectedGoal.completionDate && (
                      <Grid item xs={6}>
                        <Typography variant="body2"><strong>Completed:</strong> {formatDate(selectedGoal.completionDate)}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Child Goals:</strong> {selectedGoal.childGoals.length}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedGoal.longDescription}</Typography>
                </Box>

                {/* Owner Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Goal Owner
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                          {selectedGoal.owner.firstName[0]}{selectedGoal.owner.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedGoal.owner.firstName} {selectedGoal.owner.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedGoal.owner.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedGoal.owner.email}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Assigned Users */}
                {selectedGoal.assignedUsers.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned Users ({selectedGoal.assignedUsers.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedGoal.assignedUsers.map((user) => (
                        <Grid item xs={12} sm={6} key={user.id}>
                          <Card variant="outlined">
                            <CardContent sx={{ py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
                                  {user.firstName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.title}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Child Goals */}
                {selectedGoal.childGoals.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Child Goals ({selectedGoal.childGoals.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Owner</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedGoal.childGoals.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell>{child.shortDescription}</TableCell>
                              <TableCell>
                                <Chip
                                  label={statusConfig[child.status].label}
                                  color={statusConfig[child.status].color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {child.owner.firstName} {child.owner.lastName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* KPIs */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Key Performance Indicators ({selectedGoal.kpis?.length || 0})
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setEditingKpi(null);
                        setKpiGoalId(selectedGoal.id);
                        setKpiDescription('');
                        setKpiStatus('NOT_STARTED');
                        setKpiCompletionPercentage(0);
                        setKpiDueDate('');
                        setKpiError(null);
                        setKpiDialogOpen(true);
                      }}
                    >
                      Add KPI
                    </Button>
                  </Box>
                  {selectedGoal.kpis && selectedGoal.kpis.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Progress</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedGoal.kpis.map((kpi) => (
                            <TableRow key={kpi.id}>
                              <TableCell>{kpi.description}</TableCell>
                              <TableCell>
                                <Chip
                                  label={kpiStatusConfig[kpi.status as KPIStatus]?.label || kpi.status}
                                  color={kpiStatusConfig[kpi.status as KPIStatus]?.color || 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={kpi.completionPercentage}
                                    sx={{
                                      flex: 1,
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: 'grey.200',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: kpi.completionPercentage === 100 ? 'success.main' : 
                                                       kpi.completionPercentage >= 70 ? 'primary.main' : 'warning.main',
                                      },
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ minWidth: 35 }}>
                                    {kpi.completionPercentage}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{formatDate(kpi.dueDate)}</TableCell>
                              <TableCell align="right">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                  <Tooltip title="Edit KPI">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEditingKpi(kpi);
                                        setKpiGoalId(selectedGoal.id);
                                        setKpiDescription(kpi.description);
                                        setKpiStatus(kpi.status as KPIStatus);
                                        setKpiCompletionPercentage(kpi.completionPercentage);
                                        setKpiDueDate(kpi.dueDate.split('T')[0]);
                                        setKpiError(null);
                                        setKpiDialogOpen(true);
                                      }}
                                      color="primary"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete KPI">
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setDeletingKpiId(kpi.id);
                                        setDeleteKpiDialogOpen(true);
                                      }}
                                      color="error"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                      No KPIs defined for this goal
                    </Typography>
                  )}
                </Box>

              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setOpenDialog(false);
                  handleEditGoal(selectedGoal);
                }}
                startIcon={<EditIcon />}
              >
                Edit Goal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingGoal(null);
          setEditError(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {editError && (
              <Alert severity="error">{editError}</Alert>
            )}

            <TextField
              fullWidth
              label="Short Description"
              value={editShortDesc}
              onChange={(e) => setEditShortDesc(e.target.value)}
              required
              placeholder="e.g., Improve code quality standards"
            />

            <TextField
              fullWidth
              label="Long Description"
              value={editLongDesc}
              onChange={(e) => setEditLongDesc(e.target.value)}
              required
              multiline
              rows={4}
              placeholder="Provide a detailed description of the goal..."
            />

            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                value={editOwnerEmail}
                label="Owner"
                onChange={(e) => setEditOwnerEmail(e.target.value)}
                required
                error={!editOwnerEmail}
              >
                {getFilterableOwners().map((user) => (
                  <MenuItem key={user.id} value={user.email}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={editConfidential}
                  onChange={(e) => setEditConfidential(e.target.checked)}
                />
              }
              label="Confidential Goal"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editStatus || 'DRAFT'}
                label="Status"
                onChange={(e) => setEditStatus(e.target.value as GoalStatus)}
              >
                {(() => {
                  // Check if goal has child goals in PUBLISHED or APPROVED state
                  const hasPublishedOrApprovedChildren = editingGoal && 
                    (editingGoal.status === 'PUBLISHED' || editingGoal.status === 'APPROVED') &&
                    editingGoal.childGoals && 
                    editingGoal.childGoals.some(child => 
                      child.status === 'PUBLISHED' || child.status === 'APPROVED'
                    );
                  
                  return (
                    <>
                      <MenuItem 
                        value="DRAFT"
                        disabled={!!hasPublishedOrApprovedChildren}
                      >
                        Draft
                        {hasPublishedOrApprovedChildren && ' (Cannot change: has published/approved child goals)'}
                      </MenuItem>
                      <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                      <MenuItem value="APPROVED">Approved</MenuItem>
                      <MenuItem value="PUBLISHED">Published</MenuItem>
                      <MenuItem value="ACHIEVED">Achieved</MenuItem>
                      <MenuItem 
                        value="ARCHIVED"
                        disabled={!!hasPublishedOrApprovedChildren}
                      >
                        Archived
                        {hasPublishedOrApprovedChildren && ' (Cannot change: has published/approved child goals)'}
                      </MenuItem>
                      <MenuItem 
                        value="RETIRED"
                        disabled={!!hasPublishedOrApprovedChildren}
                      >
                        Retired
                        {hasPublishedOrApprovedChildren && ' (Cannot change: has published/approved child goals)'}
                      </MenuItem>
                    </>
                  );
                })()}
              </Select>
              {editingGoal && (editingGoal.status === 'PUBLISHED' || editingGoal.status === 'APPROVED') && 
               editingGoal.childGoals && editingGoal.childGoals.some(child => 
                 child.status === 'PUBLISHED' || child.status === 'APPROVED'
               ) && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                  Note: This goal has child goals in PUBLISHED or APPROVED state. 
                  You cannot change this goal's status to DRAFT or RETIRED until the child goals' statuses are changed first.
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Completion Date (optional)"
              type="date"
              value={editCompletionDate}
              onChange={(e) => setEditCompletionDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialogOpen(false);
              setEditingGoal(null);
              setEditError(null);
            }}
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disabled={editLoading}
            startIcon={<EditIcon />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingGoalId(null);
        }}
      >
        <DialogTitle>Delete Goal</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this goal? This action cannot be undone.
            {deletingGoalId && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Goal ID: {deletingGoalId}
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletingGoalId(null);
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={<DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Goal Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {createGoalError && (
              <Alert severity="error">{createGoalError}</Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Parent Goal</InputLabel>
              <Select
                value={selectedParentGoal}
                label="Parent Goal"
                onChange={(e) => setSelectedParentGoal(e.target.value)}
              >
                <MenuItem value="root">Root (Standalone Goal)</MenuItem>
                {goals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.shortDescription}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Short Description"
              value={newGoalShortDesc}
              onChange={(e) => setNewGoalShortDesc(e.target.value)}
              required
              placeholder="e.g., Improve code quality standards"
            />

            <TextField
              fullWidth
              label="Long Description"
              value={newGoalLongDesc}
              onChange={(e) => setNewGoalLongDesc(e.target.value)}
              required
              multiline
              rows={4}
              placeholder="Provide a detailed description of the goal..."
            />

            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                value={newGoalOwnerEmail}
                label="Owner"
                onChange={(e) => setNewGoalOwnerEmail(e.target.value)}
                required
                error={!newGoalOwnerEmail}
              >
                {getFilterableOwners().length === 0 ? (
                  <MenuItem disabled value="">
                    No users available
                  </MenuItem>
                ) : (
                  getFilterableOwners().map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
                )}
              </Select>
              {getFilterableOwners().length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  No users found. Please create a user first.
                </Typography>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={newGoalConfidential}
                  onChange={(e) => setNewGoalConfidential(e.target.checked)}
                />
              }
              label="Confidential Goal"
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newGoalStatus}
                label="Status"
                onChange={(e) => setNewGoalStatus(e.target.value as GoalStatus)}
              >
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="ACHIEVED">Achieved</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
                <MenuItem value="RETIRED">Retired</MenuItem>
              </Select>
            </FormControl>

            {/* Assign to Team Members */}
            {getAssignableUsers().length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Assign to Department Members (optional)</InputLabel>
                <Select
                  multiple
                  value={newGoalAssignedUsers}
                  label="Assign to Department Members (optional)"
                  onChange={(e) => setNewGoalAssignedUsers(e.target.value as string[])}
                  renderValue={(selected) => {
                    const selectedUsers = getAssignableUsers().filter(u => 
                      (selected as string[]).includes(u.email)
                    );
                    return selectedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ');
                  }}
                >
                  {getAssignableUsers().map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      <Checkbox checked={newGoalAssignedUsers.indexOf(user.email) > -1} />
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  You can only assign goals to yourself or members of your department.
                </Typography>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createGoalLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateGoal}
            variant="contained"
            disabled={createGoalLoading}
            startIcon={<AddIcon />}
          >
            {createGoalLoading ? 'Creating...' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Goal Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setAssigningGoal(null);
          setAssignError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Goal: {assigningGoal?.shortDescription}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {assignError && <Alert severity="error">{assignError}</Alert>}

            {assigningGoal && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Currently assigned to:
                </Typography>
                {assigningGoal.assignedUsers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No users assigned
                  </Typography>
                ) : (
                  <List dense>
                    {assigningGoal.assignedUsers.map((user) => (
                      <ListItem key={user.id}>
                        <ListItemText
                          primary={`${user.firstName} ${user.lastName}`}
                          secondary={user.email}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleUnassignGoal(assigningGoal.id, user.email)}
                            disabled={assignLoading}
                          >
                            <PersonRemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <FormControl fullWidth>
                  <InputLabel>Assign to Department Member</InputLabel>
                  <Select
                    value=""
                    label="Assign to Department Member"
                    onChange={(e) => {
                      const userEmail = e.target.value as string;
                      if (userEmail && !assigningGoal.assignedUsers.some(u => u.email === userEmail)) {
                        handleAssignGoal(assigningGoal.id, userEmail);
                      }
                    }}
                  >
                    {getAssignableUsers()
                      .filter(user => !assigningGoal.assignedUsers.some(au => au.email === user.email))
                      .map((user) => (
                        <MenuItem key={user.id} value={user.email}>
                          {user.firstName} {user.lastName} ({user.email})
                        </MenuItem>
                      ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    You can only assign goals to yourself or members of your department.
                  </Typography>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAssignDialogOpen(false);
              setAssigningGoal(null);
              setAssignError(null);
            }}
            disabled={assignLoading}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit KPI Dialog */}
      <Dialog
        open={kpiDialogOpen}
        onClose={() => {
          setKpiDialogOpen(false);
          setEditingKpi(null);
          setKpiError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingKpi ? 'Edit KPI' : 'Create KPI'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {kpiError && (
              <Alert severity="error">{kpiError}</Alert>
            )}

            <TextField
              fullWidth
              label="Description"
              value={kpiDescription}
              onChange={(e) => setKpiDescription(e.target.value)}
              required
              multiline
              rows={3}
              placeholder="Enter KPI description..."
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={kpiStatus}
                label="Status"
                onChange={(e) => setKpiStatus(e.target.value as KPIStatus)}
              >
                <MenuItem value="NOT_STARTED">Not Started</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="ACHIEVED">Achieved</MenuItem>
                <MenuItem value="NOT_ACHIEVED">Not Achieved</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Completion Percentage"
              type="number"
              value={kpiCompletionPercentage}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setKpiCompletionPercentage(Math.min(100, Math.max(0, value)));
              }}
              inputProps={{ min: 0, max: 100 }}
              helperText="Enter a value between 0 and 100"
            />

            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={kpiDueDate}
              onChange={(e) => setKpiDueDate(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setKpiDialogOpen(false);
              setEditingKpi(null);
              setKpiError(null);
            }}
            disabled={kpiLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveKPI}
            variant="contained"
            disabled={kpiLoading}
            startIcon={editingKpi ? <EditIcon /> : <AddIcon />}
          >
            {kpiLoading ? 'Saving...' : (editingKpi ? 'Update KPI' : 'Create KPI')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete KPI Confirmation Dialog */}
      <Dialog
        open={deleteKpiDialogOpen}
        onClose={() => {
          setDeleteKpiDialogOpen(false);
          setDeletingKpiId(null);
        }}
      >
        <DialogTitle>Delete KPI</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this KPI? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteKpiDialogOpen(false);
              setDeletingKpiId(null);
            }}
            disabled={deleteKpiLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteKPI}
            variant="contained"
            color="error"
            disabled={deleteKpiLoading}
            startIcon={<DeleteIcon />}
          >
            {deleteKpiLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoalsPage;
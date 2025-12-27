import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignUserToDepartment,
  setDepartmentManager,
  moveUserToDepartment,
  getDepartmentMembers,
  getEligibleManagersForDepartment,
} from '../api/departmentService';
import { createUser, getAllUsers as getAllUsersAPI, updateUser } from '../api/userService';
import {
  getAllTeams,
  getTeamById,
  getTeamsByDepartment,
  createTeam,
  updateTeam,
  deleteTeam,
  assignUserToTeam,
  removeUserFromTeam,
} from '../api/teamService';
import { graphqlRequest } from '../api/graphqlClient';
import { isHrAdmin } from '../api/authService';
import { Department, User, Team } from '../types';

const HRAdminPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<User[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [editDepartmentDialogOpen, setEditDepartmentDialogOpen] = useState(false);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [moveUserDialogOpen, setMoveUserDialogOpen] = useState(false);
  const [setManagerDialogOpen, setSetManagerDialogOpen] = useState(false);
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [assignUserToTeamDialogOpen, setAssignUserToTeamDialogOpen] = useState(false);

  // Form states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDescription, setNewDeptDescription] = useState('');
  const [newDeptManagerEmail, setNewDeptManagerEmail] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedMoveUserId, setSelectedMoveUserId] = useState('');
  const [selectedMoveDeptId, setSelectedMoveDeptId] = useState('');
  
  // User onboarding form states
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('USER');
  const [newUserDepartmentId, setNewUserDepartmentId] = useState<string>('');
  const [newUserManagerId, setNewUserManagerId] = useState<string>('');
  const [newUserTeamId, setNewUserTeamId] = useState<string>('');

  // Team form states
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamDepartmentId, setNewTeamDepartmentId] = useState<string>('');
  const [newTeamLeadEmail, setNewTeamLeadEmail] = useState('');
  const [selectedTeamUserEmail, setSelectedTeamUserEmail] = useState('');

  // Edit form states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editUserFirstName, setEditUserFirstName] = useState('');
  const [editUserLastName, setEditUserLastName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserTitle, setEditUserTitle] = useState('');
  const [editUserRole, setEditUserRole] = useState<string>('USER');
  const [editUserDepartmentId, setEditUserDepartmentId] = useState<string>('');
  const [editUserManagerId, setEditUserManagerId] = useState<string>('');
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptDescription, setEditDeptDescription] = useState('');
  const [editDeptParentId, setEditDeptParentId] = useState<string>('');
  const [editDeptStatus, setEditDeptStatus] = useState<string>('ACTIVE');
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamDescription, setEditTeamDescription] = useState('');
  const [editTeamLeadEmail, setEditTeamLeadEmail] = useState('');

  useEffect(() => {
    if (!isHrAdmin()) {
      setError('Access denied. HR_ADMIN role required.');
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:128',message:'selectedTab changed',data:{selectedTab,departmentsCount:departments.length,hasSelectedDept:!!selectedDepartment,willRenderAllDepts:selectedTab===2,willRenderDeptDetails:selectedTab===3&&!!selectedDepartment},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (selectedTab === 2) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:132',message:'Tab 2 (All Departments) should render',data:{selectedTab:2,departmentsCount:departments.length,departments:departments.map(d=>({id:d.id,name:d.name}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    }
    if (selectedTab === 3 && selectedDepartment) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:136',message:'Tab 3 (Department Details) should render',data:{selectedTab:3,selectedDeptId:selectedDepartment.id,selectedDeptName:selectedDepartment.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
    }
  }, [selectedTab, departments.length, selectedDepartment]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:129',message:'loadData entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const [deptsData, usersData, teamsData] = await Promise.all([
        getAllDepartments(),
        getAllUsersAPI(),
        getAllTeams(),
      ]);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:137',message:'loadData after fetch',data:{deptsCount:deptsData.length,usersCount:usersData.length,teamsCount:teamsData.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setDepartments(deptsData);
      setUsers(usersData);
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentMembers = async (deptId: string) => {
    try {
      const members = await getDepartmentMembers(deptId);
      setDepartmentMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load department members');
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDeptName.trim() || !newDeptDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createDepartment({
        name: newDeptName,
        smallDescription: newDeptDescription,
        managerEmail: newDeptManagerEmail.trim() || undefined,
        parentDepartmentId: newDeptParentId ? Number(newDeptParentId) : undefined,
      });
      await loadData();
      setCreateDialogOpen(false);
      setNewDeptName('');
      setNewDeptDescription('');
      setNewDeptManagerEmail('');
      setNewDeptParentId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to build hierarchical department list for dropdown
  // Returns departments in a flat list with visual hierarchy indicators
  const buildDepartmentHierarchy = (depts: Department[], excludeId?: string): Department[] => {
    const result: Department[] = [];
    const deptMap = new Map<string, Department>();
    const childrenMap = new Map<string, Department[]>();
    
    // Build maps
    depts.forEach(dept => {
      if (dept.id !== excludeId) {
        deptMap.set(dept.id, dept);
        if (dept.parentDepartment) {
          const parentId = dept.parentDepartment.id;
          if (!childrenMap.has(parentId)) {
            childrenMap.set(parentId, []);
          }
          childrenMap.get(parentId)!.push(dept);
        }
      }
    });
    
    // Recursive function to add departments in hierarchical order
    const addDepartment = (dept: Department, level: number) => {
      result.push(dept);
      const children = childrenMap.get(dept.id) || [];
      children.forEach(child => addDepartment(child, level + 1));
    };
    
    // Start with root departments (no parent)
    depts.forEach(dept => {
      if (!dept.parentDepartment && dept.id !== excludeId) {
        addDepartment(dept, 0);
      }
    });
    
    return result;
  };
  
  // Helper function to get display name with hierarchy indicator
  const getDepartmentDisplayName = (dept: Department, allDepts: Department[]): string => {
    if (!dept.parentDepartment) {
      return dept.name;
    }
    // Count depth
    let depth = 0;
    let current: Department | undefined = dept;
    while (current?.parentDepartment) {
      depth++;
      current = allDepts.find(d => d.id === current.parentDepartment?.id);
    }
    const indent = '  '.repeat(depth);
    return `${indent}└─ ${dept.name}`;
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteDepartment(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedDepartment || !selectedUserEmail) {
      setError('Please select a department and user');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await assignUserToDepartment(selectedDepartment.id, selectedUserEmail);
      await loadDepartmentMembers(selectedDepartment.id);
      setAssignUserDialogOpen(false);
      setSelectedUserEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign user');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUser = async () => {
    if (!selectedMoveUserId || !selectedMoveDeptId) {
      setError('Please select a user and destination department');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await moveUserToDepartment(selectedMoveUserId, selectedMoveDeptId);
      await loadData();
      if (selectedDepartment) {
        await loadDepartmentMembers(selectedDepartment.id);
      }
      setMoveUserDialogOpen(false);
      setSelectedMoveUserId('');
      setSelectedMoveDeptId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move user');
    } finally {
      setLoading(false);
    }
  };

  const handleSetManager = async () => {
    if (!selectedDepartment || !selectedUserEmail) {
      setError('Please select a department and manager');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setDepartmentManager(selectedDepartment.id, selectedUserEmail);
      await loadData();
      // Refresh the selected department to show the updated manager
      const updatedDept = await getDepartmentById(selectedDepartment.id);
      setSelectedDepartment(updatedDept);
      setSetManagerDialogOpen(false);
      setSelectedUserEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set manager');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUserFirstName.trim() || !newUserLastName.trim() || !newUserEmail.trim()) {
      setError('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createUser({
        firstName: newUserFirstName.trim(),
        lastName: newUserLastName.trim(),
        email: newUserEmail.trim(),
        title: newUserTitle.trim() || undefined,
        role: newUserRole || undefined,
        departmentId: newUserDepartmentId ? Number(newUserDepartmentId) : undefined,
        managerId: newUserManagerId ? Number(newUserManagerId) : undefined,
      });
      
      // Assign to team if selected
      if (newUserTeamId) {
        try {
          await assignUserToTeam(newUserTeamId, newUserEmail.trim());
        } catch (teamErr) {
          console.error('Failed to assign user to team:', teamErr);
          // Don't fail the whole operation if team assignment fails
        }
      }
      
      await loadData();
      setCreateUserDialogOpen(false);
      // Reset form
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserTitle('');
      setNewUserRole('USER');
      setNewUserDepartmentId('');
      setNewUserManagerId('');
      setNewUserTeamId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const team = await getTeamById(teamId);
      setTeamMembers(team.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || !newTeamDepartmentId || !newTeamLeadEmail.trim()) {
      setError('Please fill in all required fields (Name, Department, Team Lead)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
        departmentId: Number(newTeamDepartmentId),
        teamLeadEmail: newTeamLeadEmail.trim(),
      });
      await loadData();
      setCreateTeamDialogOpen(false);
      // Reset form
      setNewTeamName('');
      setNewTeamDescription('');
      setNewTeamDepartmentId('');
      setNewTeamLeadEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team? All users will be unassigned from the team.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteTeam(id);
      await loadData();
      if (selectedTeam?.id === id) {
        setSelectedTeam(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUserToTeam = async () => {
    if (!selectedTeam || !selectedTeamUserEmail) {
      setError('Please select a team and user');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await assignUserToTeam(selectedTeam.id, selectedTeamUserEmail);
      await loadTeamMembers(selectedTeam.id);
      setAssignUserToTeamDialogOpen(false);
      setSelectedTeamUserEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign user to team');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserFromTeam = async (teamId: string, userEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeUserFromTeam(teamId, userEmail);
      if (selectedTeam?.id === teamId) {
        await loadTeamMembers(teamId);
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from team');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserFirstName(user.firstName);
    setEditUserLastName(user.lastName);
    setEditUserEmail(user.email);
    setEditUserTitle(user.title || '');
    setEditUserRole(user.role || 'USER');
    setEditUserDepartmentId(user.department?.id || '');
    setEditUserManagerId(user.manager?.id || '');
    setEditUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !editUserFirstName.trim() || !editUserLastName.trim() || !editUserEmail.trim()) {
      setError('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateUser(editingUser.id, {
        firstName: editUserFirstName.trim(),
        lastName: editUserLastName.trim(),
        email: editUserEmail.trim(),
        title: editUserTitle.trim() || undefined,
        role: editUserRole || undefined,
        departmentId: editUserDepartmentId ? Number(editUserDepartmentId) : undefined,
        managerId: editUserManagerId ? Number(editUserManagerId) : undefined,
      });
      await loadData();
      setEditUserDialogOpen(false);
      setEditingUser(null);
      // Reset form
      setEditUserFirstName('');
      setEditUserLastName('');
      setEditUserEmail('');
      setEditUserTitle('');
      setEditUserRole('USER');
      setEditUserDepartmentId('');
      setEditUserManagerId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDepartment(dept);
    setEditDeptName(dept.name);
    setEditDeptDescription(dept.smallDescription);
    setEditDeptParentId(dept.parentDepartment?.id || '');
    setEditDeptStatus(dept.status || 'ACTIVE');
    setEditDepartmentDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment || !editDeptName.trim() || !editDeptDescription.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateDepartment(editingDepartment.id, {
        name: editDeptName.trim(),
        smallDescription: editDeptDescription.trim(),
        parentDepartmentId: editDeptParentId ? Number(editDeptParentId) : undefined,
        status: editDeptStatus,
      });
      await loadData();
      if (selectedDepartment?.id === editingDepartment.id) {
        const updated = await getDepartmentById(editingDepartment.id);
        setSelectedDepartment(updated);
      }
      setEditDepartmentDialogOpen(false);
      setEditingDepartment(null);
      // Reset form
      setEditDeptName('');
      setEditDeptDescription('');
      setEditDeptParentId('');
      setEditDeptStatus('ACTIVE');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamDescription(team.description || '');
    setEditTeamLeadEmail(team.teamLead.email);
    setEditTeamDialogOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !editTeamName.trim() || !editTeamLeadEmail.trim()) {
      setError('Please fill in all required fields (Name, Team Lead)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateTeam(editingTeam.id, {
        name: editTeamName.trim(),
        description: editTeamDescription.trim() || undefined,
        teamLeadEmail: editTeamLeadEmail.trim(),
      });
      await loadData();
      if (selectedTeam?.id === editingTeam.id) {
        const updated = await getTeamById(editingTeam.id);
        setSelectedTeam(updated);
        await loadTeamMembers(editingTeam.id);
      }
      setEditTeamDialogOpen(false);
      setEditingTeam(null);
      // Reset form
      setEditTeamName('');
      setEditTeamDescription('');
      setEditTeamLeadEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setLoading(false);
    }
  };

  if (!isHrAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. HR_ADMIN role required.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          HR Admin
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setCreateUserDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Onboard User
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Department
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={selectedTab} onChange={(_, newValue) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:510',message:'Tab change',data:{oldTab:selectedTab,newTab:newValue,departmentsCount:departments.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setSelectedTab(newValue);
      }} sx={{ mb: 2 }}>
        <Tab label="User Management" icon={<PeopleIcon />} />
        <Tab label="Team Management" icon={<PeopleIcon />} />
        <Tab label="All Departments" icon={<BusinessIcon />} />
        <Tab label="Department Details" icon={<BusinessIcon />} />
      </Tabs>

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {selectedTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.title || 'N/A'}</TableCell>
                  <TableCell>{user.department?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role || 'USER'} 
                      size="small" 
                      color={user.role === 'EPM_ADMIN' || user.role === 'HR_ADMIN' ? 'primary' : 'default'} 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedTab === 1 && !selectedTeam && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateTeamDialogOpen(true)}
            >
              Create Team
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Team Lead</TableCell>
                  <TableCell>Members</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teams.map((team) => (
                  <TableRow
                    key={team.id}
                    hover
                    onClick={() => {
                      setSelectedTeam(team);
                      loadTeamMembers(team.id);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.department.name}</TableCell>
                    <TableCell>
                      {team.teamLead.firstName} {team.teamLead.lastName}
                    </TableCell>
                    <TableCell>{team.users?.length || 0}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditTeam(team)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {selectedTab === 1 && selectedTeam && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{selectedTeam.name}</Typography>
              <Button
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setAssignUserToTeamDialogOpen(true)}
              >
                Add Member
              </Button>
            </Box>
            {selectedTeam.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedTeam.description}
              </Typography>
            )}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Department: {selectedTeam.department.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Team Lead: {selectedTeam.teamLead.firstName} {selectedTeam.teamLead.lastName} ({selectedTeam.teamLead.email})
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Team Members ({teamMembers.length})
            </Typography>
            <List>
              {teamMembers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={() => handleRemoveUserFromTeam(selectedTeam.id, user.email)}
                    >
                      <PersonRemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {selectedTab === 2 && (
        <>
          {/* #region agent log */}
          {(() => { 
            fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:858',message:'Rendering All Departments tab',data:{selectedTab:2,departmentsCount:departments.length,departments:departments.map(d=>d.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{}); 
            return null; 
          })()}
          {/* #endregion */}
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Debug: Tab 2 active, {departments.length} departments loaded
          </Typography>
          {departments.length === 0 ? (
            <Card>
              <CardContent>
                <Typography>No departments found.</Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Parent Department</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(() => {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:885',message:'Rendering departments table body',data:{departmentsCount:departments.length,departments:departments.map(d=>({id:d.id,name:d.name}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                    // #endregion
                    return null;
                  })()}
                  {departments.map((dept) => (
                <TableRow
                  key={dept.id}
                  hover
                  onClick={() => {
                    // #region agent log
                    fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:872',message:'Department row clicked',data:{deptId:dept.id,deptName:dept.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                    // #endregion
                    setSelectedDepartment(dept);
                    setSelectedTab(3);
                    loadDepartmentMembers(dept.id);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.smallDescription}</TableCell>
                  <TableCell>
                    {dept.parentDepartment ? dept.parentDepartment.name : <em>Root Department</em>}
                  </TableCell>
                  <TableCell>
                    {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip label={dept.status} size="small" color={dept.status === 'ACTIVE' ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell>{dept.users?.length || 0}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditDepartment(dept)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDepartment(dept.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {selectedTab === 3 && selectedDepartment && (
        <>
          {/* #region agent log */}
          {(() => { fetch('http://127.0.0.1:7243/ingest/60ac4750-15ef-4ef4-ab7a-abf2ce117b9d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HRAdminPage.tsx:948',message:'Rendering Department Details tab',data:{selectedTab:3,hasSelectedDept:!!selectedDepartment,deptName:selectedDepartment?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{}); return null; })()}
          {/* #endregion */}
          <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">{selectedDepartment.name}</Typography>
              <Box>
                <Button
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setAssignUserDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Add User
                </Button>
                <Button
                  size="small"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => setMoveUserDialogOpen(true)}
                  sx={{ mr: 1 }}
                >
                  Move User
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={async () => {
                    if (selectedDepartment) {
                      try {
                        const eligible = await getEligibleManagersForDepartment(selectedDepartment.id);
                        setEligibleManagers(eligible);
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to load eligible managers');
                      }
                    }
                    setSetManagerDialogOpen(true);
                  }}
                >
                  Set Manager
                </Button>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selectedDepartment.smallDescription}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Parent Department: {selectedDepartment.parentDepartment ? selectedDepartment.parentDepartment.name : <em>Root Department</em>}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Manager: {selectedDepartment.manager ? `${selectedDepartment.manager.firstName} ${selectedDepartment.manager.lastName}` : 'N/A'}
            </Typography>
            {selectedDepartment.managerAssistant && (
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Assistant: {selectedDepartment.managerAssistant.firstName} {selectedDepartment.managerAssistant.lastName}
              </Typography>
            )}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Department Members ({departmentMembers.length})
            </Typography>
            <List>
              {departmentMembers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.email}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
        </>
      )}

      {/* Create Department Dialog */}
      <Dialog open={createDialogOpen} onClose={() => {
        setCreateDialogOpen(false);
        setNewDeptName('');
        setNewDeptDescription('');
        setNewDeptManagerEmail('');
        setNewDeptParentId('');
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newDeptDescription}
            onChange={(e) => setNewDeptDescription(e.target.value)}
            margin="normal"
            required
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Parent Department (Optional)</InputLabel>
            <Select
              value={newDeptParentId}
              onChange={(e) => setNewDeptParentId(e.target.value)}
              label="Parent Department (Optional)"
            >
              <MenuItem value="">
                <em>None (Root Department)</em>
              </MenuItem>
              {buildDepartmentHierarchy(departments).map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {getDepartmentDisplayName(dept, departments)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Manager (Optional)</InputLabel>
            <Select
              value={newDeptManagerEmail}
              onChange={(e) => setNewDeptManagerEmail(e.target.value)}
              label="Manager (Optional)"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.email}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setNewDeptName('');
            setNewDeptDescription('');
            setNewDeptManagerEmail('');
            setNewDeptParentId('');
          }}>Cancel</Button>
          <Button onClick={handleCreateDepartment} variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={assignUserDialogOpen} onClose={() => setAssignUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User to Department</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedUserEmail}
              onChange={(e) => setSelectedUserEmail(e.target.value)}
              label="User"
            >
              {users
                .filter((u) => !u.department) // Only show users not linked to any department
                .map((user) => (
                  <MenuItem key={user.id} value={user.email}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignUser} variant="contained" disabled={loading}>
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move User Dialog */}
      <Dialog open={moveUserDialogOpen} onClose={() => setMoveUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Move User to Department</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedMoveUserId}
              onChange={(e) => setSelectedMoveUserId(e.target.value)}
              label="User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Destination Department</InputLabel>
            <Select
              value={selectedMoveDeptId}
              onChange={(e) => setSelectedMoveDeptId(e.target.value)}
              label="Destination Department"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMoveUser} variant="contained" disabled={loading}>
            Move User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Set Manager Dialog */}
      <Dialog open={setManagerDialogOpen} onClose={() => {
        setSetManagerDialogOpen(false);
        setSelectedUserEmail('');
        setEligibleManagers([]);
      }} maxWidth="sm" fullWidth>
        <DialogTitle>Set Department Manager</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Manager</InputLabel>
            <Select
              value={selectedUserEmail}
              onChange={(e) => setSelectedUserEmail(e.target.value)}
              label="Manager"
            >
              {eligibleManagers.length === 0 ? (
                <MenuItem disabled>Loading eligible managers...</MenuItem>
              ) : (
                eligibleManagers.map((user) => (
                  <MenuItem key={user.id} value={user.email}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          {eligibleManagers.length === 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Only users that would not create circular management relationships are shown.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSetManagerDialogOpen(false);
            setSelectedUserEmail('');
            setEligibleManagers([]);
          }}>Cancel</Button>
          <Button onClick={handleSetManager} variant="contained" disabled={loading || eligibleManagers.length === 0}>
            Set Manager
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog 
        open={createUserDialogOpen} 
        onClose={() => {
          setCreateUserDialogOpen(false);
          setNewUserFirstName('');
          setNewUserLastName('');
          setNewUserEmail('');
          setNewUserTitle('');
          setNewUserRole('USER');
          setNewUserDepartmentId('');
          setNewUserManagerId('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Onboard New User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="First Name"
            value={newUserFirstName}
            onChange={(e) => setNewUserFirstName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Last Name"
            value={newUserLastName}
            onChange={(e) => setNewUserLastName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            margin="normal"
            required
            placeholder="user@example.com"
          />
          <TextField
            fullWidth
            label="Title (Optional)"
            value={newUserTitle}
            onChange={(e) => setNewUserTitle(e.target.value)}
            margin="normal"
            placeholder="e.g., Software Engineer"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
              <MenuItem value="MANAGER_ASSISTANT">Manager Assistant</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department (Optional)</InputLabel>
            <Select
              value={newUserDepartmentId}
              onChange={(e) => setNewUserDepartmentId(e.target.value)}
              label="Department (Optional)"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Manager (Optional)</InputLabel>
            <Select
              value={newUserManagerId}
              onChange={(e) => setNewUserManagerId(e.target.value)}
              label="Manager (Optional)"
            >
              <MenuItem value="">
                <em>None (will be derived from team/department)</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Team (Optional)</InputLabel>
            <Select
              value={newUserTeamId}
              onChange={(e) => setNewUserTeamId(e.target.value)}
              label="Team (Optional)"
              disabled={!newUserDepartmentId}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {newUserDepartmentId ? (
                teams
                  .filter((t) => t.department.id === newUserDepartmentId)
                  .map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>Select a department first</MenuItem>
              )}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              If assigned to a team, the team lead will be the user's manager
            </Typography>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateUserDialogOpen(false);
            setNewUserFirstName('');
            setNewUserLastName('');
            setNewUserEmail('');
            setNewUserTitle('');
            setNewUserRole('USER');
            setNewUserDepartmentId('');
            setNewUserManagerId('');
            setNewUserTeamId('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleCreateUser} variant="contained" disabled={loading}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Team Dialog */}
      <Dialog 
        open={createTeamDialogOpen} 
        onClose={() => {
          setCreateTeamDialogOpen(false);
          setNewTeamName('');
          setNewTeamDescription('');
          setNewTeamDepartmentId('');
          setNewTeamLeadEmail('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={newTeamDescription}
            onChange={(e) => setNewTeamDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Department</InputLabel>
            <Select
              value={newTeamDepartmentId}
              onChange={(e) => {
                setNewTeamDepartmentId(e.target.value);
                setNewTeamLeadEmail(''); // Reset team lead when department changes
              }}
              label="Department"
            >
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Team Lead</InputLabel>
            <Select
              value={newTeamLeadEmail}
              onChange={(e) => setNewTeamLeadEmail(e.target.value)}
              label="Team Lead"
              disabled={!newTeamDepartmentId}
            >
              {newTeamDepartmentId ? (
                users
                  .filter((u) => u.department?.id === newTeamDepartmentId)
                  .map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>Select a department first</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateTeamDialogOpen(false);
            setNewTeamName('');
            setNewTeamDescription('');
            setNewTeamDepartmentId('');
            setNewTeamLeadEmail('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleCreateTeam} variant="contained" disabled={loading}>
            Create Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign User to Team Dialog */}
      <Dialog 
        open={assignUserToTeamDialogOpen} 
        onClose={() => {
          setAssignUserToTeamDialogOpen(false);
          setSelectedTeamUserEmail('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add User to Team</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>User</InputLabel>
            <Select
              value={selectedTeamUserEmail}
              onChange={(e) => setSelectedTeamUserEmail(e.target.value)}
              label="User"
            >
              {selectedTeam ? (
                users
                  .filter((u) => 
                    u.department?.id === selectedTeam.department.id && 
                    !u.team
                  )
                  .map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>No team selected</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignUserToTeamDialogOpen(false);
            setSelectedTeamUserEmail('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleAssignUserToTeam} variant="contained" disabled={loading}>
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog 
        open={editUserDialogOpen} 
        onClose={() => {
          setEditUserDialogOpen(false);
          setEditingUser(null);
          setEditUserFirstName('');
          setEditUserLastName('');
          setEditUserEmail('');
          setEditUserTitle('');
          setEditUserRole('USER');
          setEditUserDepartmentId('');
          setEditUserManagerId('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="First Name"
            value={editUserFirstName}
            onChange={(e) => setEditUserFirstName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Last Name"
            value={editUserLastName}
            onChange={(e) => setEditUserLastName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={editUserEmail}
            onChange={(e) => setEditUserEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Title (Optional)"
            value={editUserTitle}
            onChange={(e) => setEditUserTitle(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="USER">User</MenuItem>
              <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
              <MenuItem value="MANAGER_ASSISTANT">Manager Assistant</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Department (Optional)</InputLabel>
            <Select
              value={editUserDepartmentId}
              onChange={(e) => setEditUserDepartmentId(e.target.value)}
              label="Department (Optional)"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Manager (Optional)</InputLabel>
            <Select
              value={editUserManagerId}
              onChange={(e) => setEditUserManagerId(e.target.value)}
              label="Manager (Optional)"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditUserDialogOpen(false);
            setEditingUser(null);
            setEditUserFirstName('');
            setEditUserLastName('');
            setEditUserEmail('');
            setEditUserTitle('');
            setEditUserRole('USER');
            setEditUserDepartmentId('');
            setEditUserManagerId('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateUser} variant="contained" disabled={loading}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog 
        open={editDepartmentDialogOpen} 
        onClose={() => {
          setEditDepartmentDialogOpen(false);
          setEditingDepartment(null);
          setEditDeptName('');
          setEditDeptDescription('');
          setEditDeptParentId('');
          setEditDeptStatus('ACTIVE');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Department</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Department Name"
            value={editDeptName}
            onChange={(e) => setEditDeptName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Description"
            value={editDeptDescription}
            onChange={(e) => setEditDeptDescription(e.target.value)}
            margin="normal"
            required
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Parent Department (Optional)</InputLabel>
            <Select
              value={editDeptParentId}
              onChange={(e) => setEditDeptParentId(e.target.value)}
              label="Parent Department (Optional)"
            >
              <MenuItem value="">
                <em>None (Root Department)</em>
              </MenuItem>
              {buildDepartmentHierarchy(departments, editingDepartment?.id).map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {getDepartmentDisplayName(dept, departments)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={editDeptStatus}
              onChange={(e) => setEditDeptStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDepartmentDialogOpen(false);
            setEditingDepartment(null);
            setEditDeptName('');
            setEditDeptDescription('');
            setEditDeptParentId('');
            setEditDeptStatus('ACTIVE');
          }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateDepartment} variant="contained" disabled={loading}>
            Update Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog 
        open={editTeamDialogOpen} 
        onClose={() => {
          setEditTeamDialogOpen(false);
          setEditingTeam(null);
          setEditTeamName('');
          setEditTeamDescription('');
          setEditTeamLeadEmail('');
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team Name"
            value={editTeamName}
            onChange={(e) => setEditTeamName(e.target.value)}
            margin="normal"
            required
            autoFocus
          />
          <TextField
            fullWidth
            label="Description (Optional)"
            value={editTeamDescription}
            onChange={(e) => setEditTeamDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Team Lead</InputLabel>
            <Select
              value={editTeamLeadEmail}
              onChange={(e) => setEditTeamLeadEmail(e.target.value)}
              label="Team Lead"
            >
              {editingTeam ? (
                users
                  .filter((u) => u.department?.id === editingTeam.department.id)
                  .map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
              ) : (
                <MenuItem disabled>No team selected</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditTeamDialogOpen(false);
            setEditingTeam(null);
            setEditTeamName('');
            setEditTeamDescription('');
            setEditTeamLeadEmail('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTeam} variant="contained" disabled={loading}>
            Update Team
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRAdminPage;


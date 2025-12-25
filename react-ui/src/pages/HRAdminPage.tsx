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
import { graphqlRequest } from '../api/graphqlClient';
import { isHrAdmin } from '../api/authService';
import { Department, User } from '../types';

const HRAdminPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [eligibleManagers, setEligibleManagers] = useState<User[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [moveUserDialogOpen, setMoveUserDialogOpen] = useState(false);
  const [setManagerDialogOpen, setSetManagerDialogOpen] = useState(false);

  // Form states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDescription, setNewDeptDescription] = useState('');
  const [newDeptManagerEmail, setNewDeptManagerEmail] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState<string>('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedMoveUserId, setSelectedMoveUserId] = useState('');
  const [selectedMoveDeptId, setSelectedMoveDeptId] = useState('');

  useEffect(() => {
    if (!isHrAdmin()) {
      setError('Access denied. HR_ADMIN role required.');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsData, usersData] = await Promise.all([
        getAllDepartments(),
        graphqlRequest<{ users: User[] }>(`
          query GetUsers {
            users {
              id
              firstName
              lastName
              email
              title
              department {
                id
                name
              }
            }
          }
        `),
      ]);
      setDepartments(deptsData);
      setUsers(usersData.users ?? []);
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
          HR Admin - Department Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Department
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="All Departments" icon={<BusinessIcon />} />
        <Tab label="Department Details" icon={<PeopleIcon />} />
      </Tabs>

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {selectedTab === 0 && (
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
              {departments.map((dept) => (
                <TableRow
                  key={dept.id}
                  hover
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setSelectedTab(1);
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

      {selectedTab === 1 && selectedDepartment && (
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
    </Box>
  );
};

export default HRAdminPage;


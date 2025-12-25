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
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  MenuItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import {
  getDepartmentsManagedByMe,
  assignManagerAssistant,
  getDepartmentMembers,
} from '../api/departmentService';
import { getGoalsPendingApproval, getDepartmentMembersGoals, approveGoal } from '../api/goalService';
import { graphqlRequest } from '../api/graphqlClient';
import { Department, Goal, User } from '../types';

const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentMembers, setDepartmentMembers] = useState<User[]>([]);
  const [pendingGoals, setPendingGoals] = useState<Goal[]>([]);
  const [departmentGoals, setDepartmentGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [assistantDialogOpen, setAssistantDialogOpen] = useState(false);
  const [selectedAssistantEmail, setSelectedAssistantEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsData, usersData] = await Promise.all([
        getDepartmentsManagedByMe(),
        graphqlRequest<{ users: User[] }>(`
          query GetUsers {
            users {
              id
              firstName
              lastName
              email
              title
            }
          }
        `),
      ]);
      setDepartments(deptsData);
      setUsers(usersData.users ?? []);
      if (deptsData.length > 0 && !selectedDepartment) {
        setSelectedDepartment(deptsData[0]);
        loadDepartmentDetails(deptsData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentDetails = async (deptId: string) => {
    try {
      const [members, pending, goals] = await Promise.all([
        getDepartmentMembers(deptId),
        getGoalsPendingApproval(deptId),
        getDepartmentMembersGoals(deptId),
      ]);
      setDepartmentMembers(members);
      setPendingGoals(pending);
      setDepartmentGoals(goals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load department details');
    }
  };

  const handleApproveGoal = async (goalId: string) => {
    setLoading(true);
    setError(null);
    try {
      await approveGoal(goalId);
      if (selectedDepartment) {
        await loadDepartmentDetails(selectedDepartment.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAssistant = async () => {
    if (!selectedDepartment || !selectedAssistantEmail) {
      setError('Please select a department and assistant');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await assignManagerAssistant(selectedDepartment.id, selectedAssistantEmail);
      await loadData();
      setAssistantDialogOpen(false);
      setSelectedAssistantEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign assistant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDepartment) {
      loadDepartmentDetails(selectedDepartment.id);
    }
  }, [selectedDepartment]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        My Departments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {departments.length === 0 ? (
        <Card>
          <CardContent>
            <Typography>You are not managing any departments.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Card sx={{ minWidth: 300 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Departments
              </Typography>
              <List>
                {departments.map((dept) => (
                  <ListItem
                    key={dept.id}
                    button
                    selected={selectedDepartment?.id === dept.id}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    <ListItemText
                      primary={dept.name}
                      secondary={`${dept.users?.length || 0} members`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {selectedDepartment && (
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h5">{selectedDepartment.name}</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setAssistantDialogOpen(true)}
                    >
                      Assign Assistant
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedDepartment.smallDescription}
                  </Typography>

                  <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 2 }}>
                    <Tab label="Members" icon={<PeopleIcon />} />
                    <Tab
                      label={`Pending Approvals (${pendingGoals.length})`}
                      icon={<PendingIcon />}
                    />
                    <Tab label="Goals" icon={<AssignmentIcon />} />
                  </Tabs>

                  {selectedTab === 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1 }}>
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
                    </Box>
                  )}

                  {selectedTab === 1 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Goals Pending Approval ({pendingGoals.length})
                      </Typography>
                      {pendingGoals.length === 0 ? (
                        <Typography color="text.secondary">No goals pending approval</Typography>
                      ) : (
                        <TableContainer component={Paper}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Goal Description</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell>Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {pendingGoals.map((goal) => (
                                <TableRow key={goal.id}>
                                  <TableCell>{goal.shortDescription}</TableCell>
                                  <TableCell>
                                    {goal.owner ? `${goal.owner.firstName} ${goal.owner.lastName}` : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {goal.assignedUsers.map((u) => `${u.firstName} ${u.lastName}`).join(', ')}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={() => handleApproveGoal(goal.id)}
                                      disabled={loading}
                                    >
                                      Approve
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </Box>
                  )}

                  {selectedTab === 2 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Department Goals ({departmentGoals.length})
                      </Typography>
                      {departmentGoals.length === 0 ? (
                        <Typography color="text.secondary">No goals assigned to department members</Typography>
                      ) : (
                        <List>
                          {departmentGoals.map((goal) => (
                            <ListItem key={goal.id}>
                              <ListItemText
                                primary={goal.shortDescription}
                                secondary={
                                  <Box>
                                    <Chip
                                      label={goal.status}
                                      size="small"
                                      sx={{ mr: 1 }}
                                      color={goal.status === 'APPROVED' ? 'success' : 'default'}
                                    />
                                    Assigned to: {goal.assignedUsers.map((u) => `${u.firstName} ${u.lastName}`).join(', ')}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      )}

      {/* Assign Assistant Dialog */}
      <Dialog open={assistantDialogOpen} onClose={() => setAssistantDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Manager Assistant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Assistant"
            value={selectedAssistantEmail}
            onChange={(e) => setSelectedAssistantEmail(e.target.value)}
            margin="normal"
            SelectProps={{
              native: false,
              renderValue: (value) => {
                const user = users.find((u) => u.email === value);
                return user ? `${user.firstName} ${user.lastName} (${user.email})` : '';
              },
            }}
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.email}>
                {user.firstName} {user.lastName} ({user.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssistantDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignAssistant} variant="contained" disabled={loading}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentManagementPage;


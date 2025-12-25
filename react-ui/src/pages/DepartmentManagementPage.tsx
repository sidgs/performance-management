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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import {
  getDepartmentsManagedByMe,
  assignManagerAssistant,
  getDepartmentMembers,
} from '../api/departmentService';
import { getGoalsPendingApproval, approveGoal } from '../api/goalService';
import { graphqlRequest } from '../api/graphqlClient';
import { Department, Goal, User, GoalStatus } from '../types';
import { getCurrentUserEmail } from '../api/authService';

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
  
  // Goal editing state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editShortDesc, setEditShortDesc] = useState('');
  const [editLongDesc, setEditLongDesc] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editStatus, setEditStatus] = useState<GoalStatus>('DRAFT');
  const [editCompletionDate, setEditCompletionDate] = useState('');
  const [editConfidential, setEditConfidential] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
      const [members, pending, goalsData] = await Promise.all([
        getDepartmentMembers(deptId),
        getGoalsPendingApproval(deptId),
        graphqlRequest<{ departmentMembersGoals: Goal[] }>(
          `
            query GetDepartmentMembersGoals($departmentId: ID!) {
              departmentMembersGoals(departmentId: $departmentId) {
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
          `,
          { departmentId: deptId }
        ),
      ]);
      setDepartmentMembers(members);
      setPendingGoals(pending);
      setDepartmentGoals(goalsData.departmentMembersGoals ?? []);
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

  const handleEditGoal = (goal: Goal) => {
    if (goal.locked) {
      const currentUserEmail = getCurrentUserEmail();
      if (goal.owner.email !== currentUserEmail) {
        setError('This goal is locked. Only the owner can unlock and edit it.');
        return;
      }
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
      await graphqlRequest<{ updateGoal: Goal }>(
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

      // Refresh department goals
      if (selectedDepartment) {
        await loadDepartmentDetails(selectedDepartment.id);
      }
      
      setEditDialogOpen(false);
      setEditingGoal(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update goal');
    } finally {
      setEditLoading(false);
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
                                    {goal.assignedUsers?.map((u) => `${u.firstName} ${u.lastName}`).join(', ') || 'N/A'}
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
                            <ListItem 
                              key={goal.id}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  aria-label="edit"
                                  onClick={() => handleEditGoal(goal)}
                                  disabled={goal.locked && goal.owner.email !== getCurrentUserEmail()}
                                >
                                  <EditIcon />
                                </IconButton>
                              }
                            >
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
                                    {goal.locked && (
                                      <Chip
                                        label="Locked"
                                        size="small"
                                        sx={{ mr: 1 }}
                                        color="warning"
                                        variant="outlined"
                                      />
                                    )}
                                    Assigned to: {goal.assignedUsers?.map((u) => `${u.firstName} ${u.lastName}`).join(', ') || 'N/A'}
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
                {users.map((user) => (
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
    </Box>
  );
};

export default DepartmentManagementPage;


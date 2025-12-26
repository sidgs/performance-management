import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { graphqlRequest } from '../api/graphqlClient';
import { isHrAdmin } from '../api/authService';
import type { Goal, GoalStatus, User } from '../types';

const HRGoalSearchPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Status configuration
  const statusConfig = {
    PENDING_APPROVAL: { label: 'Pending Approval', color: 'warning' as const },
    DRAFT: { label: 'Draft', color: 'default' as const },
    APPROVED: { label: 'Approved', color: 'info' as const },
    PUBLISHED: { label: 'Published', color: 'primary' as const },
    ACHIEVED: { label: 'Achieved', color: 'success' as const },
    RETIRED: { label: 'Retired', color: 'warning' as const },
    ARCHIVED: { label: 'Archived', color: 'default' as const },
  };

  const statuses: GoalStatus[] = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ACHIEVED', 'RETIRED', 'ARCHIVED'];

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
      const [goalsData, usersData] = await Promise.all([
        graphqlRequest<{ allGoalsForHR: Goal[] }>(
          `
            query GetAllGoalsForHR {
              allGoalsForHR {
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
        ),
        graphqlRequest<{ users: User[] }>(
          `
            query GetUsers {
              users {
                id
                firstName
                lastName
                email
                title
              }
            }
          `
        ),
      ]);

      setGoals(goalsData.allGoalsForHR ?? []);
      setUsers(usersData.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = 
      goal.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.longDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${goal.owner.firstName} ${goal.owner.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesOwner = filterOwner === 'all' || goal.owner.id === filterOwner;

    return matchesSearch && matchesStatus && matchesOwner;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setViewDialogOpen(true);
  };

  if (!isHrAdmin()) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. HR_ADMIN role required.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Goal Search (HR Admin)
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Search and view all organizational goals. Confidential goals show limited information.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Controls Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: 1, minWidth: 200 }}
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
            <FormControl sx={{ minWidth: 150 }}>
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
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Owner</InputLabel>
              <Select
                value={filterOwner}
                label="Owner"
                onChange={(e) => setFilterOwner(e.target.value)}
              >
                <MenuItem value="all">All Owners</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Goals Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No goals found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Goal Description</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Confidential</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {goal.shortDescription}
                      </Typography>
                      {goal.confidential && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <LockIcon fontSize="small" />
                          Confidential
                        </Typography>
                      )}
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
                          {goal.owner.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig[goal.status].label}
                      color={statusConfig[goal.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {goal.confidential ? (
                      <Chip
                        icon={<LockIcon />}
                        label="Confidential"
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(goal.creationDate)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {goal.assignedUsers.length} user{goal.assignedUsers.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(goal)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedGoal && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" component="div">
                  {selectedGoal.shortDescription}
                </Typography>
                {selectedGoal.confidential && (
                  <Chip
                    icon={<LockIcon />}
                    label="Confidential"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedGoal.id}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedGoal.longDescription}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={statusConfig[selectedGoal.status].label}
                    color={statusConfig[selectedGoal.status].color}
                    size="small"
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Goal Owner
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                      {selectedGoal.owner.firstName[0]}{selectedGoal.owner.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {selectedGoal.owner.firstName} {selectedGoal.owner.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedGoal.owner.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Created
                  </Typography>
                  <Typography variant="body2">{formatDate(selectedGoal.creationDate)}</Typography>
                </Box>

                {selectedGoal.completionDate && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Completion Date
                    </Typography>
                    <Typography variant="body2">{formatDate(selectedGoal.completionDate)}</Typography>
                  </Box>
                )}

                {selectedGoal.assignedUsers.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned Users ({selectedGoal.assignedUsers.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedGoal.assignedUsers.map((user) => (
                        <Chip
                          key={user.id}
                          label={`${user.firstName} ${user.lastName}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedGoal.kpis && selectedGoal.kpis.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      KPIs ({selectedGoal.kpis.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedGoal.kpis.map((kpi) => (
                        <Box key={kpi.id} sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">{kpi.description}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Status: {kpi.status} | Progress: {kpi.completionPercentage}%
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HRGoalSearchPage;


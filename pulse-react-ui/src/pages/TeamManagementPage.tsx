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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { graphqlRequest } from '../api/graphqlClient';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

const TeamManagementPage: React.FC = () => {
  const { userEmail } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Load current user and team members
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!userEmail) {
          setError('User not authenticated');
          return;
        }

        // Fetch current user
        const userData = await graphqlRequest<{ userByEmail: User }>(
          `
            query GetCurrentUser($email: String!) {
              userByEmail(email: $email) {
                id
                firstName
                lastName
                email
                title
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
          { email: userEmail }
        );

        if (userData.userByEmail) {
          setCurrentUser(userData.userByEmail);
          setTeamMembers(userData.userByEmail.teamMembers || []);
        }

        // Fetch all users for the add dialog
        const allUsersData = await graphqlRequest<{ users: User[] }>(
          `
            query GetAllUsers {
              users {
                id
                firstName
                lastName
                email
                title
                manager {
                  id
                  email
                }
              }
            }
          `
        );

        setAllUsers(allUsersData.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get users that can be added to team (not already in team, not the current user)
  const availableUsers = allUsers.filter(
    (user) =>
      user.email !== currentUser?.email &&
      !teamMembers.some((member) => member.email === user.email) &&
      (!user.manager || user.manager.email !== currentUser?.email) // Not already managed by someone else
  );

  const handleAddToTeam = async () => {
    if (!selectedUserEmail || !currentUser) {
      setAddError('Please select a user to add to your team');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      // Update the user's manager to be the current user
      const selectedUser = allUsers.find((u) => u.email === selectedUserEmail);
      if (!selectedUser) {
        setAddError('Selected user not found');
        return;
      }

      await graphqlRequest<{ setUserManager: User }>(
        `
          mutation SetUserManager($userId: ID!, $managerId: ID) {
            setUserManager(userId: $userId, managerId: $managerId) {
              id
              firstName
              lastName
              email
              title
            }
          }
        `,
        {
          userId: selectedUser.id,
          managerId: currentUser.id,
        }
      );

      // Refresh team members
      const currentUserEmail = userEmail;
      const userData = await graphqlRequest<{ userByEmail: User }>(
        `
          query GetCurrentUser($email: String!) {
            userByEmail(email: $email) {
              id
              firstName
              lastName
              email
              title
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
        { email: currentUserEmail! }
      );

      if (userData.userByEmail) {
        setTeamMembers(userData.userByEmail.teamMembers || []);
      }

      setAddDialogOpen(false);
      setSelectedUserEmail('');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add user to team');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveFromTeam = async (userEmail: string) => {
    if (!currentUser) return;

    try {
      const userToRemove = allUsers.find((u) => u.email === userEmail);
      if (!userToRemove) return;

      // Remove manager relationship
      await graphqlRequest<{ setUserManager: User }>(
        `
          mutation SetUserManager($userId: ID!, $managerId: ID) {
            setUserManager(userId: $userId, managerId: $managerId) {
              id
              firstName
              lastName
              email
              title
            }
          }
        `,
        {
          userId: userToRemove.id,
          managerId: null,
        }
      );

      // Refresh team members
      const currentUserEmail = userEmail;
      const userData = await graphqlRequest<{ userByEmail: User }>(
        `
          query GetCurrentUser($email: String!) {
            userByEmail(email: $email) {
              id
              firstName
              lastName
              email
              title
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
        { email: currentUserEmail! }
      );

      if (userData.userByEmail) {
        setTeamMembers(userData.userByEmail.teamMembers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove user from team');
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentUser) {
    return (
      <Box>
        <Alert severity="info">User information not available</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          My Team
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Manage your team members and assign goals to them.
        </Typography>
      </Box>

      {/* Current User Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {currentUser.firstName[0]}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {currentUser.firstName} {currentUser.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.email}
              </Typography>
              {currentUser.title && (
                <Typography variant="body2" color="text.secondary">
                  {currentUser.title}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Team Members ({teamMembers.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Team Member
            </Button>
          </Box>

          {teamMembers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No team members yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add team members to assign goals and track their progress.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Your First Team Member
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                            {member.firstName[0]}
                          </Avatar>
                          <Typography>
                            {member.firstName} {member.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.title || '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remove from team">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFromTeam(member.email)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Team Member Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {addError && <Alert severity="error">{addError}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedUserEmail}
                label="Select User"
                onChange={(e) => setSelectedUserEmail(e.target.value)}
              >
                {availableUsers.length === 0 ? (
                  <MenuItem disabled value="">
                    No available users to add
                  </MenuItem>
                ) : (
                  availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {availableUsers.length === 0 && (
              <Alert severity="info">
                All users are already in your team or have other managers.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={addLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddToTeam}
            variant="contained"
            disabled={addLoading || !selectedUserEmail}
            startIcon={<AddIcon />}
          >
            {addLoading ? 'Adding...' : 'Add to Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamManagementPage;


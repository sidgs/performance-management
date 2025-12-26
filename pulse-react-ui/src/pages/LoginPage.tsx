import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Chip,
  OutlinedInput,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { createAuthToken, isDevMode } from '../api/authService';
import { getDemoUsers, type DemoUser, roleToArray } from '../api/demoUsersService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState<'existing' | 'new'>('existing');
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>('');
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>(['USER']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check if in dev mode
  const devMode = isDevMode();

  // Load demo users on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!devMode) return;
      setLoadingUsers(true);
      try {
        const users = await getDemoUsers();
        setDemoUsers(users);
        // Auto-select first user if available and no user is selected yet
        if (users.length > 0 && !selectedUserEmail && loginMode === 'existing') {
          const firstUser = users[0];
          setSelectedUserEmail(firstUser.email);
          setName(`${firstUser.firstName} ${firstUser.lastName}`);
          setEmail(firstUser.email);
          setRoles(roleToArray(firstUser.role));
        }
      } catch (err) {
        console.error('Failed to load demo users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devMode, loginMode]);

  // Handle user selection from dropdown
  const handleUserSelect = (userEmail: string) => {
    setSelectedUserEmail(userEmail);
    const user = demoUsers.find(u => u.email === userEmail);
    if (user) {
      setName(`${user.firstName} ${user.lastName}`);
      setEmail(user.email);
      setRoles(roleToArray(user.role));
    }
  };

  // Handle login mode change
  const handleLoginModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: 'existing' | 'new' | null,
  ) => {
    if (newMode !== null) {
      setLoginMode(newMode);
      if (newMode === 'new') {
        // Clear fields when switching to new user mode
        setName('');
        setEmail('');
        setRoles(['USER']);
        setSelectedUserEmail('');
      } else if (newMode === 'existing' && demoUsers.length > 0) {
        // Select first user when switching to existing user mode
        handleUserSelect(demoUsers[0].email);
      }
    }
  };
  
  // If not in dev mode, show message instead of login form
  if (!devMode) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card sx={{ width: '100%', maxWidth: 500, boxShadow: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <LoginIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Development Login Only
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                The login page is only available in development mode.
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  In production mode, authentication tokens must be provided externally.
                  Please ensure you are authenticated before accessing this application.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || roles.length === 0) {
      setError('Please fill in all fields and select at least one role');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const token = await createAuthToken({
        name: name.trim(),
        email: email.trim(),
        roles: roles,
      });

      if (token) {
        // Dispatch a custom event to notify App component of auth change
        window.dispatchEvent(new Event('authchange'));
        // Small delay to ensure state updates
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setError('Failed to create authentication token. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 450, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                Performance Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Development Login
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <ToggleButtonGroup
                  value={loginMode}
                  exclusive
                  onChange={handleLoginModeChange}
                  aria-label="login mode"
                  fullWidth
                  size="small"
                >
                  <ToggleButton value="existing" aria-label="existing user">
                    Login as Existing User
                  </ToggleButton>
                  <ToggleButton value="new" aria-label="new user">
                    Create New User
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>

              {loginMode === 'existing' ? (
                <>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Select User</InputLabel>
                    <Select
                      value={selectedUserEmail}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      label="Select User"
                      disabled={loading || loadingUsers}
                    >
                      {demoUsers.map((user) => (
                        <MenuItem key={user.email} value={user.email}>
                          {user.firstName} {user.lastName} ({user.email}) - {user.role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    margin="normal"
                    disabled
                    helperText="Name from selected user profile"
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    value={email}
                    margin="normal"
                    disabled
                    helperText="Email from selected user profile"
                  />
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={roles}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoles(typeof value === 'string' ? value.split(',') : value);
                      }}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                      disabled={loading}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="EPM_ADMIN">EPM Admin</MenuItem>
                      <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
                      <MenuItem value="MANAGER_ASSISTANT">Manager Assistant</MenuItem>
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Roles from selected user profile (you can modify if needed)
                    </Typography>
                  </FormControl>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    required
                    autoFocus
                    placeholder="Enter your full name"
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                    placeholder="your.email@example.com"
                    disabled={loading}
                  />

                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Roles</InputLabel>
                    <Select
                      multiple
                      value={roles}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRoles(typeof value === 'string' ? value.split(',') : value);
                      }}
                      input={<OutlinedInput label="Roles" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                      disabled={loading}
                    >
                      <MenuItem value="USER">User</MenuItem>
                      <MenuItem value="EPM_ADMIN">EPM Admin</MenuItem>
                      <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
                      <MenuItem value="MANAGER_ASSISTANT">Manager Assistant</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
                startIcon={<LoginIcon />}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                This is a development login. Your credentials will be used to generate a JWT token.
                {loginMode === 'existing' && (
                  <><br />Selected user's roles from their profile will be used for authentication.</>
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;


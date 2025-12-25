import React, { useState } from 'react';
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
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { createAuthToken, isDevMode } from '../api/authService';
import { useEffect } from 'react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if in dev mode
  const devMode = isDevMode();
  
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

    if (!name.trim() || !email.trim() || !role) {
      setError('Please fill in all fields');
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
        role: role,
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="EPM_ADMIN">EPM Admin</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>

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
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;


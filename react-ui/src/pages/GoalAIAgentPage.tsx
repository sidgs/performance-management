import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { graphqlRequest } from '../api/graphqlClient';
import { getAuthToken, getCurrentUserEmail, getCurrentUserRoles } from '../api/authService';
import type { Goal, User } from '../types';

const GoalAIAgentPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load user context and goals
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user context - these will be passed to the agent
        const email = getCurrentUserEmail();
        const roles = getCurrentUserRoles();
        const token = await getAuthToken();

        setUserEmail(email);
        setUserRoles(roles);
        setAuthToken(token);

        // Fetch user's goals
        if (token) {
          try {
            const data = await graphqlRequest<{ goals: Goal[] }>(
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
                      status
                    }
                    assignedUsers {
                      id
                      firstName
                      lastName
                      email
                    }
                    kpis {
                      id
                      description
                      status
                      completionPercentage
                    }
                  }
                }
              `,
            );

            setGoals(data.goals ?? []);
          } catch (err) {
            console.error('Error fetching goals:', err);
            // Don't fail the page if goals can't be loaded
            setGoals([]);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize page';
        setError(errorMessage);
        console.error('Error initializing Goal AI Agent page:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h1" gutterBottom>
              Goal AI Assistant
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Get deep insights, recommendations, and interact with your goals using AI
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* User Context Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Your Context
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {userEmail || 'Not available'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Roles
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {userRoles.length > 0 ? (
                      userRoles.map((role) => (
                        <Chip key={role} label={role} size="small" color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No roles assigned
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Authentication Status
                  </Typography>
                  <Typography variant="body2" color={authToken ? 'success.main' : 'error.main'}>
                    {authToken ? '✓ Authenticated' : '✗ Not authenticated'}
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Note:</strong> Your authentication token and user context will be automatically
                  passed to the AI Agent when it's implemented. The agent will be aware of who you are
                  and can interact with the backend API on your behalf.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Goals Summary Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="primary" />
                Your Goals
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {goals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {goals.length === 1 ? 'Goal available' : 'Goals available'} for AI interaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Agent Interaction Area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ minHeight: '600px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon color="primary" />
                AI Agent Interface
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Placeholder for Agent Interface */}
              <Box
                sx={{
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  border: '2px dashed',
                  borderColor: 'divider',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  AI Agent Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
                  The Goal AI Agent interface will be integrated here. It will allow you to:
                </Typography>
                <Stack spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <LightbulbIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Get Insights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive deep insights about your goals, progress, and performance
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <AutoAwesomeIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Get Recommendations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive personalized recommendations to improve goal achievement
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <TrendingUpIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Interact with Goals
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ask questions about your goals and get intelligent responses
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Agent Integration Point Comment */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {`// Agent Integration Point
// The agent will receive:
// - User Email: ${userEmail || 'N/A'}
// - User Roles: [${userRoles.join(', ') || 'N/A'}]
// - Auth Token: ${authToken ? '✓ Available' : '✗ Not available'}
// - Goals Data: ${goals.length} goals loaded
// 
// The agent can use this context to:
// - Make authenticated API calls on behalf of the user
// - Access user's goals and provide insights
// - Provide personalized recommendations based on user's role and goals`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Goals List Section */}
        {goals.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="primary" />
                  Available Goals for AI Interaction
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {goals.slice(0, 6).map((goal) => (
                    <Grid item xs={12} sm={6} md={4} key={goal.id}>
                      <Paper
                        sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                          {goal.shortDescription}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {goal.longDescription?.substring(0, 100)}
                          {goal.longDescription && goal.longDescription.length > 100 ? '...' : ''}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={goal.status}
                            size="small"
                            color={
                              goal.status === 'PUBLISHED'
                                ? 'success'
                                : goal.status === 'DRAFT'
                                  ? 'default'
                                  : 'primary'
                            }
                          />
                          {goal.locked && (
                            <Chip label="Locked" size="small" color="warning" variant="outlined" />
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                {goals.length > 6 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    And {goals.length - 6} more goals...
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GoalAIAgentPage;


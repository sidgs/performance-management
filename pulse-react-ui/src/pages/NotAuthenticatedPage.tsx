import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { isWidgetMode } from '../utils/widgetMode';

const NotAuthenticatedPage: React.FC = () => {
  const [waitingForToken, setWaitingForToken] = useState(true);
  const widgetMode = isWidgetMode();

  useEffect(() => {
    // In widget mode, wait a bit for parent to send token
    if (widgetMode) {
      const timer = setTimeout(() => {
        setWaitingForToken(false);
      }, 3000); // Wait 3 seconds for parent to send token
      return () => clearTimeout(timer);
    } else {
      setWaitingForToken(false);
    }
  }, [widgetMode]);

  if (widgetMode && waitingForToken) {
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
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6" component="h1" gutterBottom fontWeight={600}>
                Waiting for Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Waiting for authentication token from parent portal...
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

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
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {widgetMode 
                ? 'Authentication token not received from parent portal.'
                : 'You must be logged in to proceed.'}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {widgetMode 
                  ? 'Please ensure the parent portal provides an authentication token via postMessage.'
                  : 'Please ensure you are authenticated before accessing this application. In production mode, authentication tokens must be provided externally.'}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NotAuthenticatedPage;


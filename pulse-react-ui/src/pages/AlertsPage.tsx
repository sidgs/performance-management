import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const AlertsPage: React.FC = () => {
  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h1" gutterBottom>
              Alerts
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Stay informed about important updates and notifications
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Coming Soon Card */}
      <Card>
        <CardContent>
          <Box
            sx={{
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              textAlign: 'center',
            }}
          >
            <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h4" color="text.secondary" gutterBottom fontWeight={600}>
              Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mt: 2 }}>
              The Alerts feature is currently under development. You'll be able to receive and manage
              important notifications, updates, and alerts related to your goals and performance.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertsPage;


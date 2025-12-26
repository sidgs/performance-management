import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'transparent',
        py: 3,
        px: 2,
        mt: 'auto',
        textAlign: 'center',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: '#666',
          fontSize: '0.875rem',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          fontWeight: 'bold',
        }}
      >
        © {currentYear} SID Global Solutions. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
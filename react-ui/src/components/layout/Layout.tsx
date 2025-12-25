import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import MenuCallout from './MenuCallout';
import Breadcrumbs from './Breadcrumbs';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            p: 3,
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          <Breadcrumbs />
          <Box sx={{ mt: 2 }}>{children}</Box>
        </Box>
      </Box>
      <MenuCallout />
    </Box>
  );
};

export default Layout;
import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import SideNavigation from './SideNavigation';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <SideNavigation />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          <Breadcrumbs />
          <Box sx={{ mt: 2 }}>{children}</Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
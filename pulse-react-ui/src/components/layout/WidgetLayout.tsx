import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import MenuCallout from './MenuCallout';

interface WidgetLayoutProps {
  children: ReactNode;
}

/**
 * Widget Layout - Minimal layout without header and footer
 * Used when the app is embedded in a portal/widget
 */
const WidgetLayout: React.FC<WidgetLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            p: 3,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>
      <MenuCallout />
    </Box>
  );
};

export default WidgetLayout;


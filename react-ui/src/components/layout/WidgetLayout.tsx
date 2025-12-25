import React, { ReactNode, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SideNavigation from './SideNavigation';

interface WidgetLayoutProps {
  children: ReactNode;
}

/**
 * Widget Layout - Minimal layout without header and footer
 * Used when the app is embedded in a portal/widget
 */
const WidgetLayout: React.FC<WidgetLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SideNavigation open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: 'background.default',
            minHeight: '100vh',
            transition: 'margin-left 0.3s ease-in-out',
            marginLeft: sidebarOpen ? 0 : 0, // Drawer handles its own positioning
            position: 'relative',
          }}
        >
          {/* Floating toggle button - positioned on sidebar edge when open */}
          {sidebarOpen && (
            <Tooltip title="Hide Menu">
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: 'fixed',
                  top: 16,
                  left: 248, // Position on the right edge of sidebar (260px - 12px for overlap)
                  zIndex: 1301, // Above drawer (drawer z-index is 1300)
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  transition: 'left 0.3s ease-in-out',
                }}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Show button when sidebar is closed - positioned in top-right to avoid header overlap */}
          {!sidebarOpen && (
            <Tooltip title="Show Menu">
              <IconButton
                onClick={toggleSidebar}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  zIndex: 1301,
                  backgroundColor: 'background.paper',
                  boxShadow: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  width: 32,
                  height: 32,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {/* Content area - add extra top padding when sidebar is closed to avoid button overlap */}
          <Box sx={{ mt: 2, pt: !sidebarOpen ? 4 : 0 }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WidgetLayout;


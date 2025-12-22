import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Report as ReportIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const SideNavigation: React.FC = () => {
  const [openPerformance, setOpenPerformance] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerWidth = 260;

  const mainMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    // { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  const performanceMenuItems = [
    // { text: 'Performance Reviews', icon: <AssessmentIcon />, path: '/performance/reviews' },
    { text: 'Goals & OKRs', icon: <TrendingUpIcon />, path: '/performance/goals' },
    // { text: 'Feedback', icon: <NotificationsActiveIcon />, path: '/performance/feedback' },
  ];

  const otherMenuItems = [
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    // { text: 'Team Management', icon: <PeopleIcon />, path: '/team' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
          top: 64, // Height of header
          height: 'calc(100vh - 64px)',
        },
        display: { xs: 'none', lg: 'block' },
      }}
    >
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            mb: 1,
            display: 'block',
          }}
        >
          Main Menu
        </Typography>
        
        <List>
          {mainMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'white' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: 1,
            mb: 1,
            display: 'block',
          }}
        >
          Performance
        </Typography>
        
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setOpenPerformance(!openPerformance)}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Performance Management" />
              {openPerformance ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openPerformance} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {performanceMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ pl: 4 }}>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: location.pathname === item.path ? 'white' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          {otherMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'white' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default SideNavigation;
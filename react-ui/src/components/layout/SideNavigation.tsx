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
  //Dashboard as DashboardIcon,
  //Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  Report as ReportIcon,
  CloudUpload as CloudUploadIcon,
  //NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { isEpmAdmin, isHrAdmin } from '../../api/authService';
import { isWidgetMode } from '../../utils/widgetMode';
import Business as BusinessIcon from '@mui/icons-material/Business';
import Groups as GroupsIcon from '@mui/icons-material/Groups';

interface SideNavigationProps {
  open?: boolean;
  onClose?: () => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ open, onClose }) => {
  const [openPerformance, setOpenPerformance] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const drawerWidth = 260;
  const widgetMode = isWidgetMode();
  
  // In widget mode, use temporary drawer if open prop is provided
  // Otherwise, use permanent drawer (standalone mode)
  const drawerVariant = widgetMode && open !== undefined ? 'temporary' : 'permanent';

  const mainMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    // { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  const performanceMenuItems = [
    // { text: 'Performance Reviews', icon: <AssessmentIcon />, path: '/performance/reviews' },
    { text: 'Goals', icon: <TrendingUpIcon />, path: '/goals' },
    { text: 'My Team', icon: <PeopleIcon />, path: '/team' },
    // { text: 'Feedback', icon: <NotificationsActiveIcon />, path: '/performance/feedback' },
  ];

  const otherMenuItems = [
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
    // { text: 'Team Management', icon: <PeopleIcon />, path: '/team' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  // Add HR Admin menu for HR_ADMIN users
  const hrAdminMenuItems = isHrAdmin()
    ? [{ text: 'HR Admin', icon: <BusinessIcon />, path: '/hr-admin' }]
    : [];

  // Add My Departments menu for department managers
  const departmentManagerMenuItems = [
    { text: 'My Departments', icon: <GroupsIcon />, path: '/departments' }
  ];

  // Add Bulk Upload only for EPM_ADMIN users
  const adminMenuItems = isEpmAdmin()
    ? [{ text: 'Bulk Upload', icon: <CloudUploadIcon />, path: '/bulk-upload' }]
    : [];

  return (
    <Drawer
      variant={drawerVariant}
      open={widgetMode ? (open ?? true) : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better mobile performance
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
          top: widgetMode ? 0 : 64, // No header in widget mode
          height: widgetMode ? '100vh' : 'calc(100vh - 64px)',
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
                onClick={() => {
                  navigate(item.path);
                  // Close drawer in widget mode after navigation
                  if (widgetMode && drawerVariant === 'temporary' && onClose) {
                    onClose();
                  }
                }}
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
                    onClick={() => {
                      navigate(item.path);
                      // Close drawer in widget mode after navigation
                      if (widgetMode && drawerVariant === 'temporary' && onClose) {
                        onClose();
                      }
                    }}
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

        {hrAdminMenuItems.length > 0 && (
          <>
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
              HR Administration
            </Typography>
            <List>
              {hrAdminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (widgetMode && drawerVariant === 'temporary' && onClose) {
                        onClose();
                      }
                    }}
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
          </>
        )}

        {departmentManagerMenuItems.length > 0 && (
          <>
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
              Department Management
            </Typography>
            <List>
              {departmentManagerMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (widgetMode && drawerVariant === 'temporary' && onClose) {
                        onClose();
                      }
                    }}
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
          </>
        )}

        {adminMenuItems.length > 0 && (
          <>
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
              Administration
            </Typography>
            <List>
              {adminMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => {
                      navigate(item.path);
                      // Close drawer in widget mode after navigation
                      if (widgetMode && drawerVariant === 'temporary' && onClose) {
                        onClose();
                      }
                    }}
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
          </>
        )}

        <List>
          {otherMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  // Close drawer in widget mode after navigation
                  if (widgetMode && drawerVariant === 'temporary' && onClose) {
                    onClose();
                  }
                }}
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
import React, { useState } from 'react';
import {
  Fab,
  Popover,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  Report as ReportIcon,
  CloudUpload as CloudUploadIcon,
  Business as BusinessIcon,
  Groups as GroupsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { isHrAdmin, clearAuthToken, isDevMode } from '../../api/authService';

const MenuCallout: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    clearAuthToken();
    handleClose();
    if (isDevMode()) {
      navigate('/login');
    } else {
      // In non-dev mode, just clear token and reload
      window.location.reload();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'menu-callout-popover' : undefined;

  const mainMenuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts' },
  ];

  const performanceMenuItems = [
    { text: 'Goals', icon: <TrendingUpIcon />, path: '/goals' },
    { text: 'My Departments', icon: <GroupsIcon />, path: '/departments' },
    { text: 'Goal AI Assistant', icon: <AutoAwesomeIcon />, path: '/goal-ai' },
    { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
  ];

  const hrAdminMenuItems = isHrAdmin()
    ? [
        { text: 'HR Admin', icon: <BusinessIcon />, path: '/hr-admin' },
        { text: 'Bulk Upload', icon: <CloudUploadIcon />, path: '/bulk-upload' },
      ]
    : [];

  return (
    <>
      <Fab
        color="primary"
        aria-label="menu"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: 4,
        }}
      >
        <MenuIcon />
      </Fab>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 280,
            maxHeight: '80vh',
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
            boxShadow: 4,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
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

            <List dense>
              {mainMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
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
                        minWidth: 40,
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

            <List dense>
              {performanceMenuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigate(item.path)}
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
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {hrAdminMenuItems.length > 0 && (
              <>
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
                  HR Administration
                </Typography>
                <List dense>
                  {hrAdminMenuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                      <ListItemButton
                        selected={location.pathname === item.path}
                        onClick={() => handleNavigate(item.path)}
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
                            minWidth: 40,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {isDevMode() && (
              <>
                <Divider sx={{ my: 2 }} />
                <List dense>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={handleLogout}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'white',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: 'inherit',
                          minWidth: 40,
                        }}
                      >
                        <LogoutIcon />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </>
            )}
          </Box>
      </Popover>
    </>
  );
};

export default MenuCallout;


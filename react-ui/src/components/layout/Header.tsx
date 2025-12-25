import React, { useState, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  //Avatar,
  Badge,
  //InputBase,
} from '@mui/material';
import {
  Menu as MenuIcon,
  //Search as SearchIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  //Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearAuthToken, isDevMode } from '../../api/authService';

// Define the search context type
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Create search context
export const SearchContext = React.createContext<SearchContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
});

interface HeaderProps {
  onSearchChange?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearchChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [, setShowClearButton] = useState(false);

  const handleLogout = () => {
    clearAuthToken();
    if (isDevMode()) {
      navigate('/login');
    } else {
      // In non-dev mode, just clear token and reload
      window.location.reload();
    }
  };

  // Handle search input change
  // const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  //   const query = event.target.value;
  //   setSearchQuery(query);
  //   setShowClearButton(query.length > 0);
    
  //   // Notify parent component about search change
  //   if (onSearchChange) {
  //     onSearchChange(query);
  //   }
  // }, [onSearchChange]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setShowClearButton(false);
    
    // Notify parent component about cleared search
    if (onSearchChange) {
      onSearchChange('');
    }
  }, [onSearchChange]);

  // Handle search submission
  // const handleSearchSubmit = useCallback((event: React.FormEvent) => {
  //   event.preventDefault();
  //   // You can add additional search submission logic here
  //   console.log('Search submitted:', searchQuery);
  // }, [searchQuery]);

  const sidgsLogo = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <img 
          src="https://sidgs.com/wp-content/uploads/2023/02/SIDGS-Dark.svg" 
          alt="SIDGS Logo" 
          style={{ height: 40, cursor: 'pointer' }}
          onClick={() => {
            // Clear search when logo is clicked (optional)
            handleClearSearch();
          }}
        />
      </Typography>
    </Box>
  );

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {sidgsLogo}
            
            {/* Search Bar */}
            {/* <Box
              component="form"
              onSubmit={handleSearchSubmit}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                backgroundColor: 'background.default',
                borderRadius: 2,
                px: 2,
                py: 0.5,
                width: 350,
                position: 'relative',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <InputBase
                placeholder="Search performance metrics..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ flex: 1 }}
                inputProps={{ 'aria-label': 'search performance metrics' }}
              /> */}
              
              {/* Clear button (X) */}
              {/* {showClearButton && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                  aria-label="clear search"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )} */}
            {/* </Box> */}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="large">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton size="large">
              <HelpIcon />
            </IconButton>

            <IconButton 
              size="large" 
              onClick={handleLogout}
              title="Logout"
              sx={{ color: 'error.main' }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </SearchContext.Provider>
  );
};

export default Header;
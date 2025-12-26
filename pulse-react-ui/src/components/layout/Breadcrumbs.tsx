import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbName = (path: string) => {
    const breadcrumbMap: Record<string, string> = {
      '': 'Home',
      dashboard: 'Dashboard',
      performance: 'Performance',
      reviews: 'Reviews',
      goals: 'Goals & OKRs',
      feedback: 'Feedback',
      reports: 'Reports',
      team: 'Team Management',
      settings: 'Settings',
    };
    return breadcrumbMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <Link
        component={RouterLink}
        to="/"
        underline="hover"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        Home
      </Link>
      
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <Typography key={to} color="text.primary" fontWeight={500}>
            {getBreadcrumbName(value)}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            to={to}
            underline="hover"
            color="inherit"
            key={to}
          >
            {getBreadcrumbName(value)}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
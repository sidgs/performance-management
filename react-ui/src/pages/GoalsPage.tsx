import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  //SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Tabs,
  Tab,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  //Add as AddIcon,
  Search as SearchIcon,
  //Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  //Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Visibility as VisibilityIcon,
  //CalendarMonth as CalendarIcon,
} from '@mui/icons-material';

// Types based on your GraphQL schema
type GoalStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'ACHIEVED' | 'RETIRED';
type DepartmentStatus = 'ACTIVE' | 'DEPRECATED' | 'RETIRED';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department?: Department;
  manager?: User;
}

interface Department {
  id: string;
  name: string;
  smallDescription: string;
  owner: User;
  coOwner?: User;
  status: DepartmentStatus;
}

interface Goal {
  id: string;
  shortDescription: string;
  longDescription: string;
  owner: User;
  creationDate: string;
  completionDate?: string;
  status: GoalStatus;
  parentGoal?: Goal;
  childGoals: Goal[];
  assignedUsers: User[];
}

// Mock data based on your schema
const mockUsers: User[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@sidgs.com', title: 'Senior Manager' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@sidgs.com', title: 'Engineering Lead' },
  { id: '3', firstName: 'Michael', lastName: 'Chen', email: 'michael.c@sidgs.com', title: 'Product Manager' },
  { id: '4', firstName: 'Emma', lastName: 'Wilson', email: 'emma.w@sidgs.com', title: 'UX Designer' },
  { id: '5', firstName: 'David', lastName: 'Lee', email: 'david.l@sidgs.com', title: 'Software Engineer' },
];

// const mockDepartments: Department[] = [
//   { 
//     id: '1', 
//     name: 'Engineering', 
//     smallDescription: 'Software development and engineering', 
//     owner: mockUsers[0], 
//     status: 'ACTIVE' 
//   },
//   { 
//     id: '2', 
//     name: 'Product', 
//     smallDescription: 'Product management and strategy', 
//     owner: mockUsers[2], 
//     status: 'ACTIVE' 
//   },
// ];

const initialGoals: Goal[] = [
  {
    id: '1',
    shortDescription: 'Improve code quality standards',
    longDescription: 'Implement comprehensive code review processes and establish quality metrics for all engineering teams.',
    owner: mockUsers[0],
    creationDate: '2024-01-15',
    status: 'PUBLISHED',
    assignedUsers: [mockUsers[1], mockUsers[4]],
    childGoals: [
      {
        id: '1-1',
        shortDescription: 'Establish code review guidelines',
        longDescription: 'Create and document standard code review procedures for all teams.',
        owner: mockUsers[1],
        creationDate: '2024-01-20',
        status: 'ACHIEVED',
        assignedUsers: [mockUsers[4]],
        childGoals: [],
      },
      {
        id: '1-2',
        shortDescription: 'Implement automated testing',
        longDescription: 'Set up automated testing pipeline with 90% coverage target.',
        owner: mockUsers[1],
        creationDate: '2024-01-25',
        status: 'APPROVED',
        assignedUsers: [mockUsers[4]],
        childGoals: [],
      },
    ],
  },
  {
    id: '2',
    shortDescription: 'Launch new mobile application',
    longDescription: 'Develop and launch mobile app for iOS and Android platforms',
    owner: mockUsers[2],
    creationDate: '2024-02-01',
    status: 'APPROVED',
    assignedUsers: [mockUsers[1], mockUsers[3], mockUsers[4]],
    childGoals: [],
  },
  {
    id: '3',
    shortDescription: 'Increase customer satisfaction score',
    longDescription: 'Improve overall customer satisfaction through better support and product quality enhancements.',
    owner: mockUsers[0],
    creationDate: '2024-01-10',
    completionDate: '2024-03-31',
    status: 'ACHIEVED',
    assignedUsers: [mockUsers[2], mockUsers[3]],
    childGoals: [
      {
        id: '3-1',
        shortDescription: 'Customer feedback system',
        longDescription: 'Implement new customer feedback collection and analysis system.',
        owner: mockUsers[3],
        creationDate: '2024-01-12',
        status: 'ACHIEVED',
        assignedUsers: [],
        childGoals: [],
      },
    ],
  },
  {
    id: '4',
    shortDescription: 'Q1 Revenue Targets',
    longDescription: 'Achieve Q1 revenue targets through new customer acquisition and upselling.',
    owner: mockUsers[2],
    creationDate: '2024-01-05',
    status: 'DRAFT',
    assignedUsers: [mockUsers[0]],
    childGoals: [],
  },
  {
    id: '5',
    shortDescription: 'Team skill development program',
    longDescription: 'Develop comprehensive training program for engineering team skill enhancement.',
    owner: mockUsers[1],
    creationDate: '2024-02-10',
    status: 'RETIRED',
    assignedUsers: [mockUsers[4]],
    childGoals: [],
  },
];

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = 
      goal.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.longDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesOwner = filterOwner === 'all' || goal.owner.id === filterOwner;

    return matchesSearch && matchesStatus && matchesOwner;
  });

  // Get unique statuses for filter
  const statuses: GoalStatus[] = ['DRAFT', 'APPROVED', 'PUBLISHED', 'ACHIEVED', 'RETIRED'];

  // Status configuration
  const statusConfig = {
    DRAFT: { label: 'Draft', color: 'default' as const, icon: <DraftIcon /> },
    APPROVED: { label: 'Approved', color: 'info' as const, icon: <CheckCircleIcon /> },
    PUBLISHED: { label: 'Published', color: 'primary' as const, icon: <PublishedIcon /> },
    ACHIEVED: { label: 'Achieved', color: 'success' as const, icon: <CheckCircleIcon /> },
    RETIRED: { label: 'Retired', color: 'warning' as const, icon: <PendingIcon /> },
  };

  // Toggle goal expansion
  const toggleGoalExpansion = (goalId: string) => {
    const newExpanded = new Set(expandedGoals);
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId);
    } else {
      newExpanded.add(goalId);
    }
    setExpandedGoals(newExpanded);
  };

  // Handle view details
  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setOpenDialog(true);
  };

  // Handle delete goal
  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate progress based on child goals
  const calculateProgress = (goal: Goal): number => {
    if (goal.childGoals.length === 0) {
      return goal.status === 'ACHIEVED' ? 100 : 
             goal.status === 'RETIRED' ? 0 : 
             goal.status === 'DRAFT' ? 10 :
             goal.status === 'APPROVED' ? 30 : 60;
    }
    
    const completedChildren = goal.childGoals.filter(child => child.status === 'ACHIEVED').length;
    return Math.round((completedChildren / goal.childGoals.length) * 100);
  };

  // Custom Avatar Group Component
  const CustomAvatarGroup = ({ users, max = 3 }: { users: User[], max?: number }) => {
    const displayUsers = users.slice(0, max);
    const extraCount = users.length - max;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {displayUsers.map((user, index) => (
          <Tooltip key={user.id} title={`${user.firstName} ${user.lastName}`}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                border: '2px solid white',
                marginLeft: index > 0 ? '-8px' : 0,
                zIndex: displayUsers.length - index,
              }}
            >
              {user.firstName[0]}
            </Avatar>
          </Tooltip>
        ))}
        {extraCount > 0 && (
          <Tooltip title={`${extraCount} more user${extraCount !== 1 ? 's' : ''}`}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'grey.400',
                marginLeft: '-8px',
                fontSize: '0.75rem',
              }}
            >
              +{extraCount}
            </Avatar>
          </Tooltip>
        )}
      </Box>
    );
  };

  // Render goal hierarchy recursively
  const renderGoalHierarchy = (goal: Goal, level: number = 0) => {
    const progress = calculateProgress(goal);
    const hasChildren = goal.childGoals.length > 0;
    
    return (
      <Box key={goal.id}>
        <Card sx={{ mb: 1, ml: level * 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {hasChildren && (
                  <IconButton size="small" onClick={() => toggleGoalExpansion(goal.id)}>
                    {expandedGoals.has(goal.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {goal.shortDescription}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Chip
                      label={statusConfig[goal.status].label}
                      color={statusConfig[goal.status].color}
                      icon={statusConfig[goal.status].icon}
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Owner: {goal.owner.firstName} {goal.owner.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(goal.creationDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => handleViewDetails(goal)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {goal.longDescription}
            </Typography>

            {/* Progress and assigned users */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Progress</Typography>
                  <Typography variant="body2" fontWeight={500}>{progress}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: progress === 100 ? 'success.main' : 
                                     progress >= 70 ? 'primary.main' : 'warning.main',
                    },
                  }}
                />
              </Box>

              <Box>
                <CustomAvatarGroup users={goal.assignedUsers} max={3} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Child goals */}
        {hasChildren && expandedGoals.has(goal.id) && (
          <Box sx={{ ml: 4 }}>
            {goal.childGoals.map(childGoal => renderGoalHierarchy(childGoal, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  // Render goals in list view
  const renderGoalList = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Goal Description</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Assigned To</TableCell>
            <TableCell>Child Goals</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGoals.map((goal) => (
            <React.Fragment key={goal.id}>
              <TableRow>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {goal.shortDescription}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {goal.longDescription.substring(0, 100)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {goal.owner.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {goal.owner.firstName} {goal.owner.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {goal.owner.title}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={statusConfig[goal.status].label}
                    color={statusConfig[goal.status].color}
                    icon={statusConfig[goal.status].icon}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatDate(goal.creationDate)}
                </TableCell>
                <TableCell>
                  <CustomAvatarGroup users={goal.assignedUsers} max={3} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${goal.childGoals.length} child${goal.childGoals.length !== 1 ? 'ren' : ''}`}
                    variant="outlined"
                    size="small"
                    onClick={() => toggleGoalExpansion(goal.id)}
                    icon={expandedGoals.has(goal.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleViewDetails(goal)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDeleteGoal(goal.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
              
              {/* Child goals in table */}
              {goal.childGoals.length > 0 && expandedGoals.has(goal.id) && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ backgroundColor: 'grey.50', py: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Child Goals
                    </Typography>
                    <Box sx={{ ml: 2 }}>
                      {goal.childGoals.map(childGoal => (
                        <Card key={childGoal.id} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {childGoal.shortDescription}
                                </Typography>
                                <Chip
                                  label={statusConfig[childGoal.status].label}
                                  color={statusConfig[childGoal.status].color}
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                Owner: {childGoal.owner.firstName} {childGoal.owner.lastName}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Goals Management
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Define, track, and manage organizational goals with hierarchical structure.
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Goals
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {goals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All statuses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Published
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {goals.filter(g => g.status === 'PUBLISHED').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Achieved
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {goals.filter(g => g.status === 'ACHIEVED').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Draft
              </Typography>
              <Typography variant="h3" fontWeight={700} color="default">
                {goals.filter(g => g.status === 'DRAFT').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Hierarchical
              </Typography>
              <Typography variant="h3" fontWeight={700} color="info.main">
                {goals.filter(g => g.childGoals.length > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                With child goals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {statusConfig[status].label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Owner</InputLabel>
                <Select
                  value={filterOwner}
                  label="Owner"
                  onChange={(e) => setFilterOwner(e.target.value)}
                >
                  <MenuItem value="all">All Owners</MenuItem>
                  {mockUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'list' ? 'hierarchy' : 'list')}
                startIcon={viewMode === 'list' ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              >
                {viewMode === 'list' ? 'Hierarchy View' : 'List View'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              {/* <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => alert('Create Goal functionality will be implemented with API integration')}
              >
                New Goal
              </Button> */}
            </Grid>
          </Grid>

          {/* View Tabs */}
          <Box sx={{ mt: 3 }}>
            <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
              <Tab label="All Goals" />
              <Tab label="My Goals" />
              <Tab label="Team Goals" />
              <Tab label="Root Goals" />
            </Tabs>
          </Box>
        </CardContent>
      </Card>

      {/* Goals Display */}
      {filteredGoals.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No goals found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search or filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
                setFilterOwner('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {viewMode === 'list' ? (
            renderGoalList()
          ) : (
            <Box>
              {filteredGoals.map(goal => renderGoalHierarchy(goal))}
            </Box>
          )}
        </Box>
      )}

      {/* Goal Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedGoal && (
          <>
            <DialogTitle>
              <Typography variant="h5" component="div">
                {selectedGoal.shortDescription}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {selectedGoal.id}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Status:</strong></Typography>
                      <Chip
                        label={statusConfig[selectedGoal.status].label}
                        color={statusConfig[selectedGoal.status].color}
                        icon={statusConfig[selectedGoal.status].icon}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Created:</strong> {formatDate(selectedGoal.creationDate)}</Typography>
                    </Grid>
                    {selectedGoal.completionDate && (
                      <Grid item xs={6}>
                        <Typography variant="body2"><strong>Completed:</strong> {formatDate(selectedGoal.completionDate)}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Child Goals:</strong> {selectedGoal.childGoals.length}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedGoal.longDescription}</Typography>
                </Box>

                {/* Owner Info */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Goal Owner
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                          {selectedGoal.owner.firstName[0]}{selectedGoal.owner.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {selectedGoal.owner.firstName} {selectedGoal.owner.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedGoal.owner.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedGoal.owner.email}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Assigned Users */}
                {selectedGoal.assignedUsers.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Assigned Users ({selectedGoal.assignedUsers.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {selectedGoal.assignedUsers.map((user) => (
                        <Grid item xs={12} sm={6} key={user.id}>
                          <Card variant="outlined">
                            <CardContent sx={{ py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: 'secondary.main' }}>
                                  {user.firstName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2">
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.title}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Child Goals */}
                {selectedGoal.childGoals.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Child Goals ({selectedGoal.childGoals.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Owner</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedGoal.childGoals.map((child) => (
                            <TableRow key={child.id}>
                              <TableCell>{child.shortDescription}</TableCell>
                              <TableCell>
                                <Chip
                                  label={statusConfig[child.status].label}
                                  color={statusConfig[child.status].color}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {child.owner.firstName} {child.owner.lastName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* API Integration Note */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>API Integration Ready:</strong> This component is built to match your GraphQL schema.
                    Replace mock data with API calls to `goals`, `goalsByOwner`, and `rootGoals` queries.
                  </Typography>
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => alert('Edit functionality will be implemented with API integration')}
              >
                Edit Goal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GoalsPage;
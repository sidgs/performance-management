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
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

// Types
interface Goal {
  id: number;
  title: string;
  quarter: string;
  status: 'on-track' | 'at-risk' | 'completed' | 'not-started';
  progress: number;
  owner: string;
  type: 'company' | 'team' | 'individual';
  startDate: string;
  endDate: string;
  description: string;
  keyResults: KeyResult[];
}

interface KeyResult {
  id: number;
  title: string;
  progress: number;
  target: string;
  current: string;
  owner: string;
}

// Static data - will be replaced with API call later
const initialGoals: Goal[] = [
  {
    id: 1,
    title: 'Increase customer satisfaction score to 95%',
    quarter: 'Q1 2024',
    status: 'on-track',
    progress: 85,
    owner: 'Sarah Johnson',
    type: 'company',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Improve overall customer satisfaction through better support and product quality',
    keyResults: [
      { id: 1, title: 'CSAT score improvement', progress: 90, target: '95%', current: '88%', owner: 'Support Team' },
      { id: 2, title: 'Response time under 2 hours', progress: 85, target: '100%', current: '92%', owner: 'Support Team' },
      { id: 3, title: 'Product bug resolution', progress: 80, target: '95%', current: '87%', owner: 'Engineering' },
    ],
  },
  {
    id: 2,
    title: 'Launch new mobile application',
    quarter: 'Q2 2024',
    status: 'at-risk',
    progress: 65,
    owner: 'Michael Chen',
    type: 'team',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    description: 'Develop and launch mobile app for iOS and Android platforms',
    keyResults: [
      { id: 1, title: 'iOS app development', progress: 70, target: '100%', current: '70%', owner: 'Mobile Team' },
      { id: 2, title: 'Android app development', progress: 60, target: '100%', current: '60%', owner: 'Mobile Team' },
      { id: 3, title: 'App store submission', progress: 0, target: 'Completed', current: 'Not started', owner: 'Product Team' },
    ],
  },
  {
    id: 3,
    title: 'Reduce server costs by 20%',
    quarter: 'Q1 2024',
    status: 'completed',
    progress: 100,
    owner: 'David Lee',
    type: 'team',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Optimize cloud infrastructure and reduce operational costs',
    keyResults: [
      { id: 1, title: 'Infrastructure optimization', progress: 100, target: 'Completed', current: 'Completed', owner: 'DevOps' },
      { id: 2, title: 'Cost monitoring setup', progress: 100, target: 'Completed', current: 'Completed', owner: 'Finance' },
    ],
  },
  {
    id: 4,
    title: 'Improve employee engagement score',
    quarter: 'Q3 2024',
    status: 'not-started',
    progress: 0,
    owner: 'Emma Wilson',
    type: 'company',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    description: 'Enhance workplace satisfaction and employee retention',
    keyResults: [
      { id: 1, title: 'Employee survey score', progress: 0, target: '85%', current: '78%', owner: 'HR Team' },
      { id: 2, title: 'Training hours per employee', progress: 0, target: '40 hrs', current: '25 hrs', owner: 'HR Team' },
    ],
  },
  {
    id: 5,
    title: 'Increase revenue by 30%',
    quarter: 'Q2 2024',
    status: 'on-track',
    progress: 75,
    owner: 'Alex Turner',
    type: 'company',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    description: 'Drive revenue growth through new customer acquisition and upselling',
    keyResults: [
      { id: 1, title: 'New customer acquisition', progress: 80, target: '100', current: '65', owner: 'Sales Team' },
      { id: 2, title: 'Existing customer revenue', progress: 70, target: '150%', current: '120%', owner: 'Account Managers' },
    ],
  },
  {
    id: 6,
    title: 'Complete professional certification',
    quarter: 'Q1 2024',
    status: 'completed',
    progress: 100,
    owner: 'John Doe',
    type: 'individual',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Obtain AWS Solutions Architect certification',
    keyResults: [
      { id: 1, title: 'Training completion', progress: 100, target: '100%', current: '100%', owner: 'John Doe' },
      { id: 2, title: 'Exam passed', progress: 100, target: 'Passed', current: 'Passed', owner: 'John Doe' },
    ],
  },
];

const GoalsOKRsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuarter, setFilterQuarter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Filter goals based on search and filters
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         goal.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesQuarter = filterQuarter === 'all' || goal.quarter === filterQuarter;
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesType = filterType === 'all' || goal.type === filterType;

    return matchesSearch && matchesQuarter && matchesStatus && matchesType;
  });

  // Get unique quarters for filter
  const quarters = Array.from(new Set(goals.map(goal => goal.quarter)));

  // Status chip colors
  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'on-track': return 'primary';
      case 'at-risk': return 'warning';
      case 'not-started': return 'default';
      default: return 'default';
    }
  };

  // Status chip icons
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon fontSize="small" />;
      case 'on-track': return <TrendingUpIcon fontSize="small" />;
      case 'at-risk': return <WarningIcon fontSize="small" />;
      case 'not-started': return <PendingIcon fontSize="small" />;
      default: return null;
    }
  };

  // Type chip display
  const getTypeDisplay = (type: Goal['type']) => {
    switch (type) {
      case 'company': return { label: 'Company', icon: <TrendingUpIcon fontSize="small" /> };
      case 'team': return { label: 'Team', icon: <GroupIcon fontSize="small" /> };
      case 'individual': return { label: 'Individual', icon: <PersonIcon fontSize="small" /> };
      default: return { label: type, icon: null };
    }
  };

  // Handle goal click for expansion
  const handleGoalClick = (goalId: number) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  // Handle view details
  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setOpenDialog(true);
  };

  // Handle delete goal (for demo purposes)
  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== goalId));
    }
  };

  // Calculate overall progress for a goal
  const calculateOverallProgress = (keyResults: KeyResult[]) => {
    if (keyResults.length === 0) return 0;
    const totalProgress = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
    return Math.round(totalProgress / keyResults.length);
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Goals & OKRs
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Track and manage your objectives and key results across the organization.
        </Typography>
      </Box>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Goals
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {goals.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all quarters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                On Track
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {goals.filter(g => g.status === 'on-track').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round((goals.filter(g => g.status === 'on-track').length / goals.length) * 100)}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                At Risk
              </Typography>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {goals.filter(g => g.status === 'at-risk').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Needs attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {goals.filter(g => g.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This quarter
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
                <InputLabel>Quarter</InputLabel>
                <Select
                  value={filterQuarter}
                  label="Quarter"
                  onChange={(e: SelectChangeEvent) => setFilterQuarter(e.target.value)}
                >
                  <MenuItem value="all">All Quarters</MenuItem>
                  {quarters.map((quarter) => (
                    <MenuItem key={quarter} value={quarter}>{quarter}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e: SelectChangeEvent) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="not-started">Not Started</MenuItem>
                  <MenuItem value="on-track">On Track</MenuItem>
                  <MenuItem value="at-risk">At Risk</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e: SelectChangeEvent) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="team">Team</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => alert('Add Goal functionality will be implemented later')}
              >
                Add Goal
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Goals List */}
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
                setFilterQuarter('all');
                setFilterStatus('all');
                setFilterType('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredGoals.map((goal) => (
            <Grid item xs={12} key={goal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h5" component="div">
                          {goal.title}
                        </Typography>
                        <Chip
                          label={goal.status.replace('-', ' ')}
                          color={getStatusColor(goal.status)}
                          //icon={getStatusIcon(goal.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          label={goal.quarter}
                          icon={<CalendarIcon fontSize="small" />}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={getTypeDisplay(goal.type).label}
                          //icon={getTypeDisplay(goal.type).icon}
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Owner: <strong>{goal.owner}</strong>
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {goal.description}
                      </Typography>

                      {/* Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">Overall Progress</Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {calculateOverallProgress(goal.keyResults)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={calculateOverallProgress(goal.keyResults)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: goal.status === 'completed' ? 'success.main' :
                                            goal.status === 'on-track' ? 'primary.main' :
                                            goal.status === 'at-risk' ? 'warning.main' : 'grey.400',
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(goal)}
                        title="View Details"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Delete Goal"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Expandable Key Results Section */}
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => handleGoalClick(goal.id)}
                    sx={{ mt: 1 }}
                  >
                    {expandedGoal === goal.id ? 'Hide' : 'Show'} Key Results ({goal.keyResults.length})
                  </Button>

                  {expandedGoal === goal.id && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Key Results
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Key Result</TableCell>
                              <TableCell>Owner</TableCell>
                              <TableCell>Progress</TableCell>
                              <TableCell>Current / Target</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {goal.keyResults.map((kr) => (
                              <TableRow key={kr.id}>
                                <TableCell>{kr.title}</TableCell>
                                <TableCell>{kr.owner}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={kr.progress}
                                      sx={{
                                        flex: 1,
                                        height: 6,
                                        borderRadius: 3,
                                      }}
                                    />
                                    <Typography variant="body2">{kr.progress}%</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {kr.current} / {kr.target}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={kr.progress === 100 ? 'Completed' : kr.progress >= 70 ? 'On Track' : 'At Risk'}
                                    size="small"
                                    color={kr.progress === 100 ? 'success' : kr.progress >= 70 ? 'primary' : 'warning'}
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
                {selectedGoal.title}
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
                      <Typography variant="body2"><strong>Quarter:</strong> {selectedGoal.quarter}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Type:</strong> {selectedGoal.type}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Owner:</strong> {selectedGoal.owner}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        <strong>Status:</strong>{' '}
                        <Chip
                          label={selectedGoal.status.replace('-', ' ')}
                          color={getStatusColor(selectedGoal.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>Start Date:</strong> {selectedGoal.startDate}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><strong>End Date:</strong> {selectedGoal.endDate}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Description */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">{selectedGoal.description}</Typography>
                </Box>

                {/* Key Results */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Results
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Key Result</TableCell>
                          <TableCell>Owner</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Current / Target</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedGoal.keyResults.map((kr) => (
                          <TableRow key={kr.id}>
                            <TableCell>{kr.title}</TableCell>
                            <TableCell>{kr.owner}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={kr.progress}
                                  sx={{
                                    flex: 1,
                                    height: 6,
                                    borderRadius: 3,
                                  }}
                                />
                                <Typography variant="body2">{kr.progress}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {kr.current} / {kr.target}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* API Integration Note */}
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>API Integration Note:</strong> This data is currently static. 
                    In the next phase, this will be replaced with real-time data from the backend API.
                  </Typography>
                </Alert>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button variant="contained" onClick={() => alert('Edit functionality will be implemented later')}>
                Edit Goal
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GoalsOKRsPage;
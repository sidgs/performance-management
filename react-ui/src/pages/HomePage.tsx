import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  InputBase,
  IconButton,
  TextField,
  Paper,
  Fade,
  Slide,
  Badge,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  //TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  //NotificationsActive as NotificationsActiveIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseChatIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  PublishedWithChanges as PublishedIcon,
  Drafts as DraftIcon,
  Add as AddIcon,
} from '@mui/icons-material';

import { graphqlRequest } from '../api/graphqlClient';
import { getCurrentUserEmail } from '../api/authService';
import type { Goal, GoalStatus, User } from '../types';

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// GraphQL-backed data will be loaded on mount

// Calculate progress for a goal
const calculateGoalProgress = (goal: Goal): number => {
  if (goal.childGoals.length === 0) {
    return goal.status === 'ACHIEVED' ? 100 : 
           goal.status === 'RETIRED' ? 0 : 
           goal.status === 'DRAFT' ? 10 :
           goal.status === 'APPROVED' ? 30 : 60;
  }
  
  const completedChildren = goal.childGoals.filter(child => child.status === 'ACHIEVED').length;
  return Math.round((completedChildren / goal.childGoals.length) * 100);
};

// Status configuration
const statusConfig = {
  DRAFT: { label: 'Draft', color: 'default' as const, icon: <DraftIcon /> },
  APPROVED: { label: 'Approved', color: 'info' as const, icon: <CheckCircleIcon /> },
  PUBLISHED: { label: 'Published', color: 'primary' as const, icon: <PublishedIcon /> },
  ACHIEVED: { label: 'Achieved', color: 'success' as const, icon: <CheckCircleIcon /> },
  RETIRED: { label: 'Retired', color: 'warning' as const, icon: <PendingIcon /> },
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hello! I'm your Performance Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Create goal dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSubGoal, setIsSubGoal] = useState(false);
  const [selectedParentGoal, setSelectedParentGoal] = useState<string>('');
  const [newGoalShortDesc, setNewGoalShortDesc] = useState('');
  const [newGoalLongDesc, setNewGoalLongDesc] = useState('');
  const [newGoalOwnerEmail, setNewGoalOwnerEmail] = useState('');
  const [newGoalStatus, setNewGoalStatus] = useState<GoalStatus>('DRAFT');
  const [createGoalLoading, setCreateGoalLoading] = useState(false);
  const [createGoalError, setCreateGoalError] = useState<string | null>(null);

  // Load goals/users from GraphQL
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await graphqlRequest<{ goals: Goal[]; users: User[] }>(
          `
            query GetDashboardData {
              goals {
                id
                shortDescription
                longDescription
                creationDate
                completionDate
                status
                owner {
                  id
                  firstName
                  lastName
                  email
                  title
                }
                childGoals {
                  id
                  status
                }
                assignedUsers {
                  id
                  firstName
                  lastName
                  email
                  title
                }
              }
              users {
                id
                firstName
                lastName
                email
                title
              }
            }
          `,
        );

        const loadedGoals = data.goals ?? [];
        const loadedUsers = data.users ?? [];
        setGoals(loadedGoals);
        setUsers(loadedUsers);
        setFilteredGoals(loadedGoals);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        // Only log the error, don't redirect - let App.tsx handle authentication state
        console.error('Error loading dashboard data:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Update owner email when users are loaded and dialog is open
  useEffect(() => {
    if (createDialogOpen && !newGoalOwnerEmail && users.length > 0) {
      // Get the logged-in user's email from JWT token
      const currentUserEmail = getCurrentUserEmail();
      
      // Try to find the logged-in user in the users list, otherwise use first user
      let defaultOwnerEmail = users[0].email;
      if (currentUserEmail) {
        const currentUser = users.find(user => user.email.toLowerCase() === currentUserEmail.toLowerCase());
        if (currentUser) {
          defaultOwnerEmail = currentUser.email;
        }
      }
      
      setNewGoalOwnerEmail(defaultOwnerEmail);
    }
  }, [createDialogOpen, users, newGoalOwnerEmail]);

  // Filter goals based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGoals(goals);
      setShowAll(true);
    } else {
      const filtered = goals.filter(goal =>
        goal.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.longDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.owner.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.owner.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGoals(filtered);
      setShowAll(false);
    }
  }, [searchQuery]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && isChatOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isChatOpen]);

  // Handle new bot messages when chat opens
  useEffect(() => {
    if (isChatOpen && unreadMessages > 0) {
      setUnreadMessages(0);
    }
  }, [isChatOpen, unreadMessages]);

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowAll(true);
  };

  // Chatbot functions (unchanged)
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Simulate API call
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: chatMessages.length + 2,
        text: "We are processing your request.",
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setChatMessages(prev => [...prev, botResponse]);
      
      // Increment unread count if chat is closed
      if (!isChatOpen) {
        setUnreadMessages(prev => prev + 1);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  // Calculate dashboard statistics from goals data
  const stats = [
    {
      title: 'Total Goals',
      value: goals.length.toString(),
      change: '+2',
      icon: <AssessmentIcon />,
      color: 'primary.main',
    },
    {
      title: 'Goals Published',
      value: goals.filter(g => g.status === 'PUBLISHED').length.toString(),
      change: '+1',
      icon: <PublishedIcon />,
      color: 'secondary.main',
    },
    {
      title: 'Goals Achieved',
      value: goals.filter(g => g.status === 'ACHIEVED').length.toString(),
      change: '+3',
      icon: <CheckCircleIcon />,
      color: 'success.main',
    },
    {
      title: 'Active Users',
      value: users.length.toString(),
      change: '+2',
      icon: <PeopleIcon />,
      color: 'info.main',
    },
  ];

  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  // Generate recent activities from actual goals data
  const recentActivities = React.useMemo(() => {
    const activities: Array<{ user: string; action: string; time: string }> = [];
    
    // Sort goals by creation date (most recent first) and take recent updates
    const sortedGoals = [...goals].sort((a, b) => 
      new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
    ).slice(0, 4);
    
    sortedGoals.forEach((goal) => {
      const ownerName = `${goal.owner.firstName} ${goal.owner.lastName}`;
      const timeAgo = getTimeAgo(goal.creationDate);
      let action = '';
      
      switch (goal.status) {
        case 'ACHIEVED':
          action = `achieved ${goal.shortDescription.toLowerCase()}`;
          break;
        case 'APPROVED':
          action = `approved ${goal.shortDescription.toLowerCase()}`;
          break;
        case 'PUBLISHED':
          action = `published ${goal.shortDescription.toLowerCase()}`;
          break;
        default:
          action = `created ${goal.shortDescription.toLowerCase()}`;
      }
      
      activities.push({
        user: ownerName,
        action,
        time: timeAgo,
      });
    });
    
    return activities;
  }, [goals]);

  const handleExploreGoals = () => {
    navigate('/goals');
  };

  // Handle create goal dialog
  const handleOpenCreateDialog = (asSubGoal: boolean = false) => {
    if (users.length === 0) {
      setCreateGoalError('No users available. Please wait for users to load or create a user first.');
      return;
    }
    
    // Get the logged-in user's email from JWT token
    const currentUserEmail = getCurrentUserEmail();
    
    // Try to find the logged-in user in the users list, otherwise use first user
    let defaultOwnerEmail = users[0].email;
    if (currentUserEmail) {
      const currentUser = users.find(user => user.email.toLowerCase() === currentUserEmail.toLowerCase());
      if (currentUser) {
        defaultOwnerEmail = currentUser.email;
      }
    }
    
    setIsSubGoal(asSubGoal);
    setSelectedParentGoal('');
    setNewGoalShortDesc('');
    setNewGoalLongDesc('');
    setNewGoalOwnerEmail(defaultOwnerEmail);
    setNewGoalStatus('DRAFT');
    setCreateGoalError(null);
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setCreateGoalError(null);
  };

  // Handle create goal mutation
  const handleCreateGoal = async () => {
    if (!newGoalShortDesc.trim() || !newGoalLongDesc.trim() || !newGoalOwnerEmail.trim()) {
      setCreateGoalError('Please fill in all required fields');
      return;
    }

    if (isSubGoal && !selectedParentGoal) {
      setCreateGoalError('Please select a parent goal for the sub-goal');
      return;
    }

    setCreateGoalLoading(true);
    setCreateGoalError(null);

    try {
      const mutation = `
        mutation CreateGoal($input: GoalInput!) {
          createGoal(input: $input) {
            id
            shortDescription
            longDescription
            creationDate
            completionDate
            status
            owner {
              id
              firstName
              lastName
              email
              title
            }
            parentGoal {
              id
            }
            childGoals {
              id
              status
            }
            assignedUsers {
              id
              firstName
              lastName
              email
              title
            }
          }
        }
      `;

      const variables = {
        input: {
          shortDescription: newGoalShortDesc.trim(),
          longDescription: newGoalLongDesc.trim(),
          ownerEmail: newGoalOwnerEmail.trim(),
          status: newGoalStatus,
          parentGoalId: isSubGoal && selectedParentGoal ? selectedParentGoal : null,
        },
      };

      await graphqlRequest<{ createGoal: Goal }>(mutation, variables);
      
      // Refresh goals list
      const refreshData = await graphqlRequest<{ goals: Goal[]; users: User[] }>(
        `
          query GetDashboardData {
            goals {
              id
              shortDescription
              longDescription
              creationDate
              completionDate
              status
              owner {
                id
                firstName
                lastName
                email
                title
              }
              childGoals {
                id
                status
              }
              assignedUsers {
                id
                firstName
                lastName
                email
                title
              }
            }
            users {
              id
              firstName
              lastName
              email
              title
            }
          }
        `,
      );

      setGoals(refreshData.goals ?? []);
      setUsers(refreshData.users ?? []);
      setFilteredGoals(refreshData.goals ?? []);
      
      handleCloseCreateDialog();
    } catch (err) {
      setCreateGoalError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setCreateGoalLoading(false);
    }
  };

  return (
    <Box>
      {/* Floating Chatbot Button */}
      <Fade in={!isChatOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          <Badge
            badgeContent={unreadMessages}
            color="error"
            invisible={unreadMessages === 0}
          >
            <Button
              variant="contained"
              onClick={toggleChat}
              startIcon={<ChatIcon />}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50px',
                px: 3,
                py: 1.5,
                boxShadow: 3,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s',
                },
              }}
            >
              Performance Assistant
            </Button>
          </Badge>
        </Box>
      </Fade>

      {/* Chatbot Interface - UNCHANGED */}
      <Slide direction="up" in={isChatOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 380,
            height: 500,
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BotIcon />
              <Typography variant="h6" fontWeight={600}>
                Performance Assistant
              </Typography>
            </Box>
            <IconButton onClick={toggleChat} size="small" sx={{ color: 'white' }}>
              <CloseChatIcon />
            </IconButton>
          </Box>

          {/* Chat Messages */}
          <Box
            ref={chatContainerRef}
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              backgroundColor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {chatMessages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    maxWidth: '80%',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main',
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      backgroundColor: message.sender === 'user' ? 'primary.light' : 'white',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      borderTopLeftRadius: message.sender === 'user' ? 12 : 4,
                      borderTopRightRadius: message.sender === 'user' ? 4 : 12,
                    }}
                  >
                    <Typography variant="body2">{message.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        textAlign: message.sender === 'user' ? 'right' : 'left',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Chat Input */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'grey.300',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Press Enter to send, Shift+Enter for new line
            </Typography>
          </Box>
        </Paper>
      </Slide>

      {/* Hero Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Performance Intelligence
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Track, manage, and achieve organizational goals with AI-driven insights.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleExploreGoals}
          sx={{ mr: 2 }}
        >
          Explore Goals
        </Button>
        {/* <Button variant="outlined" size="large">
          View Analytics
        </Button> */}
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}15`,
                      borderRadius: 2,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                  </Box>
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  sx={{
                    backgroundColor: stat.change.startsWith('+')
                      ? 'success.light'
                      : 'error.light',
                    color: stat.change.startsWith('+')
                      ? 'success.dark'
                      : 'error.dark',
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Goals Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Goals Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track organizational goals and progress toward objectives
                  </Typography>
                </Box>
                
                {/* Search within Goals Overview */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'background.default',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    width: 250,
                    position: 'relative',
                  }}
                >
                  <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  <InputBase
                    placeholder="Search goals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                    inputProps={{ 'aria-label': 'search performance items' }}
                  />
                  {searchQuery && (
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
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Box>
              
              {/* Goals List */}
              <Box sx={{ mt: 3 }}>
                {loading && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading goals...
                    </Typography>
                  </Box>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {!loading && !error && showAll ? (
                  // Show all goals
                  goals.map((goal) => {
                    const progress = calculateGoalProgress(goal);
                    return (
                      <Box key={goal.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight={500}>
                                {goal.shortDescription}
                              </Typography>
                              <Chip
                                label={statusConfig[goal.status].label}
                                color={statusConfig[goal.status].color}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Owner: {goal.owner.firstName} {goal.owner.lastName} • Created: {formatDate(goal.creationDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {goal.longDescription.substring(0, 120)}...
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={500}>
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progress === 100 ? 'success.main' : 
                                             progress >= 70 ? 'primary.main' : 'warning.main',
                              borderRadius: 4,
                            },
                          }}
                        />
                        {goal.assignedUsers.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Assigned to:
                            </Typography>
                            <AvatarGroup max={3}>
                              {goal.assignedUsers.map((user) => (
                                <Avatar
                                  key={user.id}
                                  sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}
                                >
                                  {user.firstName[0]}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </Box>
                        )}
                      </Box>
                    );
                  })
                ) : !loading && !error && filteredGoals.length > 0 ? (
                  // Show filtered goals
                  filteredGoals.map((goal) => {
                    const progress = calculateGoalProgress(goal);
                    return (
                      <Box key={goal.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="body1" fontWeight={500}>
                                {goal.shortDescription}
                              </Typography>
                              <Chip
                                label={statusConfig[goal.status].label}
                                color={statusConfig[goal.status].color}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Owner: {goal.owner.firstName} {goal.owner.lastName} • Created: {formatDate(goal.creationDate)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {goal.longDescription.substring(0, 120)}...
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={500}>
                            {progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progress === 100 ? 'success.main' : 
                                             progress >= 70 ? 'primary.main' : 'warning.main',
                              borderRadius: 4,
                            },
                          }}
                        />
                        {goal.assignedUsers.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Assigned to:
                            </Typography>
                            <AvatarGroup max={3}>
                              {goal.assignedUsers.map((user) => (
                                <Avatar
                                  key={user.id}
                                  sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}
                                >
                                  {user.firstName[0]}
                                </Avatar>
                              ))}
                            </AvatarGroup>
                          </Box>
                        )}
                      </Box>
                    );
                  })
                ) : (
                  // No results found
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No results found for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try searching for: Improve code quality, Launch mobile app, Customer satisfaction, etc.
                    </Typography>
                    <Button 
                      onClick={handleClearSearch} 
                      sx={{ mt: 2 }}
                      startIcon={<CloseIcon />}
                    >
                      Clear Search
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Latest goal updates and team activities
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {recentActivities.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentActivities.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                      {activity.user.split(' ')[0][0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        <strong>{activity.user}</strong> {activity.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Active Users */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Team Members
                </Typography>
                <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                  {/* {mockUsers.map((user) => (
                    <Tooltip key={user.id} title={`${user.firstName} ${user.lastName}`}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {user.firstName[0]}
                      </Avatar>
                    </Tooltip>
                  ))} */}
                </AvatarGroup>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {users.length} team members managing goals
                </Typography>
              </Box>

              {/* Goal Status Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Goal Status Distribution
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = goals.filter(g => g.status === status).length;
                    const percentage = goals.length
                      ? Math.round((count / goals.length) * 100)
                      : 0;
                    return (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: config.color }}>{config.icon}</Box>
                          <Typography variant="body2">{config.label}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {count} ({percentage}%)
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CTA Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to achieve your organizational goals?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track progress, assign responsibilities, and drive success with our comprehensive goals management platform.
        </Typography>
        <Button variant="contained" size="large">
          Explore All Goals
        </Button>
      </Box>

      {/* Create Goal Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isSubGoal ? 'Create New Sub-Goal' : 'Create New Goal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {createGoalError && (
              <Alert severity="error">{createGoalError}</Alert>
            )}

            {isSubGoal && (
              <FormControl fullWidth>
                <InputLabel>Parent Goal</InputLabel>
                <Select
                  value={selectedParentGoal}
                  label="Parent Goal"
                  onChange={(e) => setSelectedParentGoal(e.target.value)}
                >
                  {goals.map((goal) => (
                    <MenuItem key={goal.id} value={goal.id}>
                      {goal.shortDescription}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Short Description"
              value={newGoalShortDesc}
              onChange={(e) => setNewGoalShortDesc(e.target.value)}
              required
              placeholder="e.g., Improve code quality standards"
            />

            <TextField
              fullWidth
              label="Long Description"
              value={newGoalLongDesc}
              onChange={(e) => setNewGoalLongDesc(e.target.value)}
              required
              multiline
              rows={4}
              placeholder="Provide a detailed description of the goal..."
            />

            <FormControl fullWidth required>
              <InputLabel>Owner</InputLabel>
              <Select
                value={newGoalOwnerEmail}
                label="Owner"
                onChange={(e) => setNewGoalOwnerEmail(e.target.value)}
                required
                error={!newGoalOwnerEmail}
              >
                {users.length === 0 ? (
                  <MenuItem disabled value="">
                    No users available
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem key={user.id} value={user.email}>
                      {user.firstName} {user.lastName} ({user.email})
                    </MenuItem>
                  ))
                )}
              </Select>
              {users.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  No users found. Please create a user first.
                </Typography>
              )}
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newGoalStatus}
                label="Status"
                onChange={(e) => setNewGoalStatus(e.target.value as GoalStatus)}
              >
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="ACHIEVED">Achieved</MenuItem>
                <MenuItem value="RETIRED">Retired</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={createGoalLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateGoal}
            variant="contained"
            disabled={createGoalLoading}
            startIcon={<AddIcon />}
          >
            {createGoalLoading ? 'Creating...' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomePage;
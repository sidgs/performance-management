import React, { useState, useEffect, useRef, } from 'react';
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
} from '@mui/icons-material';

// Types based on your GraphQL schema
type GoalStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED' | 'ACHIEVED' | 'RETIRED';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
}

interface Goal {
  id: string;
  shortDescription: string;
  longDescription: string;
  owner: User;
  creationDate: string;
  completionDate?: string;
  status: GoalStatus;
  childGoals: Goal[];
  assignedUsers: User[];
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Mock data from GoalsPage
const mockUsers: User[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@sidgs.com', title: 'Senior Manager' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@sidgs.com', title: 'Engineering Lead' },
  { id: '3', firstName: 'Michael', lastName: 'Chen', email: 'michael.c@sidgs.com', title: 'Product Manager' },
  { id: '4', firstName: 'Emma', lastName: 'Wilson', email: 'emma.w@sidgs.com', title: 'UX Designer' },
  { id: '5', firstName: 'David', lastName: 'Lee', email: 'david.l@sidgs.com', title: 'Software Engineer' },
];

const mockGoals: Goal[] = [
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
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>(mockGoals);
  const [showAll, setShowAll] = useState(true);
  
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

  // Filter goals based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGoals(mockGoals);
      setShowAll(true);
    } else {
      const filtered = mockGoals.filter(goal =>
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
      value: mockGoals.length.toString(),
      change: '+2',
      icon: <AssessmentIcon />,
      color: 'primary.main',
    },
    {
      title: 'Goals Published',
      value: mockGoals.filter(g => g.status === 'PUBLISHED').length.toString(),
      change: '+1',
      icon: <PublishedIcon />,
      color: 'secondary.main',
    },
    {
      title: 'Goals Achieved',
      value: mockGoals.filter(g => g.status === 'ACHIEVED').length.toString(),
      change: '+3',
      icon: <CheckCircleIcon />,
      color: 'success.main',
    },
    {
      title: 'Active Users',
      value: mockUsers.length.toString(),
      change: '+2',
      icon: <PeopleIcon />,
      color: 'info.main',
    },
  ];

  // Recent activities from goal updates
  const recentActivities = [
    { user: 'Sarah Johnson', action: 'completed code review guidelines', time: '2 hours ago' },
    { user: 'Michael Chen', action: 'approved mobile app launch goal', time: '4 hours ago' },
    { user: 'Emma Wilson', action: 'achieved customer feedback system goal', time: '1 day ago' },
    { user: 'David Lee', action: 'assigned to improve code quality standards', time: '2 days ago' },
  ];

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExploreGoals = () => {
    navigate('/goals');
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
                {showAll ? (
                  // Show all goals
                  mockGoals.map((goal) => {
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
                ) : filteredGoals.length > 0 ? (
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
                  {mockUsers.length} team members managing goals
                </Typography>
              </Box>

              {/* Goal Status Summary */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Goal Status Distribution
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const count = mockGoals.filter(g => g.status === status).length;
                    const percentage = Math.round((count / mockGoals.length) * 100);
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
    </Box>
  );
};

export default HomePage;
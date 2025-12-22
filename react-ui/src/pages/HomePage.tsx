import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  AvatarGroup,
  Avatar,
  InputBase,
  IconButton,
  TextField,
  Paper,
  Fade,
  Slide,
  Badge,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  NotificationsActive as NotificationsActiveIcon,
  ArrowForward as ArrowForwardIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseChatIcon,
} from '@mui/icons-material';

interface PerformanceItem {
  id: number;
  title: string;
  progress: number;
  description: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPerformance, setFilteredPerformance] = useState<PerformanceItem[]>([]);
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

  // Performance items data
  const performanceItems: PerformanceItem[] = [
    { id: 1, title: 'Q1 Goals', progress: 85, description: 'Quarter 1 objectives and targets' },
    { id: 2, title: 'Skill Development', progress: 92, description: 'Employee skill enhancement programs' },
    { id: 3, title: 'Project Delivery', progress: 78, description: 'Timely project completion metrics' },
    { id: 4, title: 'Team Collaboration', progress: 95, description: 'Teamwork and cooperation metrics' },
    { id: 5, title: 'Client Satisfaction', progress: 88, description: 'Client feedback and satisfaction scores' },
    { id: 6, title: 'Innovation Initiatives', progress: 75, description: 'New ideas and innovation projects' },
  ];

  // Filter performance items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPerformance(performanceItems);
      setShowAll(true);
    } else {
      const filtered = performanceItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPerformance(filtered);
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

  // Chatbot functions
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

  // Stats data
  const stats = [
    {
      title: 'Overall Performance',
      value: '87%',
      change: '+5.2%',
      icon: <TrendingUpIcon />,
      color: 'primary.main',
    },
    {
      title: 'Active Reviews',
      value: '42',
      change: '+12',
      icon: <AssessmentIcon />,
      color: 'secondary.main',
    },
    {
      title: 'Pending Feedback',
      value: '18',
      change: '-3',
      icon: <NotificationsActiveIcon />,
      color: 'warning.main',
    },
    {
      title: 'Team Members',
      value: '156',
      change: '+8',
      icon: <PeopleIcon />,
      color: 'success.main',
    },
  ];

  // Recent activities
  const recentActivities = [
    { user: 'Sarah Johnson', action: 'completed quarterly review', time: '2 hours ago' },
    { user: 'Michael Chen', action: 'submitted performance goals', time: '4 hours ago' },
    { user: 'Emma Wilson', action: 'gave feedback to team member', time: '1 day ago' },
    { user: 'David Lee', action: 'updated OKRs for Q1', time: '2 days ago' },
  ];

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

      {/* Chatbot Interface */}
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
          AI-driven insights to elevate your team's performance. 
          Built on a foundation of absolute trust.
        </Typography>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ mr: 2 }}
        >
          Get Started
        </Button>
        <Button variant="outlined" size="large">
          View Demo
        </Button>
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
        {/* Performance Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Performance Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Track team performance metrics and progress toward goals
                  </Typography>
                </Box>
                
                {/* Search within Performance Overview */}
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
                    placeholder="Search items..."
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
              
              {/* Performance Items */}
              <Box sx={{ mt: 3 }}>
                {showAll ? (
                  // Show all items
                  performanceItems.map((item) => (
                    <Box key={item.id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {item.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.progress >= 80 ? 'success.main' : 
                                           item.progress >= 60 ? 'primary.main' : 'warning.main',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ))
                ) : filteredPerformance.length > 0 ? (
                  // Show filtered items
                  filteredPerformance.map((item) => (
                    <Box key={item.id} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {item.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: item.progress >= 80 ? 'success.main' : 
                                           item.progress >= 60 ? 'primary.main' : 'warning.main',
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  ))
                ) : (
                  // No results found
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No results found for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try searching for: Q1 Goals, Skill Development, Project Delivery, etc.
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
                Latest updates from your team
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

              {/* Team Avatar Group */}
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Team Members
                </Typography>
                <AvatarGroup max={6} sx={{ justifyContent: 'flex-start' }}>
                  {['JD', 'SJ', 'MC', 'EW', 'DL', 'AB', 'KR', 'PT'].map((initials, index) => (
                    <Avatar
                      key={index}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: [
                          'primary.main',
                          'secondary.main',
                          'success.main',
                          'warning.main',
                          'error.main',
                          'info.main',
                        ][index % 6],
                      }}
                    >
                      {initials}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* CTA Section */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to accelerate your team's performance?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Join 100+ Fortune 500 companies transforming their workforce with our platform.
        </Typography>
        <Button variant="contained" size="large">
          Schedule a Demo
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
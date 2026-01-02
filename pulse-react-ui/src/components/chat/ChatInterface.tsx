import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
  Button,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  agent_name?: string;
  fileName?: string;
  fileType?: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, file?: File) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { userRoles } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if ((inputMessage.trim() || selectedFile) && !isLoading && sessionId) {
      onSendMessage(inputMessage.trim(), selectedFile || undefined);
      setInputMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['text/csv', 'application/pdf', 'text/plain'];
      const allowedExtensions = ['.csv', '.pdf', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      const isValidType = allowedTypes.includes(file.type) || 
                         allowedExtensions.includes(fileExtension);
      
      if (!isValidType) {
        alert('Only CSV, PDF, and TXT files are allowed.');
        e.target.value = '';
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (!isLoading && sessionId) {
      onSendMessage(prompt);
    }
  };

  const suggestedPrompts = [
    "Show me my goals",
    "Create a new goal",
    "Help me manage my team's performance",
    "What are my KPIs?",
    "List all departments",
  ];

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '600px',
      }}
    >
      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
              px: 2,
            }}
          >
            <AgentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              How can I help you today?
            </Typography>
            <Stack
              direction="column"
              spacing={1.5}
              sx={{
                width: '100%',
                maxWidth: '500px',
                alignItems: 'center',
              }}
            >
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handlePromptClick(prompt)}
                  disabled={!sessionId || isLoading}
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="body1" sx={{ textAlign: 'left' }}>
                    {prompt}
                  </Typography>
                </Button>
              ))}
            </Stack>
          </Box>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                justifyContent={isUser ? 'flex-end' : 'flex-start'}
                alignItems="flex-start"
                sx={{ width: '100%' }}
              >
                {!isUser && (
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <AgentIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: isUser ? 'primary.main' : 'background.paper',
                    color: isUser ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      '& p': {
                        margin: 0,
                        marginBottom: 1,
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& ul, & ol': {
                        margin: 0,
                        marginBottom: 1,
                        paddingLeft: 2,
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& li': {
                        marginBottom: 0.5,
                        '&:last-child': {
                          marginBottom: 0,
                        },
                      },
                      '& strong': {
                        fontWeight: 600,
                      },
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        marginTop: 0,
                        marginBottom: 1,
                        fontWeight: 600,
                        '&:first-of-type': {
                          marginTop: 0,
                        },
                      },
                      '& code': {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace',
                      },
                      '& pre': {
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                        padding: '8px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        marginBottom: 1,
                        '& code': {
                          backgroundColor: 'transparent',
                          padding: 0,
                        },
                      },
                      '& blockquote': {
                        borderLeft: `3px solid ${isUser ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)'}`,
                        paddingLeft: 1,
                        marginLeft: 0,
                        marginRight: 0,
                        fontStyle: 'italic',
                        opacity: 0.9,
                      },
                      wordBreak: 'break-word',
                    }}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </Box>
                  {message.fileName && (
                    <Chip
                      label={message.fileName}
                      size="small"
                      sx={{
                        mt: 0.5,
                        fontSize: '0.7rem',
                        height: 20,
                      }}
                    />
                  )}
                  {message.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                      }}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  )}
                </Paper>
                {isUser && (
                  <Avatar
                    sx={{
                      bgcolor: 'secondary.main',
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                )}
              </Stack>
            );
          })
        )}
        {isLoading && (
          <Stack direction="row" spacing={1} justifyContent="flex-start">
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 32,
                height: 32,
              }}
            >
              <AgentIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 2,
              }}
            >
              <CircularProgress size={16} />
            </Paper>
          </Stack>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {selectedFile && (
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={selectedFile.name}
              onDelete={handleRemoveFile}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              ({Math.round(selectedFile.size / 1024)} KB)
            </Typography>
          </Box>
        )}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.pdf,.txt"
            style={{ display: 'none' }}
            disabled={!sessionId || isLoading}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={!sessionId || isLoading}
            sx={{ mb: 0.5 }}
          >
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder={sessionId ? "Type your message..." : "Select a session to start chatting"}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!sessionId || isLoading}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={(!inputMessage.trim() && !selectedFile) || !sessionId || isLoading}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
        {/* User Roles Display */}
        {userRoles.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
              Roles:
            </Typography>
            {userRoles.map((role, index) => (
              <Chip
                key={index}
                label={role}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatInterface;


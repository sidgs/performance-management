import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AgentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  agent_name?: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  messages,
  isLoading,
  onSendMessage,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading && sessionId) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            }}
          >
            <AgentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">
              Start a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Send a message to begin chatting with Pulse AI
            </Typography>
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
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {message.content}
                  </Typography>
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
        <Stack direction="row" spacing={1} alignItems="flex-end">
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
            disabled={!inputMessage.trim() || !sessionId || isLoading}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

export default ChatInterface;


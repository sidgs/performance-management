import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import type { SessionInfo } from '../../api/agentService';

interface SessionListProps {
  sessions: SessionInfo[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isLoading = false,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const truncateSessionId = (sessionId: string) => {
    if (sessionId.length <= 12) return sessionId;
    return `${sessionId.substring(0, 8)}...`;
  };

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (onDeleteSession) {
      onDeleteSession(sessionId);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon color="primary" />
          Sessions
        </Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateSession}
          disabled={isLoading}
          sx={{ mt: 1 }}
        >
          New Session
        </Button>
      </Box>

      {/* Sessions List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              No sessions yet. Create a new session to start chatting.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {sessions.map((session, index) => {
              const isSelected = session.session_id === selectedSessionId;
              return (
                <React.Fragment key={session.session_id}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      onDeleteSession && (
                        <Tooltip title="Delete session">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => handleDelete(e, session.session_id)}
                            sx={{ mr: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => onSelectSession(session.session_id)}
                      sx={{
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '& .MuiListItemText-primary': {
                            color: 'primary.contrastText',
                          },
                          '& .MuiListItemText-secondary': {
                            color: 'primary.contrastText',
                            opacity: 0.8,
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={isSelected ? 600 : 500}>
                              {truncateSessionId(session.session_id)}
                            </Typography>
                            {session.interaction_count > 0 && (
                              <Chip
                                label={session.interaction_count}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'primary.light',
                                  color: isSelected ? 'primary.contrastText' : 'primary.contrastText',
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {formatDate(session.created_at)}
                            </Typography>
                            {session.is_expired && (
                              <Chip
                                label="Expired"
                                size="small"
                                color="error"
                                sx={{ mt: 0.5, height: 18, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < sessions.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer Info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </Typography>
      </Box>
    </Box>
  );
};

export default SessionList;


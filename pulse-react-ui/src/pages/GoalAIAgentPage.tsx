import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Grid,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import {
  createSession,
  listSessions,
  getSessionState,
  sendChatMessage,
  sendChatMessageWithFile,
  deleteSession,
  getUserIdFromToken,
  type SessionInfo,
  type ChatResponse,
} from '../api/agentService';
import { useAuth } from '../contexts/AuthContext';
import ChatInterface from '../components/chat/ChatInterface';
import SessionList from '../components/chat/SessionList';
import type { ChatMessage } from '../components/chat/ChatInterface';

const GoalAIAgentPage: React.FC = () => {
  const { userEmail, userName } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Map<string, ChatMessage[]>>(new Map());
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Initialize page and create/fetch sessions
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user ID from token
        const extractedUserId = getUserIdFromToken();
        if (!extractedUserId) {
          throw new Error('Unable to extract user ID from token. Please log in again.');
        }
        setUserId(extractedUserId);

        // Fetch existing sessions
        let fetchedSessions: SessionInfo[] = [];
        try {
          const sessionsResponse = await listSessions();
          fetchedSessions = sessionsResponse.sessions || [];
          setSessions(fetchedSessions);
        } catch (err) {
          console.error('Error fetching sessions:', err);
          // Continue even if session fetch fails
          fetchedSessions = [];
          setSessions([]);
        }

        // Auto-create a new session if none exist
        if (fetchedSessions.length === 0) {
          const sessionResponse = await createSession(extractedUserId, userEmail || undefined, userName || undefined);
          const newSessionId = sessionResponse.session_id;
          
          // Refresh sessions list
          try {
            const sessionsResponse = await listSessions();
            const updatedSessions = sessionsResponse.sessions || [];
            setSessions(updatedSessions);
            setSelectedSessionId(newSessionId);
            
            // Initialize empty messages for new session
            setMessages((prev) => {
              const newMap = new Map(prev);
              newMap.set(newSessionId, []);
              return newMap;
            });
          } catch (err) {
            console.error('Error refreshing sessions after creation:', err);
            // Still set the session ID even if refresh fails
            setSelectedSessionId(newSessionId);
            setMessages((prev) => {
              const newMap = new Map(prev);
              newMap.set(newSessionId, []);
              return newMap;
            });
          }
        } else {
          // Select the first session if available
          const firstSessionId = fetchedSessions[0]?.session_id;
          setSelectedSessionId(firstSessionId || null);
          // Load messages for the first session
          if (firstSessionId) {
            await loadSessionMessages(firstSessionId, extractedUserId);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize page';
        setError(errorMessage);
        console.error('Error initializing Pulse AI page:', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, []); // Only run on mount

  // Load messages for a session
  const loadSessionMessages = useCallback(async (sessionId: string, currentUserId: string) => {
    try {
      const sessionState = await getSessionState(sessionId, currentUserId);
      const history = sessionState.state.interaction_history || [];
      
      const chatMessages: ChatMessage[] = history.map((item) => ({
        role: item.role,
        content: item.content,
        timestamp: item.timestamp,
        agent_name: item.agent_name,
      }));

      setMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(sessionId, chatMessages);
        return newMap;
      });
    } catch (err) {
      console.error('Error loading session messages:', err);
      // Initialize empty messages for this session
      setMessages((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(sessionId)) {
          newMap.set(sessionId, []);
        }
        return newMap;
      });
    }
  }, []);

  // Handle creating a new session
  const handleCreateSession = useCallback(async () => {
    if (!userId || isCreatingSession) return;

    setIsCreatingSession(true);
    try {
      const response = await createSession(userId, userEmail || undefined, userName || undefined);
      const newSessionId = response.session_id;

      // Fetch updated sessions list
      const sessionsResponse = await listSessions();
      setSessions(sessionsResponse.sessions || []);

      // Select the new session
      setSelectedSessionId(newSessionId);
      
      // Initialize empty messages for new session
      setMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(newSessionId, []);
        return newMap;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      console.error('Error creating session:', err);
    } finally {
      setIsCreatingSession(false);
    }
  }, [userId, isCreatingSession, userEmail, userName]);

  // Handle selecting a session
  const handleSelectSession = useCallback(async (sessionId: string) => {
    if (!userId) return;

    setSelectedSessionId(sessionId);
    
    // Load messages if not already loaded
    if (!messages.has(sessionId)) {
      await loadSessionMessages(sessionId, userId);
    }
  }, [userId, messages, loadSessionMessages]);

  // Handle sending a chat message
  const handleSendMessage = useCallback(async (message: string, file?: File) => {
    if (!selectedSessionId || !userId || isLoadingChat) return;
    if (!message.trim() && !file) return;

    setIsLoadingChat(true);

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: message || (file ? `Uploaded file: ${file.name}` : ''),
      timestamp: new Date().toISOString(),
      fileName: file?.name,
      fileType: file?.type,
    };

    setMessages((prev) => {
      const newMap = new Map(prev);
      const sessionMessages = newMap.get(selectedSessionId) || [];
      newMap.set(selectedSessionId, [...sessionMessages, userMessage]);
      return newMap;
    });

    try {
      const response: ChatResponse = file
        ? await sendChatMessageWithFile(selectedSessionId, userId, message || '', file)
        : await sendChatMessage(selectedSessionId, userId, message);

      // Add agent response to UI
      const agentMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        agent_name: response.agent_name,
      };

      setMessages((prev) => {
        const newMap = new Map(prev);
        const sessionMessages = newMap.get(selectedSessionId) || [];
        newMap.set(selectedSessionId, [...sessionMessages, agentMessage]);
        return newMap;
      });

      // Refresh sessions to update interaction count
      try {
        const sessionsResponse = await listSessions();
        setSessions(sessionsResponse.sessions || []);
      } catch (err) {
        console.error('Error refreshing sessions:', err);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      
      // Add error message to chat
      const errorMessageObj: ChatMessage = {
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const newMap = new Map(prev);
        const sessionMessages = newMap.get(selectedSessionId) || [];
        newMap.set(selectedSessionId, [...sessionMessages, errorMessageObj]);
        return newMap;
      });

      console.error('Error sending message:', err);
    } finally {
      setIsLoadingChat(false);
    }
  }, [selectedSessionId, userId, isLoadingChat]);

  // Handle deleting a session
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (!userId) {
      console.error('Cannot delete session: user ID not available');
      return;
    }

    try {
      // Call the API to delete the session
      await deleteSession(sessionId, userId);
      
      // If deleting selected session, select another one or create new
      if (sessionId === selectedSessionId) {
        const otherSessions = sessions.filter((s) => s.session_id !== sessionId);
        if (otherSessions.length > 0) {
          setSelectedSessionId(otherSessions[0].session_id);
        } else {
          setSelectedSessionId(null);
          await handleCreateSession();
        }
      }

      // Remove from sessions list
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      
      // Remove messages
      setMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(sessionId);
        return newMap;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      console.error('Error deleting session:', err);
      setError(`Failed to delete session: ${errorMessage}`);
      // Don't remove from local state if API call failed
    }
  }, [selectedSessionId, sessions, userId, handleCreateSession]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const currentMessages = selectedSessionId ? (messages.get(selectedSessionId) || []) : [];

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h1" gutterBottom>
              Pulse AI
            </Typography>
            <Typography variant="h5" color="text.secondary">
              Chat with your AI agent to manage goals, get insights, and more
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Chat Interface */}
      <Grid container spacing={0} sx={{ height: 'calc(100vh - 250px)', minHeight: '600px', alignItems: 'stretch' }}>
        {/* Session List Sidebar */}
        <Grid 
          item 
          xs={12} 
          md={sidebarCollapsed ? 0.5 : 3.5} 
          sx={{ 
            height: '100%',
            display: { xs: sidebarCollapsed ? 'none' : 'block', md: 'block' }
          }}
        >
          <Box sx={{ height: '100%' }}>
            <SessionList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelectSession={handleSelectSession}
              onCreateSession={handleCreateSession}
              onDeleteSession={handleDeleteSession}
              isLoading={isCreatingSession}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </Box>
        </Grid>

        {/* Chat Interface */}
        <Grid 
          item 
          xs={12} 
          md={sidebarCollapsed ? 11.5 : 8.5} 
          sx={{ height: '100%' }}
        >
          <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
            <ChatInterface
              sessionId={selectedSessionId}
              messages={currentMessages}
              isLoading={isLoadingChat}
              onSendMessage={handleSendMessage}
            />
          </Box>
        </Grid>
      </Grid>

      {/* Error Alert (if any) */}
      {error && userId && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default GoalAIAgentPage;

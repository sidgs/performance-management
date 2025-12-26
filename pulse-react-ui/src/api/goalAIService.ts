import { getAuthToken, getCurrentUserEmail, getCurrentUserRoles } from './authService';
import {
  createSession,
  sendChatMessage,
  getUserIdFromToken,
  getUserNameFromToken,
  type ChatResponse,
} from './agentService';
import type { Goal } from '../types';

/**
 * Service for interacting with the Pulse AI backend API
 * 
 * This service provides a higher-level interface for goal-specific AI interactions.
 * For direct chat functionality, use the agentService directly.
 */

interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface AgentResponse {
  message: string;
  insights?: string[];
  recommendations?: string[];
  relatedGoals?: Goal[];
  metadata?: Record<string, unknown>;
}

interface AgentContext {
  userEmail: string;
  userRoles: string[];
  authToken: string;
  availableGoals: Goal[];
}

/**
 * Get the current user context to pass to the AI agent
 * This includes user email, roles, auth token, and available goals
 */
export async function getAgentContext(): Promise<AgentContext | null> {
  try {
    const email = getCurrentUserEmail();
    const roles = getCurrentUserRoles();
    const token = await getAuthToken();

    if (!email || !token) {
      console.error('Missing user email or auth token');
      return null;
    }

    // TODO: Fetch user's goals when needed
    // For now, return context without goals - they can be fetched separately
    const availableGoals: Goal[] = [];

    return {
      userEmail: email,
      userRoles: roles,
      authToken: token,
      availableGoals,
    };
  } catch (error) {
    console.error('Error getting agent context:', error);
    return null;
  }
}

/**
 * Send a message to the AI agent and get a response
 * 
 * @param message - The user's message/query
 * @param conversationHistory - Optional conversation history for context (not used directly, session maintains history)
 * @param sessionId - Optional session ID. If not provided, a new session will be created.
 * @returns Agent response with insights, recommendations, etc.
 */
export async function sendMessageToAgent(
  message: string,
  conversationHistory?: AgentMessage[],
  sessionId?: string
): Promise<AgentResponse> {
  const context = await getAgentContext();
  if (!context) {
    throw new Error('Unable to get user context for agent');
  }

  const userId = getUserIdFromToken();
  if (!userId) {
    throw new Error('Unable to get user ID from token');
  }

  // If no session ID provided, create a new session
  let currentSessionId = sessionId;
  if (!currentSessionId) {
    const userEmail = getCurrentUserEmail();
    const userName = getUserNameFromToken();
    const sessionResponse = await createSession(userId, userEmail || undefined, userName || undefined);
    currentSessionId = sessionResponse.session_id;
  }

  // Send message to agent
  const chatResponse: ChatResponse = await sendChatMessage(currentSessionId, userId, message);

  // Transform response to match expected interface
  return {
    message: chatResponse.response,
    insights: [],
    recommendations: [],
    relatedGoals: [],
    metadata: {
      sessionId: currentSessionId,
      agentName: chatResponse.agent_name,
    },
  };
}

/**
 * Get insights about user's goals from the AI agent
 * 
 * @param goalIds - Optional array of goal IDs to get insights for (if empty, analyzes all user goals)
 * @returns Insights about the goals
 */
export async function getGoalInsights(goalIds?: string[]): Promise<string[]> {
  // TODO: Implement actual API call
  // This will call the agent with user context and goal data

  const context = await getAgentContext();
  if (!context) {
    throw new Error('Unable to get user context for agent');
  }

  // Placeholder
  return [];
}

/**
 * Get recommendations from the AI agent based on user's goals and progress
 * 
 * @returns Recommendations for improving goal achievement
 */
export async function getRecommendations(): Promise<string[]> {
  // TODO: Implement actual API call
  // The agent will analyze user's goals, progress, and provide recommendations

  const context = await getAgentContext();
  if (!context) {
    throw new Error('Unable to get user context for agent');
  }

  // Placeholder
  return [];
}

/**
 * Ask the agent to perform an action on a goal (e.g., update status, add KPI, etc.)
 * The agent will use the user's auth token to make authenticated API calls
 * 
 * @param action - The action to perform (e.g., 'updateStatus', 'addKPI', etc.)
 * @param goalId - The ID of the goal to act on
 * @param parameters - Additional parameters for the action
 * @returns Result of the action
 */
export async function performGoalAction(
  action: string,
  goalId: string,
  parameters?: Record<string, unknown>
): Promise<{ success: boolean; message: string; data?: unknown }> {
  // TODO: Implement actual API call
  // The agent will receive the action request along with user context and auth token
  // It will then make the appropriate backend API call on behalf of the user

  const context = await getAgentContext();
  if (!context) {
    throw new Error('Unable to get user context for agent');
  }

  // Placeholder
  return {
    success: false,
    message: 'Agent action integration coming soon',
  };
}

/**
 * Initialize a conversation session with the AI agent
 * This sets up the agent with user context and available goals
 * 
 * @returns Session ID for the conversation
 */
export async function initializeAgentSession(): Promise<string> {
  const context = await getAgentContext();
  if (!context) {
    throw new Error('Unable to get user context for agent');
  }

  const userId = getUserIdFromToken();
  if (!userId) {
    throw new Error('Unable to get user ID from token');
  }

  const userEmail = getCurrentUserEmail();
  const userName = getUserNameFromToken();
  const sessionResponse = await createSession(userId, userEmail || undefined, userName || undefined);
  
  return sessionResponse.session_id;
}


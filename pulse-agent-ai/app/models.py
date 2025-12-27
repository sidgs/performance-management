"""Pydantic models for request/response validation."""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class CreateSessionRequest(BaseModel):
    """Request model for creating a new session."""
    user_id: str = Field(..., description="Unique identifier for the user", example="user123")
    user_email: Optional[str] = Field(None, description="User's email address", example="john.doe@example.com")
    user_name: Optional[str] = Field(None, description="User's display name", example="John Doe")


class CreateSessionResponse(BaseModel):
    """Response model for session creation."""
    session_id: str = Field(..., description="Unique identifier for the created session", example="session-uuid-123")
    message: str = Field(..., description="Success message", example="Session created successfully")


class ChatRequest(BaseModel):
    """Request model for sending a chat message to the agent."""
    message: str = Field(..., description="The message to send to the agent", example="Create a goal for improving customer satisfaction")
    file_content: Optional[str] = Field(None, description="Base64 encoded file content")
    file_name: Optional[str] = Field(None, description="Name of the uploaded file")
    file_type: Optional[str] = Field(None, description="MIME type of the uploaded file")


class ChatResponse(BaseModel):
    """Response model for chat messages."""
    response: str = Field(..., description="The agent's response text", example="I've created a goal for improving customer satisfaction...")
    agent_name: Optional[str] = Field(None, description="Name of the agent that generated the response", example="pulse_performance_agent")


class SessionStateResponse(BaseModel):
    """Response model for session state."""
    session_id: str = Field(..., description="The session ID", example="session-uuid-123")
    state: dict = Field(..., description="The current session state including JWT token and interaction history")


class SessionInfo(BaseModel):
    """Information about a session."""
    session_id: str = Field(..., description="The session ID", example="session-uuid-123")
    user_id: str = Field(..., description="The user ID that owns the session", example="user123")
    user_email: Optional[str] = Field(None, description="User's email from session state", example="john.doe@example.com")
    user_name: Optional[str] = Field(None, description="User's name from session state", example="John Doe")
    token_expiration: Optional[str] = Field(None, description="Token expiration time in ISO format", example="2024-12-31T23:59:59+00:00")
    is_expired: bool = Field(..., description="Whether the session token has expired", example=False)
    interaction_count: int = Field(..., description="Number of interactions in the session", example=5)
    created_at: Optional[str] = Field(None, description="Session creation time if available", example="2024-01-01T00:00:00+00:00")


class SessionsListResponse(BaseModel):
    """Response model for listing sessions."""
    user_id: str = Field(..., description="The user ID", example="user123")
    total_sessions: int = Field(..., description="Total number of sessions", example=3)
    active_sessions: int = Field(..., description="Number of active (non-expired) sessions", example=2)
    sessions: List[SessionInfo] = Field(..., description="List of sessions for the user")


class EndpointInfo(BaseModel):
    """Information about an API endpoint."""
    method: str = Field(..., description="HTTP method", example="POST")
    path: str = Field(..., description="Endpoint path", example="/api/v1/pulse-epm-agent/sessions")
    summary: str = Field(..., description="Brief summary of the endpoint")
    description: str = Field(..., description="Detailed description of what the endpoint does")
    requires_auth: bool = Field(..., description="Whether the endpoint requires authentication")
    parameters: Optional[List[Dict[str, Any]]] = Field(None, description="List of parameters")
    example_request: Optional[Dict[str, Any]] = Field(None, description="Example request body")
    example_response: Optional[Dict[str, Any]] = Field(None, description="Example response")


class UsageResponse(BaseModel):
    """Response model for the usage endpoint."""
    service_name: str = Field(..., description="Name of the service")
    version: str = Field(..., description="API version")
    base_path: str = Field(..., description="Base path for all endpoints")
    endpoints: List[EndpointInfo] = Field(..., description="List of available endpoints")
    authentication_info: Dict[str, str] = Field(..., description="Information about authentication requirements")


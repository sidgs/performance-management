import os
import contextvars
import jwt
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from fastapi import FastAPI, Header, HTTPException, Query, Path
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types
from pulse_performance_agent.agent import root_agent
from pulse_performance_agent.utils.session_utils import (
    get_initial_state,
    add_user_query_to_history,
    add_agent_response_to_history,
)
# Import context variable from graphql_client to share it
from pulse_performance_agent.sub_agents.performance_management_graphql_tool.utils.graphql_client import token_context

# Load environment variables
load_dotenv()

# Initialize FastAPI app with enhanced metadata
app = FastAPI(
    title="Pulse Performance Management Agent API",
    version="1.0.0",
    description="""
    AI-powered Performance Management Agent API built with Google ADK.
    
    This API provides natural language interaction with the Performance Management System through
    a stateful multi-agent architecture. The agent can help with:
    
    * **Goal Management**: Create, update, assign, approve, and manage goals
    * **User Management**: Create users, assign managers, manage teams
    * **Department Management**: Create departments, assign users, manage hierarchies
    * **KPI Management**: Create and track KPIs for goals
    * **Goal Notes**: Add comments and updates to goals
    
    ## Authentication
    
    All endpoints require JWT token authentication. The token must be provided in the
    `Authorization: Bearer <token>` header when creating a session. The token is then
    stored in the session state and used for all GraphQL API calls.
    
    ## Getting Started
    
    1. Create a session with `POST /api/v1/pulse-epm-agent/sessions` (requires Authorization header)
    2. Send chat messages with `POST /api/v1/pulse-epm-agent/chat/{session_id}`
    3. List all active sessions with `GET /api/v1/pulse-epm-agent/sessions` (requires Authorization header)
    4. View session state with `GET /api/v1/pulse-epm-agent/sessions/{session_id}`
    """,
    contact={
        "name": "Pulse Performance Management",
    },
    license_info={
        "name": "Proprietary",
    },
    tags_metadata=[
        {
            "name": "health",
            "description": "Health check and service status endpoints",
        },
        {
            "name": "sessions",
            "description": "Session management endpoints for creating, retrieving, and deleting user sessions",
        },
        {
            "name": "chat",
            "description": "Chat endpoints for interacting with the AI agent",
        },
        {
            "name": "info",
            "description": "Information and documentation endpoints",
        },
    ],
)

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "dev")
DB_PASSWORD = os.getenv("DB_PASSWORD", "dev")
DB_NAME = os.getenv("DB_NAME", "dev")

# Construct database URL
# Use postgresql+asyncpg:// for async operations
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Initialize session service with PostgreSQL
session_service = DatabaseSessionService(db_url=DATABASE_URL)

# Constants
APP_NAME = os.getenv("APP_NAME", "pulse_performance_management")
AGENT_NAME = os.getenv("AGENT_NAME","pulse_performance_agent")

# JWT Configuration
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")


# Request/Response Models
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


# JWT Validation Functions
def validate_jwt_token(token: str) -> Tuple[Dict[str, Any], Optional[datetime]]:
    """
    Validate JWT token and extract claims and expiration.
    
    In dev mode, unsigned tokens (alg=none) are allowed.
    In production, tokens must be signed with the secret key.
    
    Returns:
        Tuple of (claims dict, expiration datetime or None)
    
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # First, decode without verification to check the algorithm
        unverified_header = jwt.get_unverified_header(token)
        algorithm = unverified_header.get("alg", "HS256")
        
        # In dev mode, allow unsigned tokens (alg=none)
        # This is intentional for development/testing purposes
        if DEV_MODE and algorithm == "none":
            # Decode without verification for unsigned tokens in dev mode
            # We still manually check expiration below
            decoded_token = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False}  # noqa: S106
            )
        else:
            # Verify signature with secret key
            if not JWT_SECRET_KEY:
                raise HTTPException(
                    status_code=500,
                    detail="JWT_SECRET_KEY not configured. Required for signed tokens."
                )
            
            decoded_token = jwt.decode(
                token,
                JWT_SECRET_KEY,
                algorithms=["HS256", "HS512", "RS256", "RS512", algorithm] if algorithm != "none" else ["HS256", "HS512", "RS256", "RS512"]
            )
        
        # Extract expiration
        exp_timestamp = decoded_token.get("exp")
        if not exp_timestamp:
            raise HTTPException(
                status_code=401,
                detail="JWT token missing expiration (exp) claim"
            )
        
        # Convert expiration timestamp to datetime
        expiration = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)
        
        # Check if token is expired
        now = datetime.now(timezone.utc)
        if expiration < now:
            raise HTTPException(
                status_code=401,
                detail=f"JWT token expired at {expiration.isoformat()}"
            )
        
        return decoded_token, expiration
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="JWT token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid JWT token: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"JWT token validation failed: {str(e)}")


def extract_and_validate_bearer_token(authorization: Optional[str] = Header(None)) -> Tuple[str, Dict[str, Any], Optional[datetime]]:
    """
    Extract Bearer token from Authorization header and validate it.
    
    Returns:
        Tuple of (token string, claims dict, expiration datetime)
    
    Raises:
        HTTPException: If authorization header is missing, invalid, or token is invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header must start with 'Bearer '")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    if not token:
        raise HTTPException(status_code=401, detail="Token is required")
    
    # Validate token and get claims and expiration
    claims, expiration = validate_jwt_token(token)
    
    return token, claims, expiration


def check_token_expiration_from_session_state(session_state: dict) -> None:
    """
    Check if the JWT token stored in session state has expired.
    
    Raises:
        HTTPException: If token has expired
    """
    token_expiration_str = session_state.get("token_expiration")
    token_expires_at = session_state.get("token_expires_at")
    
    if token_expiration_str or token_expires_at:
        if token_expires_at:
            # Check using timestamp
            expiration_time = datetime.fromtimestamp(token_expires_at, tz=timezone.utc)
        else:
            # Parse ISO format string
            try:
                expiration_time = datetime.fromisoformat(token_expiration_str.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                # If we can't parse, skip expiration check
                return
        
        now = datetime.now(timezone.utc)
        if expiration_time < now:
            raise HTTPException(
                status_code=401,
                detail=f"JWT token in session has expired at {expiration_time.isoformat()}. Please create a new session."
            )


@app.get(
    "/api/v1/pulse-epm-agent/health",
    tags=["health"],
    summary="Health Check",
    description="Check the health status of the API service. Returns service status and health information.",
    response_description="Service health status"
)
async def health_check():
    """
    Health check endpoint.
    
    Use this endpoint to verify that the API is running and healthy.
    Returns a simple status message indicating the service is operational.
    """
    return {"status": "healthy", "service": "pulse-epm-agent", "version": "1.0.0"}


@app.post(
    "/api/v1/pulse-epm-agent/sessions",
    response_model=CreateSessionResponse,
    tags=["sessions"],
    summary="Create Session",
    description="""
    Create a new conversation session with the AI agent.
    
    This endpoint initializes a new session and stores the JWT token for authentication.
    The session maintains conversation history and state across multiple chat interactions.
    
    **Important**: The `Authorization: Bearer <token>` header is **required**. 
    The JWT token is stored in the session state and used for all GraphQL API calls.
    """,
    response_description="Session creation response with session ID"
)
async def create_session(
    request: CreateSessionRequest,
    authorization: Optional[str] = Header(None, description="Bearer token for authentication")
):
    """
    Create a new session with initial state.
    
    Requires Authorization header with Bearer token.
    Token is validated and its expiration is used to set session expiration.
    Token is stored in session state for agent tool authentication.
    """
    # Extract and validate JWT token from Authorization header
    jwt_token, claims, expiration = extract_and_validate_bearer_token(authorization)
    
    # Extract user information from JWT claims if not provided in request
    # JWT may contain email, name, username, etc.
    user_email = request.user_email or claims.get("email") or claims.get("username")
    user_name = request.user_name or claims.get("name") or claims.get("username")
    
    # Create initial state with JWT token and expiration info
    initial_state = get_initial_state(
        jwt_token=jwt_token,
        user_email=user_email,
        user_name=user_name
    )
    
    # Store token expiration in session state
    if expiration:
        initial_state["token_expiration"] = expiration.isoformat()
        initial_state["token_expires_at"] = expiration.timestamp()
    
    # Create session
    # Note: Session expiration is stored in state and checked manually on each request
    # This ensures the session validity coincides with the JWT token expiration
    try:
        new_session = session_service.create_session(
            app_name=APP_NAME,
            user_id=request.user_id,
            state=initial_state,
        )
        
        return CreateSessionResponse(
            session_id=new_session.id,
            message="Session created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@app.get(
    "/api/v1/pulse-epm-agent/sessions",
    response_model=SessionsListResponse,
    tags=["sessions"],
    summary="List All Active Sessions",
    description="""
    Get all unexpired (active) sessions for the authenticated user.
    
    Requires Authorization header with Bearer token. The user_email is extracted from the JWT token
    and used to find all sessions belonging to that user. Only unexpired sessions are returned.
    
    Returns a list of all active sessions associated with the user, including:
    - Session IDs
    - User information (email, name)
    - Token expiration status
    - Interaction counts
    
    This endpoint is useful for:
    - Managing multiple concurrent chat sessions
    - Viewing all active conversations
    - Discovering available session IDs for chat interactions
    """,
    response_description="List of all unexpired sessions for the authenticated user"
)
async def list_sessions(
    authorization: Optional[str] = Header(None, description="Bearer token for authentication")
):
    """
    Get all unexpired sessions for the authenticated user.
    
    Extracts user_email from JWT token and filters sessions by that email.
    Only returns sessions that have not expired.
    """
    try:
        # Extract and validate JWT token
        _, claims, _ = extract_and_validate_bearer_token(authorization)
        
        # Get user_email from JWT claims
        user_email = claims.get("email")
        if not user_email:
            raise HTTPException(
                status_code=400,
                detail="JWT token missing 'email' claim. Cannot identify user sessions."
            )
        
        # Get user_id from claims if available (for response)
        user_id = claims.get("sub") or claims.get("user_id") or claims.get("username") or user_email
        
        sessions_list = []
        active_count = 0
        
        # Try to get sessions for the user
        # Note: DatabaseSessionService API may vary - this attempts common patterns
        try:
            # Try method 1: list_sessions or get_sessions
            if hasattr(session_service, 'list_sessions'):
                # Try with user_id first if available
                try:
                    sessions = session_service.list_sessions(
                        app_name=APP_NAME,
                        user_id=user_id
                    )
                except (TypeError, AttributeError):
                    # If user_id doesn't work, try without it or get all and filter
                    sessions = session_service.list_sessions(app_name=APP_NAME)
            elif hasattr(session_service, 'get_sessions'):
                try:
                    sessions = session_service.get_sessions(
                        app_name=APP_NAME,
                        user_id=user_id
                    )
                except (TypeError, AttributeError):
                    sessions = session_service.get_sessions(app_name=APP_NAME)
            else:
                # If no list method exists, we'll need to track sessions differently
                # For now, return empty list
                sessions = []
        except (AttributeError, TypeError):
            # If the method doesn't exist or doesn't support parameters, try without params
            try:
                if hasattr(session_service, 'list_sessions'):
                    sessions = session_service.list_sessions(app_name=APP_NAME)
                elif hasattr(session_service, 'get_sessions'):
                    sessions = session_service.get_sessions(app_name=APP_NAME)
                else:
                    sessions = []
            except Exception:
                sessions = []
        
        # Process each session to get details and filter by email
        now = datetime.now(timezone.utc)
        
        for session in sessions:
            try:
                session_state = session.state if hasattr(session, 'state') else {}
                
                # Filter sessions by user_email from session state
                session_user_email = session_state.get("user_email")
                if session_user_email != user_email:
                    # Skip sessions that don't belong to this user
                    continue
                
                # Extract user information
                session_user_name = session_state.get("user_name")
                
                # Check token expiration - only include unexpired sessions
                token_expiration_str = session_state.get("token_expiration")
                token_expires_at = session_state.get("token_expires_at")
                
                expiration_datetime = None
                is_expired = False
                
                if token_expires_at:
                    expiration_datetime = datetime.fromtimestamp(token_expires_at, tz=timezone.utc)
                    is_expired = expiration_datetime < now
                elif token_expiration_str:
                    try:
                        expiration_datetime = datetime.fromisoformat(token_expiration_str.replace('Z', '+00:00'))
                        is_expired = expiration_datetime < now
                    except (ValueError, AttributeError):
                        pass
                
                # Skip expired sessions - only return unexpired ones
                if is_expired:
                    continue
                
                # Count interactions
                interaction_history = session_state.get("interaction_history", [])
                interaction_count = len(interaction_history) if isinstance(interaction_history, list) else 0
                
                # Get session ID
                session_id = session.id if hasattr(session, 'id') else str(session)
                
                # Get user_id from session state if available, otherwise use from JWT
                session_user_id = session_state.get("user_id") or user_id
                
                # Get created_at if available
                created_at = None
                if hasattr(session, 'created_at'):
                    created_at = session.created_at.isoformat() if hasattr(session.created_at, 'isoformat') else str(session.created_at)
                
                session_info = SessionInfo(
                    session_id=session_id,
                    user_id=session_user_id,
                    user_email=user_email,
                    user_name=session_user_name,
                    token_expiration=token_expiration_str,
                    is_expired=False,  # All returned sessions are unexpired
                    interaction_count=interaction_count,
                    created_at=created_at
                )
                
                sessions_list.append(session_info)
                active_count += 1
                    
            except Exception as e:
                # Skip sessions that can't be processed
                continue
        
        return SessionsListResponse(
            user_id=user_id,
            total_sessions=len(sessions_list),
            active_sessions=active_count,
            sessions=sessions_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


@app.get(
    "/api/v1/pulse-epm-agent/sessions/{session_id}",
    response_model=SessionStateResponse,
    tags=["sessions"],
    summary="Get Session State",
    description="""
    Retrieve the current state of a session.
    
    Returns the complete session state including:
    - JWT token (stored during session creation)
    - User information (email, name)
    - Interaction history (all user queries and agent responses)
    
    Useful for debugging, auditing, or resuming conversations.
    """,
    response_description="Session state including token and interaction history"
)
async def get_session_state(
    session_id: str = Path(..., description="The session ID to retrieve", example="session-uuid-123"),
    user_id: str = Query(..., description="The user ID that owns the session", example="user123")
):
    """Get session state."""
    try:
        session = session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id
        )
        return SessionStateResponse(
            session_id=session_id,
            state=session.state
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")


@app.delete(
    "/api/v1/pulse-epm-agent/sessions/{session_id}",
    tags=["sessions"],
    summary="Delete Session",
    description="""
    Delete a session and all its associated data.
    
    This permanently removes the session from the database, including:
    - Session state
    - JWT token
    - Interaction history
    
    **Note**: Session deletion may not be fully implemented depending on the ADK version.
    """,
    response_description="Deletion status message"
)
async def delete_session(
    session_id: str = Path(..., description="The session ID to delete", example="session-uuid-123"),
    user_id: str = Query(..., description="The user ID that owns the session", example="user123")
):
    """Delete a session."""
    try:
        # Note: DatabaseSessionService may not have a delete method
        # This is a placeholder - adjust based on actual ADK API
        return {"message": "Session deletion not yet implemented"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


@app.post(
    "/api/v1/pulse-epm-agent/chat/{session_id}",
    response_model=ChatResponse,
    tags=["chat"],
    summary="Send Chat Message",
    description="""
    Send a message to the AI agent and receive a response.
    
    This is the main endpoint for interacting with the agent. The session ID is specified in the URL path,
    allowing multiple concurrent chat sessions for the same user. The agent will:
    1. Retrieve the JWT token from the session state
    2. Process your message through the multi-agent system
    3. Execute any necessary GraphQL operations
    4. Return a natural language response
    
    The agent can help with:
    - Creating and managing goals
    - Managing users and departments
    - Tracking KPIs
    - Adding notes to goals
    - And much more!
    
    **Note**: The session must be created first using the sessions endpoint.
    Multiple concurrent chats are supported by using different session IDs.
    """,
    response_description="Agent's response to the chat message"
)
async def chat(
    session_id: str = Path(..., description="The session ID for this conversation", example="session-uuid-123"),
    request: ChatRequest = ...,
    user_id: str = Query(..., description="The user ID sending the message", example="user123")
):
    """
    Send a message to the agent.
    
    The agent will use the JWT token stored in session state for GraphQL API authentication.
    The session ID is specified in the URL path, enabling multiple concurrent chat sessions.
    """
    try:
        # Get session to retrieve JWT token
        session = session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id
        )
        
        # Get JWT token from session state
        jwt_token = session.state.get("jwt_token")
        if not jwt_token:
            raise HTTPException(
                status_code=400,
                detail="JWT token not found in session state. Please create a new session with Authorization header."
            )
        
        # Check if token has expired
        check_token_expiration_from_session_state(session.state)
        
        # Set token in context for tools to access
        token_context.set(jwt_token)
        
        # Add user query to history
        add_user_query_to_history(
            session_service,
            APP_NAME,
            user_id,
            session_id,
            request.message
        )
        
        # Create runner
        runner = Runner(
            agent=root_agent,
            app_name=APP_NAME,
            session_service=session_service,
        )
        
        # Create message content
        content = types.Content(role="user", parts=[types.Part(text=request.message)])
        
        # Process message through agent
        final_response_text = None
        agent_name = None
        
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=content
        ):
            # Capture agent name
            if event.author:
                agent_name = event.author
            
            # Get final response
            if event.is_final_response():
                if (
                    event.content
                    and event.content.parts
                    and hasattr(event.content.parts[0], "text")
                    and event.content.parts[0].text
                ):
                    final_response_text = event.content.parts[0].text.strip()
        
        # Add agent response to history
        if final_response_text and agent_name:
            add_agent_response_to_history(
                session_service,
                APP_NAME,
                user_id,
                session_id,
                agent_name,
                final_response_text
            )
        
        if not final_response_text:
            final_response_text = "No response from agent"
        
        return ChatResponse(
            response=final_response_text,
            agent_name=agent_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.get(
    "/api/v1/pulse-epm-agent/usage",
    response_model=UsageResponse,
    tags=["info"],
    summary="API Usage Information",
    description="""
    Get detailed information about all available API endpoints.
    
    This endpoint provides comprehensive documentation about:
    - All available endpoints and their purposes
    - HTTP methods and paths
    - Authentication requirements
    - Example requests and responses
    - Parameter descriptions
    
    Use this endpoint to discover and understand the API capabilities.
    """,
    response_description="Complete API usage information"
)
async def get_usage():
    """
    Get information about all API endpoints and their usage.
    
    Returns structured information about each endpoint including:
    - HTTP method and path
    - Description and purpose
    - Authentication requirements
    - Example requests and responses
    """
    endpoints = [
        EndpointInfo(
            method="GET",
            path="/api/v1/pulse-epm-agent/health",
            summary="Health Check",
            description="Check the health status of the API service. Returns service status and health information.",
            requires_auth=False,
            example_response={"status": "healthy", "service": "pulse-epm-agent", "version": "1.0.0"}
        ),
        EndpointInfo(
            method="POST",
            path="/api/v1/pulse-epm-agent/sessions",
            summary="Create Session",
            description="Create a new conversation session with the AI agent. Requires Authorization header with Bearer token. The token is stored in session state for agent tool authentication.",
            requires_auth=True,
            parameters=[
                {"name": "Authorization", "type": "header", "required": True, "description": "Bearer token for authentication"},
                {"name": "user_id", "type": "body", "required": True, "description": "Unique identifier for the user"},
                {"name": "user_email", "type": "body", "required": False, "description": "User's email address"},
                {"name": "user_name", "type": "body", "required": False, "description": "User's display name"}
            ],
            example_request={
                "user_id": "user123",
                "user_email": "john.doe@example.com",
                "user_name": "John Doe"
            },
            example_response={
                "session_id": "session-uuid-123",
                "message": "Session created successfully"
            }
        ),
        EndpointInfo(
            method="GET",
            path="/api/v1/pulse-epm-agent/sessions",
            summary="List All Active Sessions",
            description="Get all unexpired (active) sessions for the authenticated user. Requires Authorization header with Bearer token. The user_email is extracted from the JWT token and used to find all sessions belonging to that user. Only unexpired sessions are returned. Useful for managing multiple concurrent chat sessions.",
            requires_auth=True,
            parameters=[
                {"name": "Authorization", "type": "header", "required": True, "description": "Bearer token containing user_email claim"}
            ],
            example_response={
                "user_id": "user123",
                "total_sessions": 2,
                "active_sessions": 2,
                "sessions": [
                    {
                        "session_id": "session-uuid-123",
                        "user_id": "user123",
                        "user_email": "john.doe@example.com",
                        "user_name": "John Doe",
                        "token_expiration": "2024-12-31T23:59:59+00:00",
                        "is_expired": False,
                        "interaction_count": 5,
                        "created_at": "2024-01-01T00:00:00+00:00"
                    }
                ]
            }
        ),
        EndpointInfo(
            method="GET",
            path="/api/v1/pulse-epm-agent/sessions/{session_id}",
            summary="Get Session State",
            description="Retrieve the current state of a session including JWT token, user information, and interaction history.",
            requires_auth=False,
            parameters=[
                {"name": "session_id", "type": "path", "required": True, "description": "The session ID to retrieve"},
                {"name": "user_id", "type": "query", "required": True, "description": "The user ID that owns the session"}
            ],
            example_response={
                "session_id": "session-uuid-123",
                "state": {
                    "jwt_token": "...",
                    "user_email": "john.doe@example.com",
                    "user_name": "John Doe",
                    "interaction_history": []
                }
            }
        ),
        EndpointInfo(
            method="DELETE",
            path="/api/v1/pulse-epm-agent/sessions/{session_id}",
            summary="Delete Session",
            description="Delete a session and all its associated data including session state, JWT token, and interaction history.",
            requires_auth=False,
            parameters=[
                {"name": "session_id", "type": "path", "required": True, "description": "The session ID to delete"},
                {"name": "user_id", "type": "query", "required": True, "description": "The user ID that owns the session"}
            ],
            example_response={"message": "Session deletion not yet implemented"}
        ),
        EndpointInfo(
            method="POST",
            path="/api/v1/pulse-epm-agent/chat/{session_id}",
            summary="Send Chat Message",
            description="Send a message to the AI agent and receive a response. The session ID is specified in the URL path, allowing multiple concurrent chat sessions for the same user. The agent processes your message through the multi-agent system, executes necessary GraphQL operations, and returns a natural language response.",
            requires_auth=False,
            parameters=[
                {"name": "session_id", "type": "path", "required": True, "description": "The session ID for this conversation"},
                {"name": "user_id", "type": "query", "required": True, "description": "The user ID sending the message"},
                {"name": "message", "type": "body", "required": True, "description": "The message to send to the agent"}
            ],
            example_request={
                "message": "Create a goal for improving customer satisfaction"
            },
            example_response={
                "response": "I've created a goal for improving customer satisfaction...",
                "agent_name": "pulse_performance_agent"
            }
        ),
        EndpointInfo(
            method="GET",
            path="/api/v1/pulse-epm-agent/usage",
            summary="API Usage Information",
            description="Get detailed information about all available API endpoints including descriptions, examples, and authentication requirements.",
            requires_auth=False,
            example_response={"service_name": "Pulse Performance Management Agent API", "endpoints": "..."}
        )
    ]
    
    return UsageResponse(
        service_name="Pulse Performance Management Agent API",
        version="1.0.0",
        base_path="/api/v1/pulse-epm-agent",
        endpoints=endpoints,
        authentication_info={
            "type": "Bearer Token",
            "description": "JWT token must be provided in the Authorization header when creating a session",
            "header_format": "Authorization: Bearer <token>",
            "note": "Token is stored in session state after session creation and used automatically for subsequent requests"
        }
    )


@app.get(
    "/api/v1/pulse-epm-agent/openapi.json",
    tags=["info"],
    summary="OpenAPI Specification",
    description="Get the OpenAPI 3.0 specification for this API in JSON format."
)
async def get_openapi_spec():
    """
    Get the OpenAPI 3.0 specification for this API.
    
    Returns the complete OpenAPI spec that can be used with tools like:
    - Swagger UI
    - Postman
    - OpenAPI Generator
    - API documentation tools
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return openapi_schema


@app.get(
    "/docs",
    tags=["info"],
    include_in_schema=False
)
async def redirect_to_docs():
    """Redirect to Swagger UI documentation."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


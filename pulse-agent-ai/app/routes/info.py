"""Information and documentation endpoints."""
from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from app.models import UsageResponse, EndpointInfo
from app.config import API_TITLE, API_VERSION

router = APIRouter(tags=["info"])


@router.get(
    "/api/v1/pulse-epm-agent/usage",
    response_model=UsageResponse,
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
        service_name=API_TITLE,
        version=API_VERSION,
        base_path="/api/v1/pulse-epm-agent",
        endpoints=endpoints,
        authentication_info={
            "type": "Bearer Token",
            "description": "JWT token must be provided in the Authorization header when creating a session",
            "header_format": "Authorization: Bearer <token>",
            "note": "Token is stored in session state after session creation and used automatically for subsequent requests"
        }
    )


# OpenAPI endpoint is handled in main.py to access the app instance


@router.get(
    "/docs",
    include_in_schema=False
)
async def redirect_to_docs():
    """Redirect to Swagger UI documentation."""
    return RedirectResponse(url="/docs")


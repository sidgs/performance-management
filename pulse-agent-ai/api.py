import os
import contextvars
from typing import Optional
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
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

# Initialize FastAPI app
app = FastAPI(title="Performance Management Agent API", version="1.0.0")

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "dev")
DB_PASSWORD = os.getenv("DB_PASSWORD", "dev")
DB_NAME = os.getenv("DB_NAME", "dev")

# Construct database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Initialize session service with PostgreSQL
session_service = DatabaseSessionService(database_url=DATABASE_URL)

# Constants
APP_NAME = os.getenv("APP_NAME", "pulse_performance_management")
AGENT_NAME = os.getenv("AGENT_NAME","pulse_performance_agent")


# Request/Response Models
class CreateSessionRequest(BaseModel):
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None


class CreateSessionResponse(BaseModel):
    session_id: str
    message: str


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    response: str
    agent_name: Optional[str] = None


class SessionStateResponse(BaseModel):
    session_id: str
    state: dict


# Helper function to extract Bearer token from Authorization header
def extract_bearer_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract Bearer token from Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header must start with 'Bearer '")
    
    token = authorization[7:]  # Remove "Bearer " prefix
    if not token:
        raise HTTPException(status_code=401, detail="Token is required")
    
    return token


@app.get("/api/v1/pulse-epm-agent/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "epm-agent"}


@app.post("/api/v1/pulse-epm-agent/sessions", response_model=CreateSessionResponse)
async def create_session(
    request: CreateSessionRequest,
    authorization: Optional[str] = Header(None)
):
    """Create a new session with initial state.
    
    Requires Authorization header with Bearer token.
    Token is stored in session state for agent tool authentication.
    """
    # Extract JWT token from Authorization header
    jwt_token = extract_bearer_token(authorization)
    
    # Create initial state with JWT token
    initial_state = get_initial_state(
        jwt_token=jwt_token,
        user_email=request.user_email,
        user_name=request.user_name
    )
    
    # Create session
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@app.get("/api/v1/pulse-epm-agent/sessions/{session_id}", response_model=SessionStateResponse)
async def get_session_state(session_id: str, user_id: str):
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


@app.delete("/api/v1/pulse-epm-agent/sessions/{session_id}")
async def delete_session(session_id: str, user_id: str):
    """Delete a session."""
    try:
        # Note: DatabaseSessionService may not have a delete method
        # This is a placeholder - adjust based on actual ADK API
        return {"message": "Session deletion not yet implemented"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


@app.post("/api/v1/pulse-epm-agent/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str
):
    """Send a message to the agent.
    
    The agent will use the JWT token stored in session state for GraphQL API authentication.
    """
    try:
        # Get session to retrieve JWT token
        session = session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=request.session_id
        )
        
        # Get JWT token from session state
        jwt_token = session.state.get("jwt_token")
        if not jwt_token:
            raise HTTPException(
                status_code=400,
                detail="JWT token not found in session state. Please create a new session with Authorization header."
            )
        
        # Set token in context for tools to access
        token_context.set(jwt_token)
        
        # Add user query to history
        add_user_query_to_history(
            session_service,
            APP_NAME,
            user_id,
            request.session_id,
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
            session_id=request.session_id,
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
                request.session_id,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


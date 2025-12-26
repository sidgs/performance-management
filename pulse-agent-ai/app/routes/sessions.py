"""Session management endpoints."""
import uuid
import traceback
import logging
import asyncpg
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, Query, Path

from app.models import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionStateResponse,
    SessionsListResponse,
    SessionInfo,
)
from app.auth import extract_and_validate_bearer_token
from app.dependencies import session_service, APP_NAME
from app.config import DATABASE_URL
from pulse_performance_agent.utils.session_utils import get_initial_state

router = APIRouter(tags=["sessions"])


@router.post(
    "/api/v1/pulse-epm-agent/sessions",
    response_model=CreateSessionResponse,
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
    # Store user_id in state so we can match sessions when listing
    initial_state = get_initial_state(
        jwt_token=jwt_token,
        user_email=user_email,
        user_name=user_name,
        user_id=request.user_id
    )
    
    # Store token expiration in session state
    if expiration:
        initial_state["token_expiration"] = expiration.isoformat()
        initial_state["token_expires_at"] = expiration.timestamp()
    
    # Create session
    # Note: Session expiration is stored in state and checked manually on each request
    # This ensures the session validity coincides with the JWT token expiration
    try:
        session_uuid: Optional[str] = None
        # Generate a UUID as a string for the session if not provided
        if not session_uuid:
            session_uuid = str(uuid.uuid4())

        new_session = await session_service.create_session(
            app_name=APP_NAME,
            user_id=request.user_id,
            state=initial_state        
        )
        
        return CreateSessionResponse(
            session_id=new_session.id,
            message="Session created successfully"
        )
    except HTTPException:
        traceback.print_exc()
        raise
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Failed to create session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")


@router.get(
    "/api/v1/pulse-epm-agent/sessions",
    response_model=SessionsListResponse,
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
        
        # Get user_email from JWT claims - this is the primary identifier for filtering sessions
        user_email = claims.get("email")
        if not user_email:
            raise HTTPException(
                status_code=400,
                detail="JWT token missing 'email' claim. Cannot identify user sessions."
            )
        
        # Get user_id from claims if available (for response)
        jwt_user_id = claims.get("sub") or claims.get("user_id") or claims.get("username") or user_email
        
        sessions_list = []
        active_count = 0
        
        # Get all sessions for the app - we'll filter by email from session state
        sessions = []
        try:
            # Try to get all sessions for the app
            if hasattr(session_service, 'list_sessions'):
                try:
                    sessions = await session_service.list_sessions(app_name=APP_NAME)
                    sessions = sessions.sessions
                except Exception as e:
                    traceback.print_exc()
                    logging.error(f"Failed to list sessions: {e}", exc_info=True)
                    sessions = []
            elif hasattr(session_service, 'get_sessions'):
                try:
                    sessions = await session_service.get_sessions(app_name=APP_NAME)
                except Exception as e:
                    traceback.print_exc()
                    logging.error(f"Failed to get sessions: {e}", exc_info=True)
                    sessions = []
            else:
                # If no list method exists, return empty list
                sessions = []
        except Exception as e:
            traceback.print_exc()
            logging.error(f"Error calling list_sessions/get_sessions: {e}", exc_info=True)
            sessions = []
        
        # Process each session and filter by email from JWT claims
        now = datetime.now(timezone.utc)
        
        # Debug: log how many sessions were retrieved
        logging.info(f"Retrieved {len(sessions)} sessions from database for app_name={APP_NAME}, filtering by email={user_email}")
        
        for session in sessions:
            try:
                session_state = session.state if hasattr(session, 'state') else {}
                
                # Get user_email from session state - this is what we match against
                session_user_email = session_state.get("user_email")
                
                # Filter sessions by email: only include sessions where email matches
                if not session_user_email or session_user_email != user_email:
                    # Skip sessions that don't belong to this user (by email)
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
                session_user_id = session_state.get("user_id")
                final_user_id = session_user_id or jwt_user_id
                
                # Get created_at if available
                created_at = None
                if hasattr(session, 'created_at'):
                    created_at = session.created_at.isoformat() if hasattr(session.created_at, 'isoformat') else str(session.created_at)
                elif session_state.get("created_at"):
                    # Fallback to created_at from session state
                    created_at = session_state.get("created_at")
                
                session_info = SessionInfo(
                    session_id=session_id,
                    user_id=final_user_id,
                    user_email=session_user_email or user_email,
                    user_name=session_user_name,
                    token_expiration=token_expiration_str,
                    is_expired=False,  # All returned sessions are unexpired
                    interaction_count=interaction_count,
                    created_at=created_at
                )
                
                sessions_list.append(session_info)
                active_count += 1
                    
            except Exception as e:
                # Log the error for debugging but skip sessions that can't be processed
                traceback.print_exc()
                logging.error(f"Error processing session: {e}", exc_info=True)
                continue
        
        return SessionsListResponse(
            user_id=jwt_user_id,
            total_sessions=len(sessions_list),
            active_sessions=active_count,
            sessions=sessions_list
        )
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Failed to list sessions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


@router.get(
    "/api/v1/pulse-epm-agent/sessions/{session_id}",
    response_model=SessionStateResponse,
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
        session = await session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id
        )
        return SessionStateResponse(
            session_id=session_id,
            state=session.state
        )
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Session not found: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")


@router.delete(
    "/api/v1/pulse-epm-agent/sessions/{session_id}",
    summary="Delete Session",
    description="""
    Delete a session and all its associated data.
    
    This permanently removes the session from the database, including:
    - Session state
    - JWT token
    - Interaction history
    """,
    response_description="Deletion status message"
)
async def delete_session(
    session_id: str = Path(..., description="The session ID to delete", example="session-uuid-123"),
    user_id: str = Query(..., description="The user ID that owns the session", example="user123")
):
    """Delete a session."""
    try:
        # First, verify the session exists and belongs to the user
        try:
            session = await session_service.get_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id
            )
        except Exception as e:
            traceback.print_exc()
            logging.error(f"Session not found for deletion: {e}", exc_info=True)
            raise HTTPException(status_code=404, detail=f"Session not found: {str(e)}")
        
        # Try different methods to delete the session
        deleted = False
        
        # Method 1: Try delete_session method
        if hasattr(session_service, 'delete_session'):
            try:
                await session_service.delete_session(
                    app_name=APP_NAME,
                    user_id=user_id,
                    session_id=session_id
                )
                deleted = True
                logging.info(f"Session {session_id} deleted using delete_session method")
            except Exception as e:
                logging.warning(f"delete_session method failed: {e}")
        
        # Method 2: Try remove_session method
        if not deleted and hasattr(session_service, 'remove_session'):
            try:
                await session_service.remove_session(
                    app_name=APP_NAME,
                    user_id=user_id,
                    session_id=session_id
                )
                deleted = True
                logging.info(f"Session {session_id} deleted using remove_session method")
            except Exception as e:
                logging.warning(f"remove_session method failed: {e}")
        
        # Method 3: Try delete method directly on session object
        if not deleted and hasattr(session, 'delete'):
            try:
                await session.delete()
                deleted = True
                logging.info(f"Session {session_id} deleted using session.delete() method")
            except Exception as e:
                logging.warning(f"session.delete() method failed: {e}")
        
        # Method 4: Try direct database deletion as fallback
        if not deleted:
            try:
                # Extract connection details from DATABASE_URL
                # Format: postgresql+asyncpg://user:password@host:port/dbname
                if DATABASE_URL.startswith("postgresql+asyncpg://"):
                    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
                else:
                    db_url = DATABASE_URL
                
                # Parse the database URL
                import re
                match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', db_url)
                if match:
                    db_user, db_password, db_host, db_port, db_name = match.groups()
                    
                    # Connect to database and delete the session
                    conn = await asyncpg.connect(
                        host=db_host,
                        port=int(db_port),
                        user=db_user,
                        password=db_password,
                        database=db_name
                    )
                    try:
                        # First, find the correct table name by querying information_schema
                        table_query = """
                            SELECT table_name 
                            FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND (table_name LIKE '%session%' OR table_name LIKE '%adk%')
                            ORDER BY table_name
                        """
                        tables = await conn.fetch(table_query)
                        
                        # Try to delete from each potential table
                        for table_row in tables:
                            table_name = table_row['table_name']
                            try:
                                # Check if table has the required columns
                                columns_query = """
                                    SELECT column_name 
                                    FROM information_schema.columns 
                                    WHERE table_name = $1
                                """
                                columns = await conn.fetch(columns_query, table_name)
                                column_names = [col['column_name'] for col in columns]
                                
                                # Check if table has app_name, user_id, and session_id columns
                                if all(col in column_names for col in ['app_name', 'user_id', 'session_id']):
                                    result = await conn.execute(
                                        f"""
                                        DELETE FROM {table_name}
                                        WHERE app_name = $1 AND user_id = $2 AND session_id = $3
                                        """,
                                        APP_NAME, user_id, session_id
                                    )
                                    if result == "DELETE 1":
                                        deleted = True
                                        logging.info(f"Session {session_id} deleted from database table {table_name}")
                                        break
                            except Exception as table_error:
                                # Table doesn't have the right structure or error, try next
                                logging.debug(f"Table {table_name} error: {table_error}")
                                continue
                        
                        # If no table found, try common table names directly
                        if not deleted:
                            for table_name in ['sessions', 'adk_sessions', 'session_storage', 'adk_session_storage']:
                                try:
                                    result = await conn.execute(
                                        f"""
                                        DELETE FROM {table_name}
                                        WHERE app_name = $1 AND user_id = $2 AND session_id = $3
                                        """,
                                        APP_NAME, user_id, session_id
                                    )
                                    if result == "DELETE 1":
                                        deleted = True
                                        logging.info(f"Session {session_id} deleted from database table {table_name}")
                                        break
                                except Exception:
                                    continue
                    finally:
                        await conn.close()
            except Exception as e:
                logging.warning(f"Direct database deletion failed: {e}", exc_info=True)
                # If database deletion fails, try clearing session state as last resort
                try:
                    empty_state = {}
                    await session_service.create_session(
                        app_name=APP_NAME,
                        user_id=user_id,
                        session_id=session_id,
                        state=empty_state
                    )
                    logging.warning(f"Session {session_id} state cleared (not fully deleted - ADK limitation)")
                    return {
                        "message": "Session state cleared successfully",
                        "session_id": session_id,
                        "note": "Session record may still exist in database due to ADK limitations"
                    }
                except Exception as clear_error:
                    logging.error(f"Failed to clear session state: {clear_error}", exc_info=True)
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to delete session. Error: {str(e)}"
                    )
        
        if deleted:
            return {
                "message": "Session deleted successfully",
                "session_id": session_id
            }
        else:
            raise HTTPException(
                status_code=501,
                detail="Session deletion is not supported by the current DatabaseSessionService implementation"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Failed to delete session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")


import traceback
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from google.adk.events.event import Event


def get_initial_state(jwt_token: str, user_email: Optional[str] = None, user_name: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Define initial session state structure with JWT token.
    
    Args:
        jwt_token: JWT token from Authorization header (CRITICAL - required for GraphQL tool authentication)
        user_email: Email identifier for the user (optional, can be extracted from token)
        user_name: User's name (optional)
        user_id: User ID (optional, but recommended for session matching)
    
    Returns:
        Dictionary containing initial session state
    """
    state = {
        "jwt_token": jwt_token,  # CRITICAL - required for GraphQL tool authentication
        "user_email": user_email,
        "user_name": user_name,
        "interaction_history": [],
        "created_at": datetime.now(timezone.utc).isoformat(),  # Store session creation timestamp
    }
    if user_id:
        state["user_id"] = user_id
    return state


async def update_interaction_history(session_service, app_name: str, user_id: str, session_id: str, entry: Dict[str, Any]) -> None:
    """Add an entry to the interaction history in state.

    Args:
        session_service: The session service instance
        app_name: The application name
        user_id: The user ID
        session_id: The session ID
        entry: A dictionary containing the interaction data
            - requires 'action' key (e.g., 'user_query', 'agent_response')
            - other keys are flexible depending on the action type
    """
    try:
        # Get current session
        session = await session_service.get_session(
            app_name=app_name, user_id=user_id, session_id=session_id
        )
        
        # If session doesn't exist, create it with the entry
        if session is None:
            # Create initial state with the entry
            initial_history = []
            if "timestamp" not in entry:
                entry["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            initial_history.append(entry)
            
            initial_state = {
                "interaction_history": initial_history
            }
            
            await session_service.create_session(
                app_name=app_name,
                user_id=user_id,
                session_id=session_id,
                state=initial_state,
            )
            return

        # Get current interaction history
        interaction_history = session.state.get("interaction_history", [])

        # Add timestamp if not already present
        if "timestamp" not in entry:
            entry["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Add the entry to interaction history
        interaction_history.append(entry)

        # Create state delta with updated interaction history
        state_delta = {
            "interaction_history": interaction_history
        }

        # Create an event with state_delta to update the session state
        event = Event(
            id=str(uuid.uuid4()),
            invocation_id=str(uuid.uuid4()),
            author="system",
            actions={"state_delta": state_delta},
            timestamp=datetime.now(timezone.utc).timestamp(),
            partial=False,
            turn_complete=True,
        )

        # Update the session state using append_event
        await session_service.append_event(session=session, event=event)
    except Exception as e:
        traceback.print_exc()
        logging.error(f"Error updating interaction history: {e}", exc_info=True)


async def add_user_query_to_history(session_service, app_name: str, user_id: str, session_id: str, query: str) -> None:
    """Add a user query to the interaction history."""
    await update_interaction_history(
        session_service,
        app_name,
        user_id,
        session_id,
        {
            "action": "user_query",
            "query": query,
        },
    )


async def add_agent_response_to_history(
    session_service, app_name: str, user_id: str, session_id: str, agent_name: str, response: str
) -> None:
    """Add an agent response to the interaction history."""
    await update_interaction_history(
        session_service,
        app_name,
        user_id,
        session_id,
        {
            "action": "agent_response",
            "agent": agent_name,
            "response": response,
        },
    )



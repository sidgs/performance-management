import traceback
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional


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

        # Get current interaction history
        interaction_history = session.state.get("interaction_history", [])

        # Add timestamp if not already present
        if "timestamp" not in entry:
            entry["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Add the entry to interaction history
        interaction_history.append(entry)

        # Create updated state
        updated_state = session.state.copy()
        updated_state["interaction_history"] = interaction_history

        # Update the session with new state
        await session_service.create_session(
            app_name=app_name,
            user_id=user_id,
            session_id=session_id,
            state=updated_state,
        )
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



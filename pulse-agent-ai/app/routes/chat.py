"""Chat endpoints for interacting with the AI agent."""
import traceback
import logging
from fastapi import APIRouter, HTTPException, Query, Path
from google.adk.runners import Runner
from google.genai import types

from app.models import ChatRequest, ChatResponse
from app.dependencies import session_service, APP_NAME
from app.auth import check_token_expiration_from_session_state
from pulse_performance_agent.agent import root_agent
from pulse_performance_agent.utils.session_utils import (
    add_user_query_to_history,
    add_agent_response_to_history,
)
from pulse_performance_agent.sub_agents.performance_management_graphql_tool.utils.graphql_client import token_context

router = APIRouter(tags=["chat"])


@router.post(
    "/api/v1/pulse-epm-agent/chat/{session_id}",
    response_model=ChatResponse,
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
        session = await session_service.get_session(
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
        await add_user_query_to_history(
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
            await add_agent_response_to_history(
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
        traceback.print_exc()
        logging.error(f"Error processing chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


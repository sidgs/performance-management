"""Chat endpoints for interacting with the AI agent."""
import traceback
import logging
import base64
import json
from fastapi import APIRouter, HTTPException, Query, Path, File, UploadFile, Form, Request
from typing import Optional
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
    
    Supports both JSON (application/json) and multipart/form-data (for file uploads).
    Allowed file types: CSV, PDF, TXT.
    """,
    response_description="Agent's response to the chat message"
)
async def chat(
    request_obj: Request,
    session_id: str = Path(..., description="The session ID for this conversation", example="session-uuid-123"),
    user_id: str = Query(..., description="The user ID sending the message", example="user123")
):
    """
    Send a message to the agent.
    
    The agent will use the JWT token stored in session state for GraphQL API authentication.
    The session ID is specified in the URL path, enabling multiple concurrent chat sessions.
    
    Supports both JSON requests (application/json) and multipart/form-data (for file uploads).
    """
    try:
        # Determine message and file content based on content type
        chat_message = ""
        file_content = None
        file_name = None
        file_type = None
        
        content_type = request_obj.headers.get("content-type", "")
        
        if "multipart/form-data" in content_type:
            # Handle form data with file upload
            form = await request_obj.form()
            chat_message = form.get("message", "")
            file = form.get("file")
            
            if file and hasattr(file, 'filename') and file.filename:
                # Validate file type
                allowed_types = ['text/csv', 'application/pdf', 'text/plain']
                allowed_extensions = ['.csv', '.pdf', '.txt']
                file_extension = '.' + (file.filename or '').split('.')[-1].lower()
                
                if file.content_type not in allowed_types and file_extension not in allowed_extensions:
                    raise HTTPException(
                        status_code=400,
                        detail="Only CSV, PDF, and TXT files are allowed."
                    )
                
                # Read file content and encode as base64
                file_bytes = await file.read()
                file_content = base64.b64encode(file_bytes).decode('utf-8')
                file_name = file.filename
                file_type = file.content_type
        else:
            # Handle JSON request
            body = await request_obj.json()
            chat_request = ChatRequest(**body)
            chat_message = chat_request.message
            if chat_request.file_content:
                file_content = chat_request.file_content
                file_name = chat_request.file_name
                file_type = chat_request.file_type
        
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
        
        # Build message text with file information if file is present
        message_text = chat_message
        if file_content and file_name:
            message_text += f"\n\n[File attached: {file_name}]\n"
            if file_type == 'text/csv' or file_name.endswith('.csv'):
                try:
                    # Decode and include CSV content in message
                    csv_content = base64.b64decode(file_content).decode('utf-8')
                    message_text += f"\nCSV Content:\n{csv_content}\n"
                except Exception as e:
                    logging.warning(f"Could not decode CSV file: {e}")
                    message_text += f"\n[CSV file content could not be decoded]\n"
            elif file_type == 'text/plain' or file_name.endswith('.txt'):
                try:
                    # Decode and include text content in message
                    text_content = base64.b64decode(file_content).decode('utf-8')
                    message_text += f"\nText Content:\n{text_content}\n"
                except Exception as e:
                    logging.warning(f"Could not decode text file: {e}")
                    message_text += f"\n[Text file content could not be decoded]\n"
            elif file_type == 'application/pdf' or file_name.endswith('.pdf'):
                message_text += f"\n[PDF file: {file_name} - Please review the attached PDF document]\n"
        
        # Add user query to history
        await add_user_query_to_history(
            session_service,
            APP_NAME,
            user_id,
            session_id,
            message_text
        )
        
        # Create runner
        runner = Runner(
            agent=root_agent,
            app_name=APP_NAME,
            session_service=session_service,
        )
        
        # Create message content
        content = types.Content(role="user", parts=[types.Part(text=message_text)])
        
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


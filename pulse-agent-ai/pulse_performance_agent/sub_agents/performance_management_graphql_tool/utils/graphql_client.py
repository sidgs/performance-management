import os
import traceback
import logging
import httpx
import contextvars
from typing import Optional, Dict, Any

# Context variable for JWT token (set by FastAPI before agent execution)
token_context: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar('jwt_token', default=None)


class GraphQLClient:
    """GraphQL client for Performance Management API.
    
    The client retrieves JWT token from session state (primary) or environment variable (fallback).
    Token from session state is passed when called from agent tools.
    """
    
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        self.base_url = base_url or os.getenv(
            "GRAPHQL_API_URL", 
            "http://localhost:8080/api/v1/performance-management/graphql"
        )
        self.token = token or os.getenv("JWT_TOKEN")

    def execute(self, query: str, variables: Optional[Dict[str, Any]] = None, token: Optional[str] = None) -> Dict[str, Any]:
        """Execute a GraphQL query or mutation.
        
        Args:
            query: GraphQL query or mutation string
            variables: Optional variables dictionary
            token: JWT token (takes precedence over context, instance, or environment token)
        
        Returns:
            Dictionary containing the GraphQL response data
        
        Raises:
            Exception: If HTTP error or GraphQL errors occur
        """
        # Priority: provided token > context variable > instance token > environment token
        auth_token = token
        if not auth_token:
            try:
                auth_token = token_context.get()
            except LookupError:
                pass
        if not auth_token:
            auth_token = self.token
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"

        # Log the GraphQL request
        import json as json_module
        logging.info("=" * 80)
        logging.info("GraphQL Request")
        logging.info("=" * 80)
        logging.info(f"URL: {self.base_url}")
        logging.info(f"Query:\n{query}")
        if variables:
            logging.info(f"Variables: {json_module.dumps(variables, indent=2)}")
        else:
            logging.info("Variables: None")
        logging.info(f"Token present: {bool(auth_token)}")
        logging.info("-" * 80)

        with httpx.Client() as client:
            try:
                response = client.post(
                    self.base_url,
                    json={"query": query, "variables": variables},
                    headers=headers,
                    timeout=30.0
                )
                response.raise_for_status()
                result = response.json()
                
                # Log the GraphQL response
                if "errors" in result:
                    logging.error("=" * 80)
                    logging.error("GraphQL Response - ERRORS")
                    logging.error("=" * 80)
                    logging.error(f"Errors: {json_module.dumps(result['errors'], indent=2)}")
                    if "data" in result:
                        logging.error(f"Partial Data: {json_module.dumps(result.get('data', {}), indent=2)}")
                    logging.error("=" * 80)
                    traceback.print_exc()
                    logging.error(f"GraphQL Errors: {result['errors']}", exc_info=True)
                    raise Exception(f"GraphQL Errors: {result['errors']}")
                
                # Log successful response
                response_data = result.get("data", {})
                logging.info("GraphQL Response - SUCCESS")
                logging.info("-" * 80)
                logging.info(f"Response Data: {json_module.dumps(response_data, indent=2)}")
                logging.info("=" * 80)
                
                return response_data
            except httpx.HTTPError as e:
                logging.error("=" * 80)
                logging.error("GraphQL Response - HTTP ERROR")
                logging.error("=" * 80)
                logging.error(f"HTTP Error: {str(e)}")
                logging.error("=" * 80)
                traceback.print_exc()
                logging.error(f"HTTP Error in GraphQL request: {e}", exc_info=True)
                raise Exception(f"HTTP Error: {str(e)}")


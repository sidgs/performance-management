import os
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
                
                if "errors" in result:
                    raise Exception(f"GraphQL Errors: {result['errors']}")
                
                return result.get("data", {})
            except httpx.HTTPError as e:
                raise Exception(f"HTTP Error: {str(e)}")


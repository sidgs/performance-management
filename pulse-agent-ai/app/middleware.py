"""HTTP middleware for request filtering and validation."""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import GOOGLE_CLOUD_PROJECT, GOOGLE_API_KEY


class AgentAvailabilityMiddleware(BaseHTTPMiddleware):
    """
    Middleware to check if Google Cloud Project and Google Gemini token are configured.
    
    If either is missing, returns a 503 Service Unavailable response with
    "Agent Offline" message.
    
    Health check endpoints are excluded from this check.
    """
    
    # Paths that should be excluded from the agent availability check
    EXCLUDED_PATHS = [
        "/api/v1/pulse-epm-agent/health",
        "/api/v1/pulse-epm-agent/openapi.json",
        "/docs",
        "/redoc",
        "/openapi.json",
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Check if the path should be excluded
        if any(request.url.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return await call_next(request)
        
        # Check if Google Cloud Project and API Key are configured
        if not GOOGLE_CLOUD_PROJECT or not GOOGLE_API_KEY:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "status": "offline",
                    "message": "Agent Offline",
                    "detail": "Google Cloud Project or Google Gemini API token is not configured. The agent is currently unavailable.",
                    "service": "pulse-epm-agent"
                }
            )
        
        # Continue with the request if configuration is present
        return await call_next(request)


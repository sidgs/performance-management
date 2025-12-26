"""Health check endpoints."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get(
    "/api/v1/pulse-epm-agent/health",
    summary="Health Check",
    description="Check the health status of the API service. Returns service status and health information.",
    response_description="Service health status"
)
async def health_check():
    """
    Health check endpoint.
    
    Use this endpoint to verify that the API is running and healthy.
    Returns a simple status message indicating the service is operational.
    """
    return {"status": "healthy", "service": "pulse-epm-agent", "version": "1.0.0"}


"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from app.config import API_TITLE, API_VERSION, API_DESCRIPTION
from app.routes import health, sessions, chat, info
from app.middleware import AgentAvailabilityMiddleware

# Initialize FastAPI app with enhanced metadata
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    contact={
        "name": "Pulse Performance Management",
    },
    license_info={
        "name": "Proprietary",
    },
    tags_metadata=[
        {
            "name": "health",
            "description": "Health check and service status endpoints",
        },
        {
            "name": "sessions",
            "description": "Session management endpoints for creating, retrieving, and deleting user sessions",
        },
        {
            "name": "chat",
            "description": "Chat endpoints for interacting with the AI agent",
        },
        {
            "name": "info",
            "description": "Information and documentation endpoints",
        },
    ],
)

# Add middleware for agent availability check
app.add_middleware(AgentAvailabilityMiddleware)

# Include routers
app.include_router(health.router)
app.include_router(sessions.router)
app.include_router(chat.router)
app.include_router(info.router)


# Custom OpenAPI schema handler
@app.get("/api/v1/pulse-epm-agent/openapi.json", tags=["info"], include_in_schema=False)
async def get_openapi_spec():
    """
    Get the OpenAPI 3.0 specification for this API.
    
    Returns the complete OpenAPI spec that can be used with tools like:
    - Swagger UI
    - Postman
    - OpenAPI Generator
    - API documentation tools
    """
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return openapi_schema


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


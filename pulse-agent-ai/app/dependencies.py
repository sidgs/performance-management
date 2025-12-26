"""Shared dependencies for the API."""
from google.adk.sessions import DatabaseSessionService
from app.config import DATABASE_URL, APP_NAME

# Initialize session service with PostgreSQL
session_service = DatabaseSessionService(db_url=DATABASE_URL)

# Export for use in routes
__all__ = ["session_service", "APP_NAME"]


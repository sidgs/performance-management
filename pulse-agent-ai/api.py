"""Entry point for the API - imports from the app package."""
# This file maintains backward compatibility
# The actual API is now structured in the app/ package
from app.main import app

__all__ = ["app"]


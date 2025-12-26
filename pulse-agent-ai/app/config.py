"""Configuration and constants for the API."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "dev")
DB_PASSWORD = os.getenv("DB_PASSWORD", "dev")
DB_NAME = os.getenv("DB_NAME", "dev")

# Construct database URL
# Use postgresql+asyncpg:// for async operations
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Constants
APP_NAME = os.getenv("APP_NAME", "pulse_performance_management")
AGENT_NAME = os.getenv("AGENT_NAME", "pulse_performance_agent")

# JWT Configuration
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
JWT_ALLOW_UNSIGNED = os.getenv("JWT_ALLOW_UNSIGNED", "").lower() == "true"

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# API Metadata
API_TITLE = "Pulse Performance Management Agent API"
API_VERSION = "1.0.0"
API_DESCRIPTION = """
AI-powered Performance Management Agent API built with Google ADK.

This API provides natural language interaction with the Performance Management System through
a stateful multi-agent architecture. The agent can help with:

* **Goal Management**: Create, update, assign, approve, and manage goals
* **User Management**: Create users, assign managers, manage teams
* **Department Management**: Create departments, assign users, manage hierarchies
* **KPI Management**: Create and track KPIs for goals
* **Goal Notes**: Add comments and updates to goals

## Authentication

All endpoints require JWT token authentication. The token must be provided in the
`Authorization: Bearer <token>` header when creating a session. The token is then
stored in the session state and used for all GraphQL API calls.

## Getting Started

1. Create a session with `POST /api/v1/pulse-epm-agent/sessions` (requires Authorization header)
2. Send chat messages with `POST /api/v1/pulse-epm-agent/chat/{session_id}`
3. List all active sessions with `GET /api/v1/pulse-epm-agent/sessions` (requires Authorization header)
4. View session state with `GET /api/v1/pulse-epm-agent/sessions/{session_id}`
"""


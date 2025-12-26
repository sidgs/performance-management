# Pulse Performance Management Agent

Google ADK agent for the Performance Management System. This agent provides natural language interaction with the Performance Management API through a stateful multi-agent architecture.

## Overview

This agent system consists of:
- **Root Agent** (`pulse_performance_agent`): Orchestrates user interactions and delegates to specialized agents
- **GraphQL Sub-Agent** (`performance_management_graphql_tool`): Handles all GraphQL operations for Users, Goals, Departments, KPIs, and Goal Notes
- **FastAPI Application**: Exposes the agent via REST API at `/api/v1/pulse-epm-agent` for chat UI integration
- **PostgreSQL Session Management**: Persistent session storage with JWT token authentication

## Technology Stack

- **Framework**: Google Agent Development Kit (ADK)
- **API Framework**: FastAPI
- **Session Storage**: PostgreSQL (via DatabaseSessionService)
- **GraphQL Client**: httpx
- **Python Version**: 3.13+

## Project Structure

```
pulse-agent-ai/
├── pulse_performance_agent/
│   ├── __init__.py
│   ├── agent.py                    # Root agent definition
│   ├── agent-instructions.txt      # Root agent instructions
│   ├── sub_agents/
│   │   └── performance_management_graphql_tool/
│   │       ├── __init__.py
│   │       ├── agent.py            # GraphQL sub-agent
│   │       ├── graphql_agent_instructions.py
│   │       └── utils/
│   │           ├── __init__.py
│   │           ├── graphql_client.py
│   │           ├── queries.py       # All GraphQL queries
│   │           └── tools.py         # Tool functions wrapping GraphQL calls
│   └── utils/
│       ├── __init__.py
│       └── session_utils.py         # Helper functions for state management
├── api.py                           # FastAPI application
├── pyproject.toml                  # Python project configuration
├── .env.example                    # Environment variable template
├── README.md                        # This file
└── run-agent.sh                    # Script to run the agent
```

## Prerequisites

1. **Python 3.13+**
2. **PostgreSQL** running locally with:
   - Database: `dev`
   - User: `dev`
   - Password: `dev`
   - Host: `localhost`
   - Port: `5432`
3. **uv** package manager (install with `pip install uv`)
4. **Google Cloud credentials** (API key or service account)

## Setup

### 1. Install Dependencies

```bash
cd pulse-agent-ai
uv sync
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `GOOGLE_CLOUD_PROJECT`: Your Google Cloud project ID
- `GOOGLE_API_KEY`: Your Google API key (or configure service account)
- `GRAPHQL_API_URL`: GraphQL endpoint URL (default: `http://localhost:8080/api/v1/performance-management/graphql`)
- Database configuration (defaults: localhost, dev/dev/dev)

### 3. Database Setup

Ensure PostgreSQL is running and the database exists:

```sql
CREATE DATABASE dev;
CREATE USER dev WITH PASSWORD 'dev';
GRANT ALL PRIVILEGES ON DATABASE dev TO dev;
```

The `DatabaseSessionService` will automatically create the necessary tables for session storage.

## Running the Agent

### Development Mode

Run the FastAPI server:

```bash
uv run python api.py
```

Or use the run script:

```bash
chmod +x run-agent.sh
./run-agent.sh
```

The API will be available at `http://localhost:8000`

### Production Mode

Use uvicorn directly:

```bash
uvicorn api:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Base Path: `/api/v1/pulse-epm-agent`

#### 1. Health Check
```
GET /api/v1/pulse-epm-agent/health
```
Returns service health status.

#### 2. Create Session
```
POST /api/v1/pulse-epm-agent/sessions
Headers:
  Authorization: Bearer <jwt_token>
Body:
  {
    "user_id": "user123",
    "user_email": "user@example.com",  # optional
    "user_name": "John Doe"            # optional
  }
Response:
  {
    "session_id": "session-uuid",
    "message": "Session created successfully"
  }
```

**Important**: The `Authorization: Bearer <token>` header is **required**. The JWT token is stored in session state and used for all GraphQL API calls.

#### 3. Send Chat Message
```
POST /api/v1/pulse-epm-agent/chat
Query Parameters:
  user_id: string (required)
Body:
  {
    "message": "Create a goal for improving customer satisfaction",
    "session_id": "session-uuid"
  }
Response:
  {
    "response": "Agent response text",
    "agent_name": "pulse_performance_agent"
  }
```

#### 4. Get Session State
```
GET /api/v1/pulse-epm-agent/sessions/{session_id}
Query Parameters:
  user_id: string (required)
Response:
  {
    "session_id": "session-uuid",
    "state": {
      "jwt_token": "...",
      "user_email": "...",
      "user_name": "...",
      "interaction_history": [...]
    }
  }
```

#### 5. Delete Session
```
DELETE /api/v1/pulse-epm-agent/sessions/{session_id}
Query Parameters:
  user_id: string (required)
```

## Authorization Flow

1. **Session Creation**: Client sends `POST /api/v1/pulse-epm-agent/sessions` with `Authorization: Bearer <token>` header
2. **Token Storage**: FastAPI extracts token and stores it in session state as `jwt_token`
3. **Agent Execution**: When agent calls GraphQL tools, the token is automatically retrieved from session state via context variables
4. **GraphQL Authentication**: All GraphQL API calls use the token from session state

**Critical**: The JWT token must be provided during session creation. Without it, the agent cannot authenticate with the GraphQL API.

## Integration with Java API

The agent connects to the Performance Management Java API GraphQL endpoint:
- **Endpoint**: `/api/v1/performance-management/graphql`
- **Authentication**: JWT token via `Authorization: Bearer <token>` header
- **Schema**: All queries and mutations match `pulse-java-api/src/main/resources/graphql/schema.graphqls`

## Agent Capabilities

The agent can help with:

- **Goal Management**: Create, update, assign, approve, and manage goals
- **User Management**: Create users, assign managers, manage teams
- **Department Management**: Create departments, assign users, manage hierarchies
- **KPI Management**: Create and track KPIs for goals
- **Goal Notes**: Add comments and updates to goals

## Example Usage

### 1. Create a Session

```bash
curl -X POST http://localhost:8000/api/v1/pulse-epm-agent/sessions \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "user_email": "john.doe@example.com",
    "user_name": "John Doe"
  }'
```

### 2. Send a Chat Message

```bash
curl -X POST "http://localhost:8000/api/v1/pulse-epm-agent/chat?user_id=user123" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a goal for improving customer satisfaction",
    "session_id": "session-uuid-from-step-1"
  }'
```

## Development

### Project Dependencies

Managed via `pyproject.toml` using `uv`:
- `google-adk>=1.20.0`
- `google-cloud-aiplatform>=1.129.0`
- `fastapi>=0.104.0`
- `uvicorn>=0.24.0`
- `httpx>=0.28.1`
- `psycopg2-binary>=2.9.0`
- `python-dotenv>=1.2.1`

### Adding New Tools

1. Add GraphQL query/mutation to `utils/queries.py`
2. Add tool function to `utils/tools.py`
3. Register tool in `agent.py` tools list

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Check database exists: `psql -U dev -d dev -c "SELECT 1;"`

### Authentication Issues
- Verify JWT token is provided in Authorization header during session creation
- Check token is stored in session state: `GET /api/v1/pulse-epm-agent/sessions/{session_id}`
- Ensure GraphQL API is accessible and accepts the token

### Agent Not Responding
- Check agent logs for errors
- Verify Google Cloud credentials are configured
- Ensure GraphQL API endpoint is correct in `.env`

## License

[Add license information]

## Support

[Add support contact information]



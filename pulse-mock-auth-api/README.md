# Pulse Mock Auth API

A simple FastAPI-based mock authentication API for the Performance Management System.

## Overview

This service provides a mock authentication endpoint that returns user information for development and testing purposes.

## Endpoints

### GET `/api/v1/auth/me`

Returns mock user information:

```json
{
  "email": "ajay@sidgs.com",
  "name": "Ajay Yeluri",
  "roles": ["admin", "user", "epm_admin"],
  "permissions": [],
  "groups": [],
  "tenantId": "localhost"
}
```

### GET `/health`

Health check endpoint that returns `{"status": "healthy"}`.

## Development

### Prerequisites

- Python 3.13+
- UV package manager

### Setup

1. Install dependencies:
```bash
uv sync
```

2. Run the server:
```bash
uv run uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.

## Docker

Build and run with Docker:

```bash
docker build -t pulse-mock-auth-api .
docker run -p 8000:8000 pulse-mock-auth-api
```


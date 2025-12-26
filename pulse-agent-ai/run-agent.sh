#!/bin/bash

# Run the Performance Management Agent FastAPI server

# Set default port
PORT=${PORT:-8000}

# Run with uvicorn
uv sync
echo "Starting Performance Management Agent API on port $PORT..."
uv run uvicorn api:app --host 0.0.0.0 --port $PORT --reload



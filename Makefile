.PHONY: help agent api start stop clean build-agent build-api

# Variables
AGENT_DIR=pulse-agent-ai
API_DIR=pulse-java-api
UI_DIR=pulse-react-ui
AGENT_PORT=8001
API_PORT=9080
AGENT_PID_FILE=.agent.pid
API_PID_FILE=.api.pid
SPRING_PROFILES_ACTIVE=local
GOOGLE_CLOUD_PROJECT=sami-ai-agentspace
GOOGLE_API_KEY=AIzaSyAj5ETkRyxaKrhdsoB6HDWDS5eY93X4JRE
GRAPHQL_API_URL=http://localhost:$(SERVER_PORT)/api/v1/epm/graphql
SERVER_PORT=9081
JWT_ALLOW_UNSIGNED=true
help:
	@echo "Performance Management System - Makefile"
	@echo "=========================================="
	@echo ""
	@echo "Available targets:"
	@echo "  start          - Start both agent and API services"
	@echo "  agent          - Start only the agent service (port $(AGENT_PORT))"
	@echo "  api            - Start only the Java API service (port $(API_PORT))"
	@echo "  stop           - Stop all running services"
	@echo "  build-agent    - Build the agent service dependencies"
	@echo "  build-api      - Build the Java API JAR file"
	@echo "  clean          - Clean build artifacts and stop services"
	@echo "  help           - Show this help message"	
	@echo ""
	@echo "Service URLs:"
	@echo "  Agent API:     http://localhost:$(AGENT_PORT)"
	@echo "  Java API:      http://localhost:$(SERVER_PORT)"
	@echo "  GraphQL:       http://localhost:$(API_PORT)/api/v1/epm/graphql"
	@echo ""
	@echo "Note: Services run in foreground. Use Ctrl+C to stop."
	@echo "      To run both services, use 'make start' (output will be interleaved)"
	@echo "      Or run 'make agent' and 'make api' in separate terminals"

# Start both services (runs in parallel, output will be interleaved)
start:
	@echo ""
	@echo "=========================================="
	@echo "Starting both services..."
	@echo "Agent API: http://localhost:$(AGENT_PORT)"
	@echo "Java API:  http://localhost:$(SERVER_PORT)"
	@echo "=========================================="
	@echo "Press Ctrl+C to stop all services"
	@echo ""
	@$(MAKE) -j2 agent api

# Start the agent service
agent:
	@echo "Starting Agent service on port $(AGENT_PORT)..."
	@echo "Press Ctrl+C to stop"
	@echo ""
	@cd $(AGENT_DIR) && \
	export GOOGLE_CLOUD_PROJECT=$(GOOGLE_CLOUD_PROJECT) && \
	export GOOGLE_API_KEY=$(GOOGLE_API_KEY) && \
	export GRAPHQL_API_URL=$(GRAPHQL_API_URL) && \
	export JWT_ALLOW_UNSIGNED=$(JWT_ALLOW_UNSIGNED) && \
	uv sync && \
	uv run uvicorn api:app --host 0.0.0.0 --port $(AGENT_PORT) --reload 

# Start the Java API service
api:
	@echo "Starting Java API service on port $(API_PORT)..."
	@echo "Press Ctrl+C to stop"
	@echo ""
	@cd $(API_DIR) && \
	export SPRING_PROFILES_ACTIVE=$(SPRING_PROFILES_ACTIVE) && \
	export SERVER_PORT=$(SERVER_PORT) && \
	export JWT_ALLOW_UNSIGNED=$(JWT_ALLOW_UNSIGNED) && \
	mvn spring-boot:run

# Stop all services (kills processes by port)
stop:
	@echo "Stopping services on ports 8001 and $(SERVER_PORT)..."
	@if lsof -ti:8001 > /dev/null 2>&1; then \
		echo "Killing process on port 8001 (Agent)..."; \
		lsof -ti:8001 | xargs kill -9 2>/dev/null || true; \
	else \
		echo "No process running on port 8001"; \
	fi
	@if lsof -ti:$(SERVER_PORT) > /dev/null 2>&1; then \
		echo "Killing process on port $(SERVER_PORT) (Java API)..."; \
		lsof -ti:$(SERVER_PORT) | xargs kill -9 2>/dev/null || true; \
	else \
		echo "No process running on port $(SERVER_PORT)"; \
	fi
	@rm -f $(AGENT_PID_FILE) $(API_PID_FILE)
	@echo "All services stopped"

# Build agent dependencies
build-agent:
	@echo "Building agent dependencies..."
	cd $(AGENT_DIR) && uv sync
	@echo "Agent dependencies built"

# Build Java API
build-api:
	@echo "Building Java API..."
	cd $(API_DIR) && mvn clean package -DskipTests
	@echo "Java API built"

# Clean build artifacts and stop services
clean: stop
	@echo "Cleaning build artifacts..."
	cd $(AGENT_DIR) && rm -rf __pycache__ .venv
	cd $(API_DIR) && mvn clean
	@echo "Clean complete"

ui-standalone-start:
	@echo "Starting UI standalone (localhost:5173)..."
	cd $(UI_DIR) && npm install && npm run dev:standalone


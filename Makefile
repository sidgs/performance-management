.PHONY: help agent api mock-auth start stop clean build-agent build-api build-mock-auth

# Variables
AGENT_DIR=pulse-agent-ai
API_DIR=pulse-java-api
MOCK_AUTH_DIR=pulse-mock-auth-api
UI_DIR=pulse-react-ui
AGENT_PORT=8001
API_PORT=9080
MOCK_AUTH_PORT=8000
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
	@echo "USAGE:"
	@echo "  make [target]"
	@echo ""
	@echo "QUICK START:"
	@echo "  1. Build all dependencies:"
	@echo "     make build-agent build-api build-mock-auth"
	@echo ""
	@echo "  2. Start all services:"
	@echo "     make start"
	@echo ""
	@echo "  3. Or start services individually in separate terminals:"
	@echo "     make agent      # Terminal 1: pulse-agent-ai"
	@echo "     make api        # Terminal 2: Java API"
	@echo "     make mock-auth  # Terminal 3: Mock Auth API"
	@echo ""
	@echo "  4. Stop all services:"
	@echo "     make stop"
	@echo ""
	@echo "AVAILABLE TARGETS:"
	@echo ""
	@echo "  Service Management:"
	@echo "    start          - Start all services (agent, API, and mock-auth) in parallel"
	@echo "    agent          - Start only pulse-agent-ai service (port $(AGENT_PORT))"
	@echo "    api            - Start only Java API service (port $(SERVER_PORT))"
	@echo "    mock-auth      - Start only Mock Auth API service (port $(MOCK_AUTH_PORT))"
	@echo "    stop           - Stop all running services (kills processes by port)"
	@echo ""
	@echo "  Build Targets:"
	@echo "    build-agent    - Build pulse-agent-ai Python dependencies (UV)"
	@echo "    build-api      - Build Java API JAR file (Maven)"
	@echo "    build-mock-auth - Build Mock Auth API Python dependencies (UV)"
	@echo ""
	@echo "  Maintenance:"
	@echo "    clean          - Stop services and clean all build artifacts"
	@echo "    help           - Show this help message"
	@echo ""
	@echo "  UI:"
	@echo "    ui-standalone-start - Start React UI in standalone mode (port 5173)"
	@echo ""
	@echo "SERVICE URLs:"
	@echo "  • Agent API (pulse-agent-ai):  http://localhost:$(AGENT_PORT)"
	@echo "  • Java API:                     http://localhost:$(SERVER_PORT)"
	@echo "  • Mock Auth API - /me:          http://localhost:$(MOCK_AUTH_PORT)/api/v1/auth/me"
	@echo "  • Mock Auth API - /jwt:         http://localhost:$(MOCK_AUTH_PORT)/api/v1/auth/jwt"
	@echo "  • GraphQL Endpoint:             http://localhost:$(SERVER_PORT)/api/v1/epm/graphql"
	@echo ""
	@echo "NOTES:"
	@echo "  • Services run in foreground - use Ctrl+C to stop individual services"
	@echo "  • When using 'make start', all services run in parallel (output interleaved)"
	@echo "  • For better log visibility, run services in separate terminals"
	@echo "  • First-time setup: Run build targets before starting services"
	@echo "  • Prerequisites:"
	@echo "    - Python 3.13+ with UV package manager (for agent and mock-auth)"
	@echo "    - Java and Maven (for Java API)"
	@echo "    - Node.js and npm (for UI)"
	@echo ""
	@echo "EXAMPLES:"
	@echo "  # Build everything first time"
	@echo "  make build-agent build-api build-mock-auth"
	@echo ""
	@echo "  # Start all services"
	@echo "  make start"
	@echo ""
	@echo "  # Start only the Java API"
	@echo "  make api"
	@echo ""
	@echo "  # Stop all services"
	@echo "  make stop"
	@echo ""
	@echo "  # Clean everything"
	@echo "  make clean"

# Start all services (runs in parallel, output will be interleaved)
start:
	@echo ""
	@echo "=========================================="
	@echo "Starting all services..."
	@echo "Agent API (pulse-agent-ai): http://localhost:$(AGENT_PORT)"
	@echo "Java API:                    http://localhost:$(SERVER_PORT)"
	@echo "Mock Auth API:               http://localhost:$(MOCK_AUTH_PORT)"
	@echo "=========================================="
	@echo "Press Ctrl+C to stop all services"
	@echo ""
	@$(MAKE) -j3 agent api mock-auth

# Start the pulse-agent-ai service
agent:
	@echo "Starting pulse-agent-ai service on port $(AGENT_PORT)..."
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
	@echo "Starting Java API service on port $(API_PORT) with debugger enabled..."
	@echo "Debugger port: 5005"
	@echo "Press Ctrl+C to stop"
	@echo ""
	@cd $(API_DIR) && \
	export SPRING_PROFILES_ACTIVE=$(SPRING_PROFILES_ACTIVE) && \
	export SERVER_PORT=$(SERVER_PORT) && \
	export JWT_ALLOW_UNSIGNED=$(JWT_ALLOW_UNSIGNED) && \
	mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Start the Mock Auth API service
mock-auth:
	@echo "Starting Mock Auth API service on port $(MOCK_AUTH_PORT)..."
	@echo "Press Ctrl+C to stop"
	@echo ""
	@cd $(MOCK_AUTH_DIR) && \
	uv sync && \
	uv run uvicorn api:app --host 0.0.0.0 --port $(MOCK_AUTH_PORT) --reload

# Stop all services (kills processes by port)
stop:
	@echo "Stopping services on ports $(MOCK_AUTH_PORT), 8001 and $(SERVER_PORT)..."
	@if lsof -ti:$(MOCK_AUTH_PORT) > /dev/null 2>&1; then \
		echo "Killing process on port $(MOCK_AUTH_PORT) (Mock Auth API)..."; \
		lsof -ti:$(MOCK_AUTH_PORT) | xargs kill -9 2>/dev/null || true; \
	else \
		echo "No process running on port $(MOCK_AUTH_PORT)"; \
	fi
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

# Build pulse-agent-ai dependencies
build-agent:
	@echo "Building pulse-agent-ai dependencies..."
	cd $(AGENT_DIR) && uv sync
	@echo "pulse-agent-ai dependencies built"

# Build Java API
build-api:
	@echo "Building Java API..."
	cd $(API_DIR) && mvn clean package -DskipTests
	@echo "Java API built"

# Build Mock Auth API dependencies
build-mock-auth:
	@echo "Building Mock Auth API dependencies..."
	cd $(MOCK_AUTH_DIR) && uv sync
	@echo "Mock Auth API dependencies built"

# Clean build artifacts and stop services
clean: stop
	@echo "Cleaning build artifacts..."
	cd $(AGENT_DIR) && rm -rf __pycache__ .venv
	cd $(MOCK_AUTH_DIR) && rm -rf __pycache__ .venv
	cd $(API_DIR) && mvn clean
	@echo "Clean complete"

ui-standalone-start:
	@echo "Starting UI standalone (localhost:5173)..."
	cd $(UI_DIR) && npm install && npm run dev:standalone


.PHONY: build run run-local run-dev clean help

# Variables
JAR_FILE=target/performance-management-api-1.0.0.jar
MAIN_CLASS=com.performancemanagement.PerformanceManagementApplication
SERVER_PORT=9081
DEBUG_PORT=5005

help:
	@echo "Available targets:"
	@echo "Available targets:"
	@echo "  build      - Build the JAR file using Maven"
	@echo "  run        - Run the built JAR file with debug mode (port $(DEBUG_PORT))"
	@echo "  run-local   - Run with 'local' profile (no Redis)"
	@echo "  run-dev     - Run with 'dev' profile (with Redis)"
	@echo "  run-demo    - Run with 'demo' profile (with Redis and demo data)"
	@echo "  clean       - Clean Maven build artifacts"
	@echo "  help        - Show this help message"

build:
	@echo "Building JAR file..."
	mvn clean package -DskipTests
	@echo "Build complete. JAR file: $(JAR_FILE)"

run: api

api: build
	@echo "Running application in debug mode (debug port: $(DEBUG_PORT))..."
	SPRING_PROFILES_ACTIVE=local java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:$(DEBUG_PORT) -jar $(JAR_FILE) --server.port=$(SERVER_PORT)

run-local: build
	@echo "Running application with 'local' profile (no Redis)..."
	SPRING_PROFILES_ACTIVE=local java -jar $(JAR_FILE) --server.port=$(SERVER_PORT)

run-dev: build
	@echo "Running application with 'dev' profile (with Redis)..."
	SPRING_PROFILES_ACTIVE=dev java -jar $(JAR_FILE) --server.port=$(SERVER_PORT)

run-demo: build
	@echo "Running application with 'demo' profile (with Redis and demo data)..."
	SPRING_PROFILES_ACTIVE=demo java -jar $(JAR_FILE) --server.port=$(SERVER_PORT)

clean:
	@echo "Cleaning build artifacts..."
	mvn clean
	@echo "Clean complete."

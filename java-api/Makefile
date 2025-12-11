.PHONY: build run run-local run-dev clean help

# Variables
JAR_FILE=target/performance-management-api-1.0.0.jar
MAIN_CLASS=com.performancemanagement.PerformanceManagementApplication

help:
	@echo "Available targets:"
	@echo "  build      - Build the JAR file using Maven"
	@echo "  run        - Run the built JAR file"
	@echo "  run-local   - Run with 'local' profile (no Redis)"
	@echo "  run-dev     - Run with 'dev' profile (with Redis)"
	@echo "  clean       - Clean Maven build artifacts"
	@echo "  help        - Show this help message"

build:
	@echo "Building JAR file..."
	mvn clean package -DskipTests
	@echo "Build complete. JAR file: $(JAR_FILE)"

run: build
	@echo "Running application..."
	java -jar $(JAR_FILE)

run-local: build
	@echo "Running application with 'local' profile (no Redis)..."
	java -jar $(JAR_FILE) --spring.profiles.active=local

run-dev: build
	@echo "Running application with 'dev' profile (with Redis)..."
	java -jar $(JAR_FILE) --spring.profiles.active=dev

clean:
	@echo "Cleaning build artifacts..."
	mvn clean
	@echo "Clean complete."

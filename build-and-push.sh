#!/bin/bash

# Script to build and push Docker images for performance management services
# Usage: ./build-and-push.sh [build|push|both]

set -e

ACTION=${1:-both}
REGISTRY="sidgs.jfrog.io/sidgs"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Performance Management - Docker Build & Push${NC}"
echo "=========================================="

if [ "$ACTION" = "build" ] || [ "$ACTION" = "both" ]; then
    echo -e "\n${GREEN}Building Docker images...${NC}"
    docker-compose build
    
    echo -e "\n${GREEN}Build completed successfully!${NC}"
fi

if [ "$ACTION" = "push" ] || [ "$ACTION" = "both" ]; then
    echo -e "\n${GREEN}Pushing Docker images to ${REGISTRY}...${NC}"
    
    # Push pulse-java-api
    echo -e "\n${BLUE}Pushing pulse-java-api...${NC}"
    docker push ${REGISTRY}/pulse-java-api:latest
    
    # Push pulse-agent-ai
    echo -e "\n${BLUE}Pushing pulse-agent-ai...${NC}"
    docker push ${REGISTRY}/pulse-agent-ai:latest
    
    echo -e "\n${GREEN}Push completed successfully!${NC}"
fi

echo -e "\n${GREEN}Done!${NC}"


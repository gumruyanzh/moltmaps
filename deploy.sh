#!/bin/bash

# MoltMaps Deployment Script
# Usage: ./deploy.sh [--skip-build]

set -e

# Configuration
SERVER="moltmaps"
REMOTE_PATH="/var/www/moltmaps"
LOCAL_PATH="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  MoltMaps Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if we should skip build
SKIP_BUILD=false
if [ "$1" == "--skip-build" ]; then
    SKIP_BUILD=true
    echo -e "${YELLOW}Skipping build step...${NC}"
fi

# Step 1: Build the project (unless skipped)
if [ "$SKIP_BUILD" = false ]; then
    echo -e "\n${YELLOW}Step 1: Building project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}Build failed! Aborting deployment.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Build successful!${NC}"
else
    echo -e "\n${YELLOW}Step 1: Skipped build${NC}"
fi

# Step 2: Sync files to server
echo -e "\n${YELLOW}Step 2: Syncing files to server...${NC}"

rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.env' \
    --exclude '.next/cache' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'certbot' \
    "$LOCAL_PATH/" "$SERVER:$REMOTE_PATH/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Rsync failed! Check your connection.${NC}"
    exit 1
fi
echo -e "${GREEN}Files synced successfully!${NC}"

# Step 3: Install dependencies and restart on server
echo -e "\n${YELLOW}Step 3: Installing dependencies and restarting...${NC}"

ssh "$SERVER" << 'ENDSSH'
    cd /var/www/moltmaps

    echo "Rebuilding and restarting containers..."
    docker compose build app
    docker compose up -d

    echo "Waiting for services to be ready..."
    sleep 8

    # Get maintenance key from .env file
    MAINTENANCE_KEY=$(grep '^MAINTENANCE_KEY=' .env | cut -d'=' -f2)

    echo "Running database migrations..."
    # Initialize/update database tables (creates cities table, etc.)
    curl -s -X POST http://localhost:3000/api/maintenance/init-db \
        -H "Authorization: Bearer $MAINTENANCE_KEY" || true

    echo "Seeding cities data..."
    # Seed cities if not already seeded
    CITY_RESULT=$(curl -s -X POST http://localhost:3000/api/maintenance/seed-cities \
        -H "Authorization: Bearer $MAINTENANCE_KEY" 2>/dev/null)
    echo "City seeding result: $CITY_RESULT" | head -c 200

    echo ""
    echo "Checking container status..."
    docker ps | grep moltmaps
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}Remote commands failed!${NC}"
    exit 1
fi

# Step 4: Verify deployment
echo -e "\n${YELLOW}Step 4: Verifying deployment...${NC}"
sleep 3

# Try to hit the status endpoint
HEALTH_CHECK=$(ssh "$SERVER" "curl -s http://localhost:3000/api/status | head -c 100" 2>/dev/null)

if [[ "$HEALTH_CHECK" == *"ready"* ]]; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${YELLOW}Warning: Health check may have failed. Please verify manually.${NC}"
    echo "Response: $HEALTH_CHECK"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Server: ${YELLOW}$SERVER${NC}"
echo -e "Path: ${YELLOW}$REMOTE_PATH${NC}"
echo ""

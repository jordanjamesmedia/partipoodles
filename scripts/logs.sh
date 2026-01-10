#!/bin/bash
# View deployment logs for Standard Parti Poodles Australia
# Usage: ./scripts/logs.sh [vercel|convex] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f ".env.local" ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

SERVICE=${1:-vercel}

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Parti Poodles Logs - $SERVICE${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

case $SERVICE in
    vercel)
        if [ -z "$VERCEL_TOKEN" ]; then
            echo -e "${RED}Error: VERCEL_TOKEN not set${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Fetching Vercel logs...${NC}"
        echo "Press Ctrl+C to exit"
        echo ""

        # Get the latest deployment URL
        DEPLOYMENT_URL=$(vercel ls --token "$VERCEL_TOKEN" 2>/dev/null | grep -E "https://" | head -1 | awk '{print $2}')

        if [ -n "$DEPLOYMENT_URL" ]; then
            echo "Latest deployment: $DEPLOYMENT_URL"
            echo ""
            vercel logs "$DEPLOYMENT_URL" --token "$VERCEL_TOKEN" --follow 2>/dev/null || \
            vercel logs --token "$VERCEL_TOKEN"
        else
            vercel logs --token "$VERCEL_TOKEN"
        fi
        ;;

    convex)
        echo -e "${YELLOW}Fetching Convex logs...${NC}"
        echo "Starting Convex dashboard..."
        npx convex dashboard
        ;;

    list)
        echo -e "${YELLOW}Recent Vercel Deployments:${NC}"
        vercel ls --token "$VERCEL_TOKEN" 2>/dev/null
        ;;

    inspect)
        DEPLOYMENT_URL=$2
        if [ -z "$DEPLOYMENT_URL" ]; then
            echo "Usage: ./scripts/logs.sh inspect <deployment-url>"
            exit 1
        fi
        echo -e "${YELLOW}Inspecting deployment: $DEPLOYMENT_URL${NC}"
        vercel inspect "$DEPLOYMENT_URL" --token "$VERCEL_TOKEN"
        ;;

    *)
        echo "Usage: ./scripts/logs.sh [vercel|convex|list|inspect]"
        echo ""
        echo "Commands:"
        echo "  vercel          - View Vercel deployment logs (streaming)"
        echo "  convex          - Open Convex dashboard for logs"
        echo "  list            - List recent Vercel deployments"
        echo "  inspect <url>   - Inspect a specific deployment"
        exit 1
        ;;
esac

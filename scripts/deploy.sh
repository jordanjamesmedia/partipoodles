#!/bin/bash
# Deploy script for Standard Parti Poodles Australia
# Usage: ./scripts/deploy.sh [preview|production|convex|all]

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

# Deployment target (default: production)
TARGET=${1:-production}

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Parti Poodles Deployment - $TARGET${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

deploy_vercel_preview() {
    echo -e "${YELLOW}Deploying to Vercel Preview...${NC}"
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}Error: VERCEL_TOKEN not set${NC}"
        echo "Run ./scripts/setup-cli.sh to configure"
        exit 1
    fi

    vercel --token "$VERCEL_TOKEN"
    echo -e "${GREEN}✓ Preview deployment complete${NC}"
}

deploy_vercel_production() {
    echo -e "${YELLOW}Deploying to Vercel Production...${NC}"
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}Error: VERCEL_TOKEN not set${NC}"
        echo "Run ./scripts/setup-cli.sh to configure"
        exit 1
    fi

    vercel --prod --token "$VERCEL_TOKEN"
    echo -e "${GREEN}✓ Production deployment complete${NC}"
}

deploy_convex() {
    echo -e "${YELLOW}Deploying Convex functions...${NC}"
    if [ -z "$CONVEX_DEPLOY_KEY" ]; then
        echo -e "${RED}Error: CONVEX_DEPLOY_KEY not set${NC}"
        echo "Run ./scripts/setup-cli.sh to configure"
        exit 1
    fi

    npx convex deploy
    echo -e "${GREEN}✓ Convex deployment complete${NC}"
}

case $TARGET in
    preview)
        deploy_vercel_preview
        ;;
    production|prod)
        deploy_vercel_production
        ;;
    convex)
        deploy_convex
        ;;
    all)
        deploy_convex
        deploy_vercel_production
        ;;
    logs)
        echo -e "${YELLOW}Fetching deployment logs...${NC}"
        vercel logs --token "$VERCEL_TOKEN"
        ;;
    status)
        echo -e "${YELLOW}Deployment Status${NC}"
        echo ""
        echo "Recent Vercel deployments:"
        vercel ls --token "$VERCEL_TOKEN" 2>/dev/null || echo "Unable to fetch Vercel deployments"
        ;;
    *)
        echo "Usage: ./scripts/deploy.sh [preview|production|convex|all|logs|status]"
        echo ""
        echo "Commands:"
        echo "  preview    - Deploy to Vercel preview environment"
        echo "  production - Deploy to Vercel production (default)"
        echo "  convex     - Deploy Convex backend functions"
        echo "  all        - Deploy both Convex and Vercel production"
        echo "  logs       - View latest deployment logs"
        echo "  status     - Check deployment status"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"

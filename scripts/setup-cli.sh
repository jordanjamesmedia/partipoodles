#!/bin/bash
# CLI Setup Script for Standard Parti Poodles Australia
# This script configures Vercel, Convex, and GitHub CLIs for deployment

set -e

echo "==================================================="
echo "  Deployment Tools Setup for Parti Poodles"
echo "==================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "This script will help you configure deployment tools."
echo "You'll need to provide API tokens from each service."
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check CLI installations
echo "Checking CLI installations..."
if command_exists vercel; then
    echo -e "${GREEN}✓ Vercel CLI installed${NC} ($(vercel --version))"
else
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

if command_exists convex; then
    echo -e "${GREEN}✓ Convex CLI installed${NC}"
else
    echo -e "${YELLOW}Installing Convex CLI...${NC}"
    npm install -g convex
fi

if command_exists gh; then
    echo -e "${GREEN}✓ GitHub CLI installed${NC} ($(gh --version | head -n1))"
else
    echo -e "${YELLOW}GitHub CLI not installed. Please install manually.${NC}"
fi

echo ""
echo "==================================================="
echo "  Token Configuration"
echo "==================================================="

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    touch .env.local
    echo "Created .env.local file"
fi

# Vercel Token Setup
echo ""
echo -e "${YELLOW}1. VERCEL TOKEN${NC}"
echo "   Get your token from: https://vercel.com/account/tokens"
echo "   Click 'Create Token' and copy the value"
echo ""
read -p "Enter your Vercel Token (or press Enter to skip): " VERCEL_TOKEN

if [ -n "$VERCEL_TOKEN" ]; then
    # Store in environment file
    if grep -q "VERCEL_TOKEN=" .env.local 2>/dev/null; then
        sed -i "s|VERCEL_TOKEN=.*|VERCEL_TOKEN=$VERCEL_TOKEN|" .env.local
    else
        echo "VERCEL_TOKEN=$VERCEL_TOKEN" >> .env.local
    fi
    echo -e "${GREEN}✓ Vercel token saved${NC}"

    # Test Vercel authentication
    echo "Testing Vercel authentication..."
    if VERCEL_TOKEN=$VERCEL_TOKEN vercel whoami 2>/dev/null; then
        echo -e "${GREEN}✓ Vercel authentication successful${NC}"
    else
        echo -e "${RED}✗ Vercel authentication failed. Please check your token.${NC}"
    fi
fi

# Convex Setup
echo ""
echo -e "${YELLOW}2. CONVEX DEPLOY KEY${NC}"
echo "   Get your deploy key from: https://dashboard.convex.dev"
echo "   Go to Settings > Deploy Keys > Generate Production Deploy Key"
echo ""
read -p "Enter your Convex Deploy Key (or press Enter to skip): " CONVEX_DEPLOY_KEY

if [ -n "$CONVEX_DEPLOY_KEY" ]; then
    if grep -q "CONVEX_DEPLOY_KEY=" .env.local 2>/dev/null; then
        sed -i "s|CONVEX_DEPLOY_KEY=.*|CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY|" .env.local
    else
        echo "CONVEX_DEPLOY_KEY=$CONVEX_DEPLOY_KEY" >> .env.local
    fi
    echo -e "${GREEN}✓ Convex deploy key saved${NC}"
fi

# GitHub CLI Setup
echo ""
echo -e "${YELLOW}3. GITHUB CLI${NC}"
echo "   Running interactive GitHub login..."
echo ""

if command_exists gh; then
    gh auth status 2>/dev/null || {
        echo "Please authenticate with GitHub:"
        gh auth login
    }
    echo -e "${GREEN}✓ GitHub CLI configured${NC}"
fi

# Link Vercel Project
echo ""
echo "==================================================="
echo "  Project Linking"
echo "==================================================="

if [ -n "$VERCEL_TOKEN" ]; then
    echo "Linking Vercel project..."
    if [ ! -d ".vercel" ]; then
        VERCEL_TOKEN=$VERCEL_TOKEN vercel link --yes 2>/dev/null || {
            echo -e "${YELLOW}Please link your Vercel project manually with: vercel link${NC}"
        }
    else
        echo -e "${GREEN}✓ Vercel project already linked${NC}"
    fi
fi

echo ""
echo "==================================================="
echo "  Setup Complete!"
echo "==================================================="
echo ""
echo "Available deployment commands:"
echo "  npm run deploy         - Deploy to Vercel production"
echo "  npm run deploy:preview - Deploy preview to Vercel"
echo "  npm run deploy:logs    - View deployment logs"
echo "  npm run deploy:list    - List all deployments"
echo ""
echo "Convex commands:"
echo "  npx convex dev         - Start Convex dev server"
echo "  npx convex deploy      - Deploy Convex functions"
echo ""
echo "GitHub commands:"
echo "  gh pr list             - List pull requests"
echo "  gh pr create           - Create a pull request"
echo "  gh issue list          - List issues"
echo ""

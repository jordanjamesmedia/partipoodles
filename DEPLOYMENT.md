# Deployment Guide - Standard Parti Poodles Australia

This guide explains how to deploy the application using CLI tools.

## Prerequisites

The following CLI tools are installed in this project:
- **Vercel CLI** (v50.1.5) - For frontend deployment
- **Convex CLI** (v1.31.2) - For backend database functions
- **GitHub CLI** (v2.63.2) - For repository management

## Quick Start

Run the setup script to configure all deployment tools:

```bash
npm run setup
```

Or run directly:
```bash
./scripts/setup-cli.sh
```

## Getting Your API Tokens

### 1. Vercel Token

1. Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Give it a name (e.g., "partipoodles-cli")
4. Set expiration (recommended: No Expiration for CI/CD)
5. Copy the token immediately (it won't be shown again)

### 2. Convex Deploy Key

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Deploy Keys**
4. Click **"Generate Production Deploy Key"**
5. Copy the deploy key

### 3. GitHub CLI Authentication

Run interactive login:
```bash
gh auth login
```

Or use a Personal Access Token:
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with `repo` and `read:org` scopes
3. Run: `gh auth login --with-token < token.txt`

## Deployment Commands

### Vercel (Frontend)

| Command | Description |
|---------|-------------|
| `npm run deploy` | Deploy to production |
| `npm run deploy:preview` | Deploy preview build |
| `npm run deploy:logs` | View deployment logs |
| `npm run deploy:list` | List all deployments |
| `npm run deploy:inspect` | Inspect current deployment |
| `npm run deploy:status` | Check deployment status |

### Convex (Backend)

| Command | Description |
|---------|-------------|
| `npm run convex:dev` | Start local development server |
| `npm run convex:deploy` | Deploy functions to production |
| `npm run convex:dashboard` | Open Convex dashboard |

### Combined Deployment

| Command | Description |
|---------|-------------|
| `npm run deploy:all` | Deploy both Convex and Vercel |

### Logs

| Command | Description |
|---------|-------------|
| `npm run logs` | View logs (default: Vercel) |
| `npm run logs:vercel` | View Vercel logs |
| `npm run logs:convex` | Open Convex logs dashboard |

## Environment Variables

Store your tokens in `.env.local` (never commit this file):

```env
VERCEL_TOKEN=your_vercel_token_here
CONVEX_DEPLOY_KEY=your_convex_deploy_key_here
```

## GitHub Actions (CI/CD)

The project includes automated deployment via GitHub Actions (`.github/workflows/deploy.yml`).

Required secrets in GitHub repository settings:
- `VERCEL_TOKEN` - Vercel API token
- `ORG_ID` - Vercel organization ID
- `PROJECT_ID` - Vercel project ID
- `CONVEX_DEPLOY_KEY` - Convex production deploy key

## Manual Deployment Steps

### Full Deployment Process

1. **Build the project locally** (optional, for testing):
   ```bash
   npm run build
   ```

2. **Deploy Convex functions**:
   ```bash
   npm run convex:deploy
   ```

3. **Deploy to Vercel**:
   ```bash
   npm run deploy
   ```

### Preview Deployment

For testing changes before production:
```bash
npm run deploy:preview
```

This creates a unique preview URL for testing.

## Troubleshooting

### "No credentials found" Error
Run `npm run setup` to configure your tokens.

### "Project not linked" Error
```bash
vercel link
```

### Convex Deployment Fails
Ensure your `CONVEX_DEPLOY_KEY` is set correctly and the project is properly configured in `convex.json`.

### GitHub CLI Not Authenticated
```bash
gh auth login
```

## Project URLs

- **Production**: [https://partipoodles.vercel.app](https://partipoodles.vercel.app)
- **Convex Dashboard**: [https://dashboard.convex.dev](https://dashboard.convex.dev)
- **GitHub Repository**: [https://github.com/jordanjamesmedia/partipoodles](https://github.com/jordanjamesmedia/partipoodles)

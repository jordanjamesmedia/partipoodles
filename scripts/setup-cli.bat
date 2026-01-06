@echo off
REM CLI Setup Script for Standard Parti Poodles Australia (Windows)
REM This script configures Vercel, Convex, and GitHub CLIs for deployment

echo ===================================================
echo   Deployment Tools Setup for Parti Poodles
echo ===================================================
echo.

REM Check if running from project root
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    echo Example: cd C:\path\to\partipoodles
    pause
    exit /b 1
)

echo Checking CLI installations...
echo.

REM Check Vercel CLI
where vercel >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Vercel CLI installed
) else (
    echo [INSTALLING] Vercel CLI...
    npm install -g vercel
)

REM Check Convex CLI
where convex >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Convex CLI installed
) else (
    echo [INSTALLING] Convex CLI...
    npm install -g convex
)

REM Check GitHub CLI
where gh >nul 2>&1
if %errorlevel%==0 (
    echo [OK] GitHub CLI installed
) else (
    echo [WARNING] GitHub CLI not installed
    echo Download from: https://cli.github.com/
)

echo.
echo ===================================================
echo   Authentication Setup
echo ===================================================
echo.

REM Vercel Login
echo 1. VERCEL AUTHENTICATION
echo    Opening browser for Vercel login...
echo.
vercel login

echo.
echo 2. CONVEX AUTHENTICATION
echo    Opening browser for Convex login...
echo.
npx convex login

echo.
echo 3. GITHUB CLI AUTHENTICATION
echo    Opening browser for GitHub login...
echo.
gh auth login

echo.
echo ===================================================
echo   Linking Vercel Project
echo ===================================================
echo.

if not exist ".vercel" (
    echo Linking to Vercel project...
    vercel link
) else (
    echo [OK] Vercel project already linked
)

echo.
echo ===================================================
echo   Setup Complete!
echo ===================================================
echo.
echo Available commands:
echo   npm run deploy          - Deploy to Vercel production
echo   npm run deploy:preview  - Deploy preview to Vercel
echo   npm run deploy:logs     - View deployment logs
echo   npm run convex:dev      - Start Convex dev server
echo   npm run convex:deploy   - Deploy Convex functions
echo.
pause

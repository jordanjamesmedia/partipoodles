# Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. npm install fails with dependency errors

**Error**: `ERESOLVE unable to resolve dependency tree`

**Solution**:
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or force the installation
npm install --force

# Or clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. Database connection fails

**Error**: `NeonDbError: Error connecting to database: fetch failed`

**Solutions**:

a) **No internet connection or firewall blocking**:
   - Check your internet connection
   - Check if your firewall is blocking outbound connections
   - Try using a different network

b) **Invalid credentials**:
   - Verify your DATABASE_URL in .env file
   - Make sure it follows this format:
     ```
     postgresql://username:password@host.neon.tech/database_name?sslmode=require
     ```
   - Ensure there are no spaces or line breaks in the URL

c) **Test without database** (Demo Mode):
   ```bash
   npm run demo
   ```
   This runs the backend with mock data, no database needed.

### 3. Cloudinary setup issues

**Error**: Image uploads fail

**Solutions**:
- Verify your Cloudinary credentials in .env:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
- Check your Cloudinary dashboard for quota limits
- For testing, you can skip Cloudinary setup initially

### 4. Port already in use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find what's using port 3000
lsof -i :3000  # On Mac/Linux
netstat -ano | findstr :3000  # On Windows

# Kill the process or use a different port
PORT=3001 npm run dev
```

### 5. Missing environment variables

**Error**: Various errors about undefined values

**Solution**:
1. Run the setup wizard:
   ```bash
   npm run setup
   ```

2. Or manually create .env file:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

### 6. Session/Login issues

**Error**: Can't login or session expires immediately

**Solutions**:
- Clear browser cookies
- Ensure SESSION_SECRET is set in .env
- For production, ensure cookies are configured for HTTPS

## Quick Start Options

### Option 1: Demo Mode (No External Services)
```bash
cd backend
npm install
npm run demo
# Visit http://localhost:3000/admin
# Login: demo / demo123
```

### Option 2: Full Setup
```bash
cd backend
npm install
npm run setup  # Interactive setup wizard
npm run setup-db  # Create database tables
npm run dev
```

### Option 3: Manual Setup
1. Create accounts at:
   - https://neon.tech (Database)
   - https://cloudinary.com (Image storage)

2. Configure .env file with your credentials

3. Run:
   ```bash
   npm install
   npm run setup-db
   npm run dev
   ```

## Production Deployment

### Deploy to Render.com
1. Create account at render.com
2. Create new Web Service
3. Connect your GitHub repo
4. Set environment variables
5. Build command: `npm install`
6. Start command: `npm start`

### Deploy to Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SESSION_SECRET=your-secret
heroku config:set CLOUDINARY_CLOUD_NAME=your-name
# ... set other env vars
git push heroku main
```

### Deploy to VPS (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd your-repo/backend
npm install
npm run setup

# Start with PM2
pm2 start server.js --name parti-poodles
pm2 save
pm2 startup
```

## Need Help?

1. Check the logs:
   - Console output when running the server
   - Browser console for frontend errors
   - Network tab in browser DevTools

2. Test individual components:
   - Database: `npm run setup-db`
   - API: Visit `/api/gallery` and `/api/puppies`
   - Admin: Try demo mode first

3. Common fixes:
   - Delete node_modules and reinstall
   - Clear browser cache and cookies
   - Restart your terminal/computer
   - Try a different Node.js version (14+ required)
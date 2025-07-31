const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration for API routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(flash());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express layouts setup
app.use(expressLayouts);
app.set('layout', 'admin/layout');

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Root redirect to admin
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('WARNING: Failed to connect to database.');
      console.warn('The server will start but database operations will fail.');
      console.warn('Please configure your Neon database credentials in .env file.');
      console.warn('');
      console.warn('To set up Neon:');
      console.warn('1. Create account at https://neon.tech');
      console.warn('2. Create a new project');
      console.warn('3. Copy the connection string to .env file');
      console.warn('4. Run: npm run setup-db');
      console.warn('');
    } else {
      console.log('✓ Database connected successfully');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
      console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
      console.log('\nNOTE: This is a development server.');
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
        console.log('\n⚠️  Database not configured! See .env.example for setup instructions.');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
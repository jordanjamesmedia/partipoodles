const bcrypt = require('bcryptjs');
const { sql } = require('../config/database');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to access this page');
  res.redirect('/admin/login');
};

// Middleware to check if user is already logged in
const isGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

// Login function
const authenticateUser = async (username, password) => {
  try {
    const users = await sql`
      SELECT id, username, password_hash, is_active 
      FROM admin_users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      return { success: false, message: 'Invalid username or password' };
    }

    const user = users[0];

    if (!user.is_active) {
      return { success: false, message: 'Account is disabled' };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Update last login
    await sql`
      UPDATE admin_users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE id = ${user.id}
    `;

    return { 
      success: true, 
      user: { id: user.id, username: user.username } 
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'An error occurred during authentication' };
  }
};

// Activity logger middleware
const logActivity = async (req, action, resourceType = null, resourceId = null, details = null) => {
  try {
    const userId = req.session.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;

    await sql`
      INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address)
      VALUES (${userId}, ${action}, ${resourceType}, ${resourceId}, ${details}, ${ipAddress})
    `;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  isAuthenticated,
  isGuest,
  authenticateUser,
  logActivity
};
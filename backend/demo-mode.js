// Demo mode - Run backend without external services for testing
const express = require('express');
const session = require('express-session');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'demo-secret-key',
  resave: false,
  saveUninitialized: false
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'admin/layout');

// Demo data
const demoPhotos = [
  {
    id: '1',
    title: 'Beautiful Parti Poodle',
    caption: 'A gorgeous standard parti poodle in the garden',
    image_url: 'https://via.placeholder.com/400x300?text=Demo+Photo+1',
    is_active: true,
    category: 'Adults',
    created_at: new Date()
  },
  {
    id: '2',
    title: 'Puppy Playing',
    caption: 'Adorable parti poodle puppy at play',
    image_url: 'https://via.placeholder.com/400x300?text=Demo+Photo+2',
    is_active: true,
    category: 'Puppies',
    created_at: new Date()
  }
];

const demoPuppies = [
  {
    id: '1',
    name: 'Bella',
    gender: 'Female',
    color: 'Black and White',
    dob: new Date('2024-01-15'),
    description: 'Sweet and playful puppy looking for a loving home',
    price: '$2,500',
    status: 'available',
    main_image_url: 'https://via.placeholder.com/400x300?text=Bella',
    image_count: 3,
    images: []
  },
  {
    id: '2',
    name: 'Max',
    gender: 'Male',
    color: 'Brown and White',
    dob: new Date('2024-01-20'),
    description: 'Energetic and friendly, loves to play',
    price: '$2,500',
    status: 'available',
    main_image_url: 'https://via.placeholder.com/400x300?text=Max',
    image_count: 2,
    images: []
  }
];

// Demo user
const demoUser = {
  id: 'demo-user',
  username: 'demo',
  password: 'demo123' // In real app, this would be hashed
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Admin login
app.get('/admin/login', (req, res) => {
  res.render('admin/login', { 
    title: 'Admin Login',
    error: '',
    success: '',
    layout: false
  });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === demoUser.username && password === demoUser.password) {
    req.session.userId = demoUser.id;
    req.session.username = demoUser.username;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { 
      title: 'Admin Login',
      error: 'Invalid username or password (try: demo/demo123)',
      success: '',
      layout: false
    });
  }
});

// Admin logout
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/admin/login');
}

// Admin dashboard
app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  res.render('admin/dashboard', {
    title: 'Admin Dashboard',
    username: req.session.username,
    stats: {
      photos: demoPhotos.filter(p => p.is_active).length,
      puppies: demoPuppies.filter(p => p.status === 'available').length
    },
    activities: [
      {
        username: 'demo',
        action: 'login',
        resource_type: 'admin_users',
        details: {},
        created_at: new Date()
      }
    ]
  });
});

// Gallery management
app.get('/admin/gallery', isAuthenticated, (req, res) => {
  res.render('admin/gallery', {
    title: 'Gallery Management',
    username: req.session.username,
    photos: demoPhotos,
    success: '',
    error: ''
  });
});

// Puppies management
app.get('/admin/puppies', isAuthenticated, (req, res) => {
  res.render('admin/puppies', {
    title: 'Puppy Management',
    username: req.session.username,
    puppies: demoPuppies,
    success: '',
    error: ''
  });
});

// Puppy edit page
app.get('/admin/puppies/:id/edit', isAuthenticated, (req, res) => {
  const puppy = demoPuppies.find(p => p.id === req.params.id);
  if (!puppy) {
    return res.redirect('/admin/puppies');
  }
  
  res.render('admin/puppy-edit', {
    title: 'Edit Puppy',
    username: req.session.username,
    puppy: puppy,
    success: '',
    error: ''
  });
});

// API endpoints
app.get('/api/gallery', (req, res) => {
  res.json({
    success: true,
    photos: demoPhotos.filter(p => p.is_active)
  });
});

app.get('/api/puppies', (req, res) => {
  res.json({
    success: true,
    puppies: demoPuppies.filter(p => p.status === 'available')
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🎭 DEMO MODE - Running without database/cloud services');
  console.log('================================================\n');
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
  console.log('\n📝 Demo Login Credentials:');
  console.log('   Username: demo');
  console.log('   Password: demo123');
  console.log('\n⚠️  This is DEMO MODE - changes will not be saved!');
  console.log('To use real database and storage, run: npm run setup\n');
});
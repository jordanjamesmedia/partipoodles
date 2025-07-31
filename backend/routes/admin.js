const express = require('express');
const router = express.Router();
const { isAuthenticated, isGuest, authenticateUser, logActivity } = require('../middleware/auth');
const galleryController = require('../controllers/galleryController');
const puppyController = require('../controllers/puppyController');
const { uploadGallery, uploadPuppy } = require('../config/cloudinary');
const { sql } = require('../config/database');

// Login page
router.get('/login', isGuest, (req, res) => {
  res.render('admin/login', { 
    title: 'Admin Login',
    error: req.flash('error'),
    success: req.flash('success'),
    layout: false
  });
});

// Login handler
router.post('/login', isGuest, async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authenticateUser(username, password);
  
  if (result.success) {
    req.session.userId = result.user.id;
    req.session.username = result.user.username;
    await logActivity(req, 'login', 'admin_users', result.user.id, null);
    res.redirect('/admin/dashboard');
  } else {
    req.flash('error', result.message);
    res.redirect('/admin/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
});

// Dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get statistics
    const photoCount = await sql`SELECT COUNT(*) as count FROM gallery_photos WHERE is_active = true`;
    const puppyCount = await sql`SELECT COUNT(*) as count FROM puppies WHERE status = 'available'`;
    const recentActivity = await sql`
      SELECT al.*, au.username 
      FROM activity_logs al
      JOIN admin_users au ON al.user_id = au.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `;

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      username: req.session.username,
      stats: {
        photos: photoCount[0].count,
        puppies: puppyCount[0].count
      },
      activities: recentActivity
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      username: req.session.username,
      stats: { photos: 0, puppies: 0 },
      activities: []
    });
  }
});

// Gallery management page
router.get('/gallery', isAuthenticated, async (req, res) => {
  try {
    const photos = await sql`
      SELECT * FROM gallery_photos 
      ORDER BY display_order ASC, created_at DESC
    `;
    
    res.render('admin/gallery', {
      title: 'Gallery Management',
      username: req.session.username,
      photos,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Gallery page error:', error);
    req.flash('error', 'Error loading gallery');
    res.redirect('/admin/dashboard');
  }
});

// Puppies management page
router.get('/puppies', isAuthenticated, async (req, res) => {
  try {
    const puppies = await sql`
      SELECT p.*, COUNT(pi.id) as image_count
      FROM puppies p
      LEFT JOIN puppy_images pi ON p.id = pi.puppy_id
      GROUP BY p.id
      ORDER BY p.display_order ASC, p.created_at DESC
    `;
    
    res.render('admin/puppies', {
      title: 'Puppy Management',
      username: req.session.username,
      puppies,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Puppies page error:', error);
    req.flash('error', 'Error loading puppies');
    res.redirect('/admin/dashboard');
  }
});

// Single puppy edit page
router.get('/puppies/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const puppies = await sql`
      SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'caption', pi.caption,
              'display_order', pi.display_order
            ) ORDER BY pi.display_order
          ) FILTER (WHERE pi.id IS NOT NULL), 
          '[]'
        ) as images
      FROM puppies p
      LEFT JOIN puppy_images pi ON p.id = pi.puppy_id
      WHERE p.id = ${id}
      GROUP BY p.id
    `;

    if (puppies.length === 0) {
      req.flash('error', 'Puppy not found');
      return res.redirect('/admin/puppies');
    }

    res.render('admin/puppy-edit', {
      title: 'Edit Puppy',
      username: req.session.username,
      puppy: puppies[0],
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Puppy edit page error:', error);
    req.flash('error', 'Error loading puppy');
    res.redirect('/admin/puppies');
  }
});

// API endpoints for AJAX requests

// Gallery API
router.post('/api/gallery', isAuthenticated, uploadGallery.single('image'), galleryController.uploadPhoto);
router.put('/api/gallery/:id', isAuthenticated, galleryController.updatePhoto);
router.delete('/api/gallery/:id', isAuthenticated, galleryController.deletePhoto);
router.post('/api/gallery/reorder', isAuthenticated, galleryController.reorderPhotos);

// Puppies API
router.get('/api/puppies', isAuthenticated, puppyController.getAllPuppies);
router.post('/api/puppies', isAuthenticated, uploadPuppy.single('image'), puppyController.createPuppy);
router.put('/api/puppies/:id', isAuthenticated, uploadPuppy.single('image'), puppyController.updatePuppy);
router.delete('/api/puppies/:id', isAuthenticated, puppyController.deletePuppy);
router.post('/api/puppies/:id/images', isAuthenticated, uploadPuppy.single('image'), puppyController.addPuppyImage);
router.delete('/api/puppies/:id/images/:imageId', isAuthenticated, puppyController.deletePuppyImage);

module.exports = router;
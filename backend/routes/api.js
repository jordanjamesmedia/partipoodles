const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const puppyController = require('../controllers/puppyController');

// Public API routes (no auth required)

// Gallery routes
router.get('/gallery', galleryController.getActivePhotos);

// Puppy routes
router.get('/puppies', puppyController.getAvailablePuppies);
router.get('/puppies/:id', puppyController.getPuppy);

module.exports = router;
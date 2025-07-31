const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for gallery photos
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'parti-poodles/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:best' }
    ]
  }
});

// Create storage for puppy photos
const puppyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'parti-poodles/puppies',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:best' }
    ]
  }
});

// Create multer upload instances
const uploadGallery = multer({ 
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const uploadPuppy = multer({ 
  storage: puppyStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadGallery,
  uploadPuppy,
  deleteImage
};
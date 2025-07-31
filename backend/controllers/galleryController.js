const { sql } = require('../config/database');
const { deleteImage } = require('../config/cloudinary');
const { logActivity } = require('../middleware/auth');

// Get all gallery photos
const getAllPhotos = async (req, res) => {
  try {
    const photos = await sql`
      SELECT * FROM gallery_photos 
      ORDER BY display_order ASC, created_at DESC
    `;
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ success: false, message: 'Error fetching photos' });
  }
};

// Get active gallery photos (for public API)
const getActivePhotos = async (req, res) => {
  try {
    const photos = await sql`
      SELECT id, title, caption, image_url, category 
      FROM gallery_photos 
      WHERE is_active = true
      ORDER BY display_order ASC, created_at DESC
    `;
    res.json({ success: true, photos });
  } catch (error) {
    console.error('Error fetching active photos:', error);
    res.status(500).json({ success: false, message: 'Error fetching photos' });
  }
};

// Upload new photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, caption, category, display_order } = req.body;
    const image_url = req.file.path;
    const cloudinary_public_id = req.file.filename;
    const uploaded_by = req.session.username;

    const result = await sql`
      INSERT INTO gallery_photos 
      (title, caption, image_url, cloudinary_public_id, category, display_order, uploaded_by)
      VALUES (${title}, ${caption}, ${image_url}, ${cloudinary_public_id}, ${category}, ${display_order || 0}, ${uploaded_by})
      RETURNING *
    `;

    await logActivity(req, 'upload_photo', 'gallery_photos', result[0].id, { title });

    res.json({ success: true, photo: result[0] });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ success: false, message: 'Error uploading photo' });
  }
};

// Update photo
const updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, category, display_order, is_active } = req.body;

    const result = await sql`
      UPDATE gallery_photos
      SET 
        title = ${title},
        caption = ${caption},
        category = ${category},
        display_order = ${display_order},
        is_active = ${is_active},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    await logActivity(req, 'update_photo', 'gallery_photos', id, { title });

    res.json({ success: true, photo: result[0] });
  } catch (error) {
    console.error('Error updating photo:', error);
    res.status(500).json({ success: false, message: 'Error updating photo' });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // Get photo details first
    const photos = await sql`
      SELECT cloudinary_public_id, title 
      FROM gallery_photos 
      WHERE id = ${id}
    `;

    if (photos.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    const photo = photos[0];

    // Delete from Cloudinary
    if (photo.cloudinary_public_id) {
      await deleteImage(photo.cloudinary_public_id);
    }

    // Delete from database
    await sql`DELETE FROM gallery_photos WHERE id = ${id}`;

    await logActivity(req, 'delete_photo', 'gallery_photos', id, { title: photo.title });

    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, message: 'Error deleting photo' });
  }
};

// Reorder photos
const reorderPhotos = async (req, res) => {
  try {
    const { photoOrders } = req.body; // Array of { id, display_order }

    // Update each photo's display order
    for (const order of photoOrders) {
      await sql`
        UPDATE gallery_photos
        SET display_order = ${order.display_order}
        WHERE id = ${order.id}
      `;
    }

    await logActivity(req, 'reorder_photos', 'gallery_photos', null, { count: photoOrders.length });

    res.json({ success: true, message: 'Photos reordered successfully' });
  } catch (error) {
    console.error('Error reordering photos:', error);
    res.status(500).json({ success: false, message: 'Error reordering photos' });
  }
};

module.exports = {
  getAllPhotos,
  getActivePhotos,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  reorderPhotos
};
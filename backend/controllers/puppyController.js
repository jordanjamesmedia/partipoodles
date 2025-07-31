const { sql } = require('../config/database');
const { deleteImage } = require('../config/cloudinary');
const { logActivity } = require('../middleware/auth');

// Get all puppies
const getAllPuppies = async (req, res) => {
  try {
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
      GROUP BY p.id
      ORDER BY p.display_order ASC, p.created_at DESC
    `;
    res.json({ success: true, puppies });
  } catch (error) {
    console.error('Error fetching puppies:', error);
    res.status(500).json({ success: false, message: 'Error fetching puppies' });
  }
};

// Get available puppies (for public API)
const getAvailablePuppies = async (req, res) => {
  try {
    const puppies = await sql`
      SELECT p.id, p.name, p.gender, p.color, p.dob, p.description, 
             p.price, p.status, p.main_image_url, p.is_featured,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'caption', pi.caption
            ) ORDER BY pi.display_order
          ) FILTER (WHERE pi.id IS NOT NULL), 
          '[]'
        ) as images
      FROM puppies p
      LEFT JOIN puppy_images pi ON p.id = pi.puppy_id
      WHERE p.status = 'available'
      GROUP BY p.id
      ORDER BY p.is_featured DESC, p.display_order ASC, p.created_at DESC
    `;
    res.json({ success: true, puppies });
  } catch (error) {
    console.error('Error fetching available puppies:', error);
    res.status(500).json({ success: false, message: 'Error fetching puppies' });
  }
};

// Get single puppy
const getPuppy = async (req, res) => {
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
      return res.status(404).json({ success: false, message: 'Puppy not found' });
    }

    res.json({ success: true, puppy: puppies[0] });
  } catch (error) {
    console.error('Error fetching puppy:', error);
    res.status(500).json({ success: false, message: 'Error fetching puppy' });
  }
};

// Create new puppy
const createPuppy = async (req, res) => {
  try {
    const { name, gender, color, dob, description, price, status, display_order, is_featured } = req.body;
    
    let main_image_url = null;
    let cloudinary_public_id = null;

    if (req.file) {
      main_image_url = req.file.path;
      cloudinary_public_id = req.file.filename;
    }

    const result = await sql`
      INSERT INTO puppies 
      (name, gender, color, dob, description, price, status, main_image_url, cloudinary_public_id, display_order, is_featured)
      VALUES (${name}, ${gender}, ${color}, ${dob}, ${description}, ${price}, ${status || 'available'}, 
              ${main_image_url}, ${cloudinary_public_id}, ${display_order || 0}, ${is_featured || false})
      RETURNING *
    `;

    await logActivity(req, 'create_puppy', 'puppies', result[0].id, { name });

    res.json({ success: true, puppy: result[0] });
  } catch (error) {
    console.error('Error creating puppy:', error);
    res.status(500).json({ success: false, message: 'Error creating puppy' });
  }
};

// Update puppy
const updatePuppy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, color, dob, description, price, status, display_order, is_featured } = req.body;

    let updateQuery = sql`
      UPDATE puppies
      SET 
        name = ${name},
        gender = ${gender},
        color = ${color},
        dob = ${dob},
        description = ${description},
        price = ${price},
        status = ${status},
        display_order = ${display_order},
        is_featured = ${is_featured},
        updated_at = CURRENT_TIMESTAMP
    `;

    // If new main image uploaded
    if (req.file) {
      // Get old image to delete
      const oldPuppy = await sql`
        SELECT cloudinary_public_id 
        FROM puppies 
        WHERE id = ${id}
      `;

      if (oldPuppy.length > 0 && oldPuppy[0].cloudinary_public_id) {
        await deleteImage(oldPuppy[0].cloudinary_public_id);
      }

      updateQuery = sql`
        UPDATE puppies
        SET 
          name = ${name},
          gender = ${gender},
          color = ${color},
          dob = ${dob},
          description = ${description},
          price = ${price},
          status = ${status},
          display_order = ${display_order},
          is_featured = ${is_featured},
          main_image_url = ${req.file.path},
          cloudinary_public_id = ${req.file.filename},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      updateQuery = sql`
        UPDATE puppies
        SET 
          name = ${name},
          gender = ${gender},
          color = ${color},
          dob = ${dob},
          description = ${description},
          price = ${price},
          status = ${status},
          display_order = ${display_order},
          is_featured = ${is_featured},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
    }

    const result = await updateQuery;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Puppy not found' });
    }

    await logActivity(req, 'update_puppy', 'puppies', id, { name });

    res.json({ success: true, puppy: result[0] });
  } catch (error) {
    console.error('Error updating puppy:', error);
    res.status(500).json({ success: false, message: 'Error updating puppy' });
  }
};

// Delete puppy
const deletePuppy = async (req, res) => {
  try {
    const { id } = req.params;

    // Get puppy details and all associated images
    const puppyData = await sql`
      SELECT p.cloudinary_public_id, p.name,
        COALESCE(
          json_agg(pi.cloudinary_public_id) FILTER (WHERE pi.cloudinary_public_id IS NOT NULL),
          '[]'
        ) as image_public_ids
      FROM puppies p
      LEFT JOIN puppy_images pi ON p.id = pi.puppy_id
      WHERE p.id = ${id}
      GROUP BY p.id, p.cloudinary_public_id, p.name
    `;

    if (puppyData.length === 0) {
      return res.status(404).json({ success: false, message: 'Puppy not found' });
    }

    const puppy = puppyData[0];

    // Delete main image from Cloudinary
    if (puppy.cloudinary_public_id) {
      await deleteImage(puppy.cloudinary_public_id);
    }

    // Delete additional images from Cloudinary
    for (const publicId of puppy.image_public_ids) {
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    // Delete from database (cascade will delete puppy_images)
    await sql`DELETE FROM puppies WHERE id = ${id}`;

    await logActivity(req, 'delete_puppy', 'puppies', id, { name: puppy.name });

    res.json({ success: true, message: 'Puppy deleted successfully' });
  } catch (error) {
    console.error('Error deleting puppy:', error);
    res.status(500).json({ success: false, message: 'Error deleting puppy' });
  }
};

// Add image to puppy
const addPuppyImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, display_order } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check if puppy exists
    const puppyExists = await sql`SELECT id FROM puppies WHERE id = ${id}`;
    if (puppyExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Puppy not found' });
    }

    const result = await sql`
      INSERT INTO puppy_images 
      (puppy_id, image_url, cloudinary_public_id, caption, display_order)
      VALUES (${id}, ${req.file.path}, ${req.file.filename}, ${caption}, ${display_order || 0})
      RETURNING *
    `;

    await logActivity(req, 'add_puppy_image', 'puppy_images', result[0].id, { puppy_id: id });

    res.json({ success: true, image: result[0] });
  } catch (error) {
    console.error('Error adding puppy image:', error);
    res.status(500).json({ success: false, message: 'Error adding image' });
  }
};

// Delete puppy image
const deletePuppyImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    // Get image details
    const images = await sql`
      SELECT cloudinary_public_id 
      FROM puppy_images 
      WHERE id = ${imageId} AND puppy_id = ${id}
    `;

    if (images.length === 0) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete from Cloudinary
    if (images[0].cloudinary_public_id) {
      await deleteImage(images[0].cloudinary_public_id);
    }

    // Delete from database
    await sql`DELETE FROM puppy_images WHERE id = ${imageId}`;

    await logActivity(req, 'delete_puppy_image', 'puppy_images', imageId, { puppy_id: id });

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting puppy image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
};

module.exports = {
  getAllPuppies,
  getAvailablePuppies,
  getPuppy,
  createPuppy,
  updatePuppy,
  deletePuppy,
  addPuppyImage,
  deletePuppyImage
};
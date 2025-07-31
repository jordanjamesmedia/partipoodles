const { sql } = require('./database');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create gallery_photos table
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        caption TEXT,
        image_url VARCHAR(500) NOT NULL,
        cloudinary_public_id VARCHAR(255),
        category VARCHAR(100),
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        uploaded_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create puppies table
    await sql`
      CREATE TABLE IF NOT EXISTS puppies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        color VARCHAR(100),
        dob DATE,
        description TEXT,
        price VARCHAR(100),
        status VARCHAR(50) DEFAULT 'available',
        main_image_url VARCHAR(500),
        cloudinary_public_id VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create puppy_images table for multiple images per puppy
    await sql`
      CREATE TABLE IF NOT EXISTS puppy_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        puppy_id UUID REFERENCES puppies(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        cloudinary_public_id VARCHAR(255),
        caption VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create admin_users table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create activity_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES admin_users(id),
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_gallery_photos_active ON gallery_photos(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_puppy_images_puppy_id ON puppy_images(puppy_id)`;

    console.log('Database tables created successfully!');

    // Insert default admin user if not exists
    const bcrypt = require('bcryptjs');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
    
    const existingAdmin = await sql`SELECT id FROM admin_users WHERE username = ${adminUsername}`;
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await sql`
        INSERT INTO admin_users (username, password_hash, email)
        VALUES (${adminUsername}, ${hashedPassword}, 'admin@partipoodles.com')
      `;
      console.log(`Default admin user created: ${adminUsername}`);
      console.log('Please change the default password after first login!');
    }

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase().then(() => {
  console.log('Database setup complete!');
  process.exit(0);
});
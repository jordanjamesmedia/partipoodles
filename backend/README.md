# Parti Poodles Backend

This is the backend system for managing the Stoney Hill Standard Parti Poodles website, including gallery photos and puppy listings.

## Features

- **Admin Dashboard**: Secure login system with activity logging
- **Gallery Management**: Upload, edit, and organize photos
- **Puppy Management**: Add, update, and manage puppy listings with multiple images
- **Cloud Storage**: Images stored on Cloudinary for optimal performance
- **Database**: PostgreSQL database hosted on Neon
- **API Endpoints**: RESTful API for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- Neon PostgreSQL account
- Cloudinary account

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Neon Database
DATABASE_URL=postgresql://username:password@host.neon.tech/database_name?sslmode=require

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Session
SESSION_SECRET=generate_a_secure_random_string

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here

# Server
PORT=3000
NODE_ENV=development
```

### 3. Set Up Neon Database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string and add it to your `.env` file
4. Run the database setup script:

```bash
npm run setup-db
```

This will create all necessary tables and a default admin user.

### 4. Set Up Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to your `.env` file

### 5. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start at `http://localhost:3000`

## Admin Panel Access

1. Navigate to `http://localhost:3000/admin`
2. Login with the credentials set in your `.env` file
3. Default credentials (change these!):
   - Username: `admin`
   - Password: `changeme123`

## API Endpoints

### Public Endpoints (No Authentication Required)

- `GET /api/gallery` - Get all active gallery photos
- `GET /api/puppies` - Get all available puppies
- `GET /api/puppies/:id` - Get specific puppy details

### Admin Endpoints (Authentication Required)

#### Gallery Management
- `POST /admin/api/gallery` - Upload new photo
- `PUT /admin/api/gallery/:id` - Update photo details
- `DELETE /admin/api/gallery/:id` - Delete photo
- `POST /admin/api/gallery/reorder` - Reorder photos

#### Puppy Management
- `GET /admin/api/puppies` - Get all puppies (including unavailable)
- `POST /admin/api/puppies` - Create new puppy
- `PUT /admin/api/puppies/:id` - Update puppy details
- `DELETE /admin/api/puppies/:id` - Delete puppy
- `POST /admin/api/puppies/:id/images` - Add image to puppy
- `DELETE /admin/api/puppies/:id/images/:imageId` - Delete puppy image

## Frontend Integration

To integrate the backend with your frontend:

1. Include the API integration scripts in your HTML:

```html
<!-- For gallery page -->
<script src="js/gallery-api.js"></script>

<!-- For puppies page -->
<script src="js/puppies-api.js"></script>
```

2. Update the API URL in the JavaScript files to match your backend URL:

```javascript
const apiUrl = 'http://localhost:3000/api/gallery'; // Update this
```

3. Ensure CORS is properly configured for your frontend domain.

## Database Schema

### Tables

- `gallery_photos` - Stores gallery images
- `puppies` - Stores puppy information
- `puppy_images` - Additional images for each puppy
- `admin_users` - Admin user accounts
- `activity_logs` - Tracks admin activities

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Activity logging
- CORS protection
- File upload validation
- SQL injection protection

## Deployment

### Deploying to Production

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name parti-poodles-backend
```

3. Set up a reverse proxy with Nginx
4. Enable SSL/TLS certificates
5. Update CORS settings for your production domain

### Environment Variables for Production

Make sure to set secure values for:
- `SESSION_SECRET` - Use a cryptographically secure random string
- `ADMIN_PASSWORD` - Use a strong password
- Database credentials should use SSL connections

## Maintenance

### Backup Database

Neon provides automatic backups, but you can also create manual backups:

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Monitor Cloudinary Usage

Check your Cloudinary dashboard regularly to monitor:
- Storage usage
- Bandwidth consumption
- Transformation credits

### Update Dependencies

Regularly update dependencies for security:

```bash
npm update
npm audit fix
```

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Ensure SSL is enabled (`?sslmode=require`)
- Check Neon dashboard for connection limits

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits (currently 10MB)
- Ensure proper file formats (JPG, PNG, GIF, WebP)

### Session Issues
- Clear browser cookies
- Restart the server
- Check SESSION_SECRET is set

## Support

For issues or questions:
1. Check the logs in the console
2. Verify all environment variables are set
3. Ensure database tables are created (`npm run setup-db`)
4. Check network connectivity to Neon and Cloudinary

## License

This project is private and proprietary to Stoney Hill Standard Parti Poodles.
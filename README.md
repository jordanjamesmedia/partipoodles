# Standard Parti Poodles Australia Website

A modern, SEO-optimized, mobile-responsive website for Standard Parti Poodles Australia, a premium dog breeding business in Mansfield, Victoria.

## Features

- **Mobile-First Responsive Design** - Optimized for all devices
- **SEO Optimized** - Meta tags, structured data, semantic HTML
- **Fast Loading** - Optimized CSS and minimal JavaScript
- **Accessible** - Proper alt tags, semantic markup, keyboard navigation
- **Modern Design** - Clean, professional aesthetic with excellent UX

## Pages

- **Home** (`index.html`) - Hero section, breeder intro, current puppies showcase
- **About** (`about.html`) - Breeder story, experience, health testing, credentials
- **Available Puppies** (`puppies.html`) - Current litter with detailed puppy profiles
- **Gallery** (`gallery.html`) - Photo gallery of puppies, adults, and facilities
- **Contact** (`contact.html`) - Contact form, information, and FAQ

## File Structure

```
/
├── index.html
├── about.html
├── puppies.html
├── gallery.html
├── contact.html
├── css/
│   └── styles.css
├── images/
│   └── [placeholder images]
└── README.md
```

## Deployment to Cloudflare Pages via GitHub

### Step 1: Create GitHub Repository

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Ensure the repository is public or accessible to Cloudflare

### Step 2: Connect to Cloudflare Pages

1. Log in to your Cloudflare account
2. Go to Pages section
3. Click "Create a project"
4. Select "Connect to Git"
5. Choose your GitHub repository
6. Configure build settings:
   - **Framework preset**: None (Static HTML)
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (root)
   - **Root directory**: `/` (root)

### Step 3: Deploy

1. Click "Save and Deploy"
2. Cloudflare will automatically build and deploy your site
3. Your site will be available at `your-project-name.pages.dev`

### Step 4: Custom Domain (Optional)

1. In Cloudflare Pages, go to your project
2. Click "Custom domains"
3. Add your custom domain (e.g., partipoodlesaustralia.com)
4. Update your domain's DNS settings as instructed

## Technical Specifications

- **HTML5** semantic markup
- **CSS3** with Flexbox and Grid
- **Mobile-first** responsive design
- **Schema.org** structured data for SEO
- **Optimized** for Core Web Vitals
- **Accessible** following WCAG guidelines

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Image Requirements

The website is designed to work with the following image types:
- **Hero images**: 1200x600px recommended
- **Puppy photos**: 400x300px recommended
- **Gallery images**: 300x300px recommended
- **Format**: JPG or WebP for best performance

## Content Management

To update content:
1. Edit the HTML files directly
2. Push changes to GitHub
3. Cloudflare Pages will automatically redeploy

## Performance Features

- Optimized CSS with mobile-first approach
- Minimal JavaScript for faster loading
- Responsive images with proper sizing
- Semantic HTML for better SEO
- Optimized meta tags and structured data

## Contact Information

For website updates or technical support, contact the developer or update the files directly in the GitHub repository.

## License

© 2024 Standard Parti Poodles Australia. All rights reserved.

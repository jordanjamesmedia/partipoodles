// Convex Client for Static Sites
// This client fetches data from Convex using HTTP endpoints

// Convex deployment URL - update this if you change deployments
const CONVEX_URL = 'https://dapper-warthog-727.convex.cloud';

// Debug mode - set to true to see console logs
const DEBUG = false;

class ConvexClient {
    constructor(url) {
        this.url = url;
    }

    async query(functionPath, args = {}) {
        const response = await fetch(`${this.url}/api/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: functionPath,
                args: args,
                format: 'json',
            }),
        });

        if (!response.ok) {
            throw new Error(`Convex query failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.value;
    }
}

// Initialize global Convex client
const convex = new ConvexClient(CONVEX_URL);

// Data loading functions
async function loadParentDogs() {
    try {
        const dogs = await convex.query('parentDogs:listActive');
        return dogs || [];
    } catch (error) {
        console.error('Error loading parent dogs:', error);
        return [];
    }
}

async function loadLitters() {
    try {
        const litters = await convex.query('litters:listActive');
        return litters || [];
    } catch (error) {
        console.error('Error loading litters:', error);
        return [];
    }
}

async function loadAllLitters() {
    try {
        const litters = await convex.query('litters:list');
        return litters || [];
    } catch (error) {
        console.error('Error loading litters:', error);
        return [];
    }
}

async function loadPuppies() {
    try {
        const puppies = await convex.query('puppies:list');
        return puppies || [];
    } catch (error) {
        console.error('Error loading puppies:', error);
        return [];
    }
}

async function loadAvailablePuppies() {
    try {
        const puppies = await convex.query('puppies:listAvailable');
        return puppies || [];
    } catch (error) {
        console.error('Error loading puppies:', error);
        return [];
    }
}

async function loadGalleryPhotos() {
    try {
        const photos = await convex.query('galleryPhotos:listPublic');
        return photos || [];
    } catch (error) {
        console.error('Error loading gallery photos:', error);
        return [];
    }
}

async function loadInquiries() {
    try {
        const inquiries = await convex.query('inquiries:list');
        return inquiries || [];
    } catch (error) {
        console.error('Error loading inquiries:', error);
        return [];
    }
}

// UI Rendering functions
function renderPuppyCard(puppy) {
    const statusClass = puppy.status || 'available';
    const statusText = (puppy.status || 'available').toUpperCase();
    const price = puppy.price_min && puppy.price_max 
        ? `$${puppy.price_min} - $${puppy.price_max}` 
        : 'Contact for price';
    
    // Use first photo or placeholder
    const image = puppy.photos && puppy.photos.length > 0 
        ? puppy.photos[0] 
        : 'images/placeholder-puppy.jpg';
    
    return `
        <article class="puppy-card">
            <img src="${image}" alt="${puppy.name} - ${puppy.color} ${puppy.gender}">
            <div class="puppy-info">
                <h3>${puppy.name} - ${puppy.color} ${puppy.gender === 'male' ? 'Boy' : 'Girl'}</h3>
                <div class="puppy-meta">
                    <span><strong>DOB:</strong> ${formatDate(puppy.litter_date_of_birth)}</span>
                    <span><strong>Gender:</strong> ${capitalize(puppy.gender)}</span>
                </div>
                <p>${puppy.description || 'A beautiful Standard Parti Poodle puppy.'}</p>
                <div class="price">${price}</div>
                <a href="contact.html?puppy=${encodeURIComponent(puppy.name)}" class="btn">Inquire About ${puppy.name}</a>
            </div>
        </article>
    `;
}

function renderParentDogCard(dog) {
    const image = dog.photos && dog.photos.length > 0 
        ? dog.photos[0] 
        : 'images/placeholder-dog.jpg';
    
    return `
        <div class="card">
            <h3>${dog.gender === 'female' ? 'Dam (Mother)' : 'Sire (Father)'} - ${dog.name}</h3>
            ${dog.registered_name ? `<p><strong>Registered Name:</strong> ${dog.registered_name}</p>` : ''}
            <p><strong>Color:</strong> ${dog.color || 'Unknown'}</p>
            ${dog.health_testing ? `<p><strong>Health Testing:</strong> ${dog.health_testing}</p>` : ''}
            ${dog.description ? `<p><strong>Temperament:</strong> ${dog.description}</p>` : ''}
        </div>
    `;
}

function renderGalleryItem(photo) {
    const caption = photo.caption || photo.puppy_name || 'Gallery Photo';
    return `
        <div class="gallery-item">
            <img src="${photo.url}" alt="${caption}" loading="lazy">
            <div class="caption">${caption}</div>
        </div>
    `;
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-AU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch {
        return dateString;
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Page initialization functions
async function initPuppiesPage() {
    const puppiesContainer = document.getElementById('puppies-container');
    const parentsContainer = document.getElementById('parents-container');
    
    if (puppiesContainer) {
        puppiesContainer.innerHTML = '<p>Loading puppies...</p>';
        try {
            const puppies = await loadPuppies();
            if (puppies.length > 0) {
                puppiesContainer.innerHTML = puppies.map(renderPuppyCard).join('');
            } else {
                puppiesContainer.innerHTML = '<p>No puppies currently available. Please check back soon or contact us for upcoming litters.</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            puppiesContainer.innerHTML = '<p>Unable to load puppies. Please refresh the page or contact us directly.</p>';
        }
    }
    
    if (parentsContainer) {
        try {
            const dogs = await loadParentDogs();
            if (dogs.length > 0) {
                // Separate dams and sires
                const dams = dogs.filter(d => d.gender === 'female');
                const sires = dogs.filter(d => d.gender === 'male');
                parentsContainer.innerHTML = [...dams, ...sires].map(renderParentDogCard).join('');
            }
        } catch (error) {
            console.error('Error loading parents:', error);
        }
    }
}

async function initGalleryPage() {
    const galleryContainer = document.getElementById('gallery-container');
    
    if (galleryContainer) {
        galleryContainer.innerHTML = '<p>Loading gallery...</p>';
        try {
            const photos = await loadGalleryPhotos();
            if (photos.length > 0) {
                galleryContainer.innerHTML = photos.map(renderGalleryItem).join('');
            } else {
                galleryContainer.innerHTML = '<p>Gallery photos coming soon!</p>';
            }
        } catch (error) {
            console.error('Error:', error);
            galleryContainer.innerHTML = '<p>Unable to load gallery. Please refresh the page.</p>';
        }
    }
}

async function initHomePage() {
    // Load featured puppies for homepage
    const featuredContainer = document.getElementById('featured-puppies');
    
    if (featuredContainer) {
        try {
            const puppies = await loadAvailablePuppies();
            if (puppies.length > 0) {
                // Show up to 3 featured puppies
                const featured = puppies.slice(0, 3);
                featuredContainer.innerHTML = featured.map(renderPuppyCard).join('');
            }
        } catch (error) {
            console.error('Error loading featured puppies:', error);
        }
    }
}

// Auto-initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('puppies')) {
        initPuppiesPage();
    } else if (path.includes('gallery')) {
        initGalleryPage();
    } else if (path === '/' || path.includes('index')) {
        initHomePage();
    }
});

// Export for use in other scripts
window.ConvexClient = ConvexClient;
window.convex = convex;
window.loadParentDogs = loadParentDogs;
window.loadLitters = loadLitters;
window.loadPuppies = loadPuppies;
window.loadGalleryPhotos = loadGalleryPhotos;

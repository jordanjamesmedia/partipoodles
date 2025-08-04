// CMS Data Loader
// This script loads content from the CMS data files

class CMSLoader {
    constructor() {
        this.puppies = [];
        this.gallery = [];
        this.settings = {};
    }

    async loadPuppyData() {
        try {
            // In a real implementation, this would fetch from the CMS API
            // For now, we'll use the static data files
            const response = await fetch('/_data/puppies/red-boy-rocket.md');
            if (response.ok) {
                const text = await response.text();
                // Parse the markdown front matter
                this.parsePuppyData(text);
            }
        } catch (error) {
            console.error('Error loading puppy data:', error);
        }
    }

    parsePuppyData(markdownText) {
        // Extract YAML front matter
        const frontMatterMatch = markdownText.match(/^---\n([\s\S]*?)\n---/);
        if (frontMatterMatch) {
            try {
                // Parse YAML (simplified - in production use a proper YAML parser)
                const yamlText = frontMatterMatch[1];
                const puppy = this.parseYAML(yamlText);
                this.puppies.push(puppy);
            } catch (error) {
                console.error('Error parsing puppy data:', error);
            }
        }
    }

    parseYAML(yamlText) {
        const lines = yamlText.split('\n');
        const data = {};
        
        for (let line of lines) {
            if (line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                
                // Remove quotes if present
                const cleanValue = value.replace(/^["']|["']$/g, '');
                data[key.trim()] = cleanValue;
            }
        }
        
        return data;
    }

    updatePuppiesDisplay() {
        // Update the puppies section with CMS data
        const puppiesSection = document.querySelector('.available-puppies');
        if (puppiesSection && this.puppies.length > 0) {
            // Update with real data from CMS
            this.renderPuppies();
        }
    }

    renderPuppies() {
        const container = document.querySelector('.puppy-grid');
        if (!container) return;

        container.innerHTML = ''; // Clear existing content

        this.puppies.forEach(puppy => {
            const puppyCard = this.createPuppyCard(puppy);
            container.appendChild(puppyCard);
        });
    }

    createPuppyCard(puppy) {
        const card = document.createElement('div');
        card.className = 'puppy-card';
        
        card.innerHTML = `
            <div class="puppy-image">
                <img src="${puppy.featured_image}" alt="${puppy.name}" loading="lazy">
                <div class="puppy-status ${puppy.status}">${puppy.status.toUpperCase()}</div>
            </div>
            <div class="puppy-info">
                <h3>${puppy.name}</h3>
                <div class="puppy-details">
                    <span class="gender">${puppy.gender}</span>
                    <span class="color">${puppy.color}</span>
                    <span class="price">${puppy.price}</span>
                </div>
                <p class="puppy-description">${puppy.description}</p>
                <button class="btn-primary puppy-details-btn" onclick="showPuppyDetails('${puppy.name}')">
                    View Details
                </button>
            </div>
        `;
        
        return card;
    }

    // Initialize the CMS loader
    init() {
        this.loadPuppyData().then(() => {
            this.updatePuppiesDisplay();
        });
    }
}

// Global function for puppy details
function showPuppyDetails(puppyName) {
    // This would open a modal or navigate to a detail page
    alert(`Showing details for ${puppyName}. This would open a detailed view in the full implementation.`);
}

// Add admin login button
function addAdminButton() {
    const adminBtn = document.createElement('div');
    adminBtn.innerHTML = `
        <button id="admin-login-btn" style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2D5A27;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
            z-index: 1000;
        " onclick="openAdmin()">Admin Login</button>
    `;
    document.body.appendChild(adminBtn);
}

// Open admin panel
function openAdmin() {
    if (window.netlifyIdentity) {
        window.netlifyIdentity.open();
    } else {
        window.location.href = '/admin/';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cmsLoader = new CMSLoader();
    cmsLoader.init();
    addAdminButton();
});
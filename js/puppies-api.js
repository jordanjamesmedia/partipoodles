// Puppies API Integration
document.addEventListener('DOMContentLoaded', async function() {
    const apiUrl = 'http://localhost:3000/api/puppies'; // Update this to your backend URL
    const puppiesGrid = document.querySelector('.puppies-grid');
    
    // Show loading state
    if (puppiesGrid) {
        puppiesGrid.innerHTML = '<div class="loading-message">Loading available puppies...</div>';
        
        try {
            // Fetch puppies from API
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.puppies && data.puppies.length > 0) {
                // Clear loading message
                puppiesGrid.innerHTML = '';
                
                // Display puppies
                data.puppies.forEach(puppy => {
                    const puppyCard = document.createElement('article');
                    puppyCard.className = 'puppy-card';
                    
                    // Format date of birth
                    let dobText = '';
                    if (puppy.dob) {
                        const dob = new Date(puppy.dob);
                        dobText = dob.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    }
                    
                    // Use main image or first additional image
                    const mainImage = puppy.main_image_url || (puppy.images && puppy.images[0]?.image_url) || 'images/placeholder-puppy.jpg';
                    
                    puppyCard.innerHTML = `
                        <img src="${mainImage}" alt="${puppy.name}">
                        <div class="puppy-info">
                            <h3>${puppy.name}${puppy.color ? ' - ' + puppy.color : ''}</h3>
                            <div class="puppy-meta">
                                ${dobText ? `<span><strong>DOB:</strong> ${dobText}</span>` : ''}
                                <span><strong>Gender:</strong> ${puppy.gender}</span>
                            </div>
                            <p>${puppy.description || 'This adorable puppy is looking for a loving home!'}</p>
                            <div class="price">${puppy.price || 'Contact for price'}</div>
                            <a href="contact.html?puppy=${encodeURIComponent(puppy.name.toLowerCase())}" class="btn">Inquire About ${puppy.name}</a>
                        </div>
                    `;
                    
                    // Add featured badge if applicable
                    if (puppy.is_featured) {
                        const badge = document.createElement('div');
                        badge.className = 'featured-badge';
                        badge.innerHTML = '<i class="fas fa-star"></i> Featured';
                        puppyCard.appendChild(badge);
                    }
                    
                    puppiesGrid.appendChild(puppyCard);
                });
                
                // Add lightbox functionality for puppy images
                initializePuppyLightbox();
            } else {
                puppiesGrid.innerHTML = `
                    <div class="no-puppies-message">
                        <h3>No puppies available at this time</h3>
                        <p>Please check back soon or contact us to join our waiting list!</p>
                        <a href="contact.html" class="btn">Contact Us</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading puppies:', error);
            puppiesGrid.innerHTML = `
                <div class="error-message">
                    <h3>Unable to load puppies</h3>
                    <p>Please try again later or contact us directly.</p>
                    <a href="contact.html" class="btn">Contact Us</a>
                </div>
            `;
        }
    }
});

// Initialize lightbox for puppy images
function initializePuppyLightbox() {
    const puppyImages = document.querySelectorAll('.puppy-card img');
    
    puppyImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                cursor: pointer;
            `;
            
            const lightboxImg = document.createElement('img');
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 40px;
                background: transparent;
                color: white;
                border: none;
                font-size: 40px;
                cursor: pointer;
            `;
            
            // Close on click
            lightbox.onclick = () => lightbox.remove();
            closeBtn.onclick = () => lightbox.remove();
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            lightbox.appendChild(lightboxImg);
            lightbox.appendChild(closeBtn);
            document.body.appendChild(lightbox);
        });
    });
}

// Add custom styles for API-loaded content
const style = document.createElement('style');
style.textContent = `
    .loading-message, .error-message, .no-puppies-message {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
    }
    
    .error-message h3, .no-puppies-message h3 {
        color: var(--primary-color);
        margin-bottom: 1rem;
    }
    
    .featured-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--accent-color);
        color: var(--primary-color);
        padding: 5px 10px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .puppy-card {
        position: relative;
    }
`;
document.head.appendChild(style);
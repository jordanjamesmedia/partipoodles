// Gallery API Integration
document.addEventListener('DOMContentLoaded', async function() {
    const apiUrl = 'http://localhost:3000/api/gallery'; // Update this to your backend URL
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // Show loading state
    if (galleryGrid) {
        galleryGrid.innerHTML = '<div class="loading-message">Loading gallery photos...</div>';
        
        try {
            // Fetch photos from API
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.success && data.photos && data.photos.length > 0) {
                // Clear loading message
                galleryGrid.innerHTML = '';
                
                // Group photos by category if needed
                const photosByCategory = {};
                data.photos.forEach(photo => {
                    const category = photo.category || 'Uncategorized';
                    if (!photosByCategory[category]) {
                        photosByCategory[category] = [];
                    }
                    photosByCategory[category].push(photo);
                });
                
                // Display photos
                data.photos.forEach(photo => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.innerHTML = `
                        <img src="${photo.image_url}" alt="${photo.title}">
                        <div class="caption">${photo.caption || photo.title}</div>
                    `;
                    galleryGrid.appendChild(galleryItem);
                });
                
                // Reinitialize lightbox for dynamic content
                initializeLightbox();
            } else {
                galleryGrid.innerHTML = '<div class="no-photos-message">No photos available at this time.</div>';
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            galleryGrid.innerHTML = '<div class="error-message">Error loading gallery photos. Please try again later.</div>';
        }
    }
});

// Reinitialize lightbox functionality for dynamically loaded images
function initializeLightbox() {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item img'));
    let currentLightboxIndex = 0;
    
    function createLightbox(startIndex) {
        currentLightboxIndex = startIndex;
        
        // Create lightbox overlay
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        // Create content container
        const container = document.createElement('div');
        container.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create image
        const img = document.createElement('img');
        img.src = galleryItems[currentLightboxIndex].src;
        img.style.cssText = `
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
        `;
        
        // Create navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.style.cssText = `
            position: absolute;
            left: -50px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255,255,255,0.1);
            color: white;
            border: none;
            font-size: 30px;
            padding: 10px 15px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.3s;
        `;
        prevBtn.onmouseover = () => prevBtn.style.background = 'rgba(255,255,255,0.2)';
        prevBtn.onmouseout = () => prevBtn.style.background = 'rgba(255,255,255,0.1)';
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.style.cssText = prevBtn.style.cssText;
        nextBtn.style.left = 'auto';
        nextBtn.style.right = '-50px';
        
        // Create close button
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
            padding: 0;
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
        `;
        
        // Create caption
        const caption = document.createElement('div');
        caption.style.cssText = `
            position: absolute;
            bottom: -40px;
            left: 0;
            right: 0;
            text-align: center;
            color: white;
            font-size: 16px;
            padding: 10px;
        `;
        const captionText = galleryItems[currentLightboxIndex].nextElementSibling?.textContent || '';
        caption.textContent = captionText;
        
        // Navigation functions
        function showImage(index) {
            if (index < 0) index = galleryItems.length - 1;
            if (index >= galleryItems.length) index = 0;
            currentLightboxIndex = index;
            img.src = galleryItems[currentLightboxIndex].src;
            const newCaption = galleryItems[currentLightboxIndex].nextElementSibling?.textContent || '';
            caption.textContent = newCaption;
        }
        
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            showImage(currentLightboxIndex - 1);
        };
        
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            showImage(currentLightboxIndex + 1);
        };
        
        // Close lightbox
        function closeLightbox() {
            lightbox.remove();
            document.removeEventListener('keydown', handleKeyboard);
        }
        
        closeBtn.onclick = closeLightbox;
        lightbox.onclick = (e) => {
            if (e.target === lightbox) closeLightbox();
        };
        
        // Keyboard navigation
        function handleKeyboard(e) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showImage(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentLightboxIndex + 1);
        }
        document.addEventListener('keydown', handleKeyboard);
        
        // Touch navigation for mobile
        let touchStartX = 0;
        img.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        img.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    showImage(currentLightboxIndex + 1);
                } else {
                    showImage(currentLightboxIndex - 1);
                }
            }
        });
        
        // Assemble lightbox
        container.appendChild(img);
        container.appendChild(prevBtn);
        container.appendChild(nextBtn);
        container.appendChild(caption);
        lightbox.appendChild(container);
        lightbox.appendChild(closeBtn);
        document.body.appendChild(lightbox);
    }
    
    // Add click handlers to gallery images
    galleryItems.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => createLightbox(index));
    });
}
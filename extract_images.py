#!/usr/bin/env python3
"""
Image extraction script for Standard Parti Poodles Australia
Downloads images from the current website and organizes them for the new site
"""

import requests
import os
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import time

def download_image(url, filepath):
    """Download an image from URL to filepath"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"✅ Downloaded: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"❌ Failed to download {url}: {str(e)}")
        return False

def extract_images_from_website():
    """Extract all images from the current website"""
    base_url = "https://partipoodlesaustralia.com"
    images_dir = "images"
    
    # Create images directory if it doesn't exist
    os.makedirs(images_dir, exist_ok=True)
    
    # Pages to scrape
    pages = [
        ("", "homepage"),
        ("/gallery", "gallery")
    ]
    
    all_image_urls = set()
    
    for page_path, page_name in pages:
        print(f"\n🔍 Scraping {page_name}...")
        url = base_url + page_path
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all img tags
            img_tags = soup.find_all('img')
            print(f"Found {len(img_tags)} image tags")
            
            for img in img_tags:
                src = img.get('src') or img.get('data-src')
                if src:
                    # Convert relative URLs to absolute
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        src = base_url + src
                    elif not src.startswith('http'):
                        src = urljoin(url, src)
                    
                    # Skip very small images (likely icons)
                    if any(skip in src.lower() for skip in ['icon', 'logo', 'favicon']):
                        continue
                        
                    all_image_urls.add(src)
                    
        except Exception as e:
            print(f"❌ Error scraping {page_name}: {str(e)}")
    
    print(f"\n📊 Found {len(all_image_urls)} unique images to download")
    
    # Download images
    downloaded_count = 0
    for i, img_url in enumerate(all_image_urls, 1):
        # Get file extension
        parsed_url = urlparse(img_url)
        filename = os.path.basename(parsed_url.path)
        
        if not filename or not any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']):
            filename = f"image_{i}.jpg"
        
        # Clean filename
        filename = filename.replace(' ', '_').replace('%20', '_')
        filepath = os.path.join(images_dir, filename)
        
        print(f"\n📥 Downloading {i}/{len(all_image_urls)}: {filename}")
        if download_image(img_url, filepath):
            downloaded_count += 1
        
        # Be respectful - small delay between downloads
        time.sleep(0.5)
    
    print(f"\n🎉 Successfully downloaded {downloaded_count}/{len(all_image_urls)} images!")
    print(f"Images saved to: {os.path.abspath(images_dir)}")
    
    # Create a mapping file
    create_image_mapping(images_dir)

def create_image_mapping(images_dir):
    """Create a mapping file to help organize images"""
    mapping_content = """# Image Organization Guide

## Downloaded Images
The following images have been downloaded from your website:

"""
    
    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    image_files.sort()
    
    for filename in image_files:
        mapping_content += f"- {filename}\n"
    
    mapping_content += """

## Recommended Renaming
To integrate with your new website, consider renaming these images to:

### Current Litter (Anzac Day 2024)
- black-white-female-1.jpg
- black-white-female-2.jpg  
- black-white-female-3.jpg
- black-white-female-4.jpg
- brown-white-female.jpg
- black-white-male.jpg

### Parent Dogs
- dam-adelaide.jpg (mother)
- sire-windsor.jpg (father)

### Gallery Images
- current-litter-1.jpg through current-litter-6.jpg
- adult-1.jpg through adult-6.jpg
- past-litter-1.jpg through past-litter-6.jpg
- facility-1.jpg through facility-6.jpg

## Next Steps
1. Review the downloaded images
2. Rename the relevant puppy photos to match the names above
3. Refresh your website to see the images appear!
"""
    
    with open('IMAGE_MAPPING.md', 'w') as f:
        f.write(mapping_content)
    
    print(f"📝 Created IMAGE_MAPPING.md with organization guide")

if __name__ == "__main__":
    print("🐩 Standard Parti Poodles Australia - Image Extractor")
    print("=" * 50)
    extract_images_from_website()
